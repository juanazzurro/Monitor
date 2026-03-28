import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import type { NewsItem, ArgentinaNewsItem, ArgentinaNewsResponse } from "@/types/news";

export const revalidate = 120;

interface FeedSource {
  url: string;
  name: string;
}

const FEEDS: FeedSource[] = [
  { url: "https://www.ambito.com/rss/economia.xml", name: "AMBITO" },
  { url: "https://www.cronista.com/files/rss/economia.xml", name: "CRONISTA" },
  { url: "https://www.infobae.com/feeds/rss/economia/", name: "INFOBAE" },
  { url: "https://www.baenegocios.com/feed/rss.xml", name: "BAE" },
];

const KEYWORDS: Record<string, string> = {
  "dólar": "DÓLAR",
  "dolar": "DÓLAR",
  "blue": "DÓLAR",
  "mep": "DÓLAR",
  "ccl": "DÓLAR",
  "bonos": "BONOS",
  "bono": "BONOS",
  "inflación": "INFLACIÓN",
  "inflacion": "INFLACIÓN",
  "ipc": "INFLACIÓN",
  "bcra": "BCRA",
  "banco central": "BCRA",
  "caputo": "CAPUTO",
  "fmi": "FMI",
  "reservas": "RESERVAS",
  "riesgo país": "RIESGO PAÍS",
  "riesgo pais": "RIESGO PAÍS",
  "licitación": "LICITACIÓN",
  "licitacion": "LICITACIÓN",
  "lecap": "LECAP",
  "bopreal": "BOPREAL",
  "deuda": "DEUDA",
  "superávit": "SUPERÁVIT",
  "superavit": "SUPERÁVIT",
  "déficit": "DÉFICIT",
  "deficit": "DÉFICIT",
  "tarifas": "TARIFAS",
  "retenciones": "RETENCIONES",
  "cepo": "CEPO",
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function parseDate(raw: string | undefined): Date {
  if (!raw) return new Date(0);
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function matchKeywords(title: string): string[] {
  const lower = title.toLowerCase();
  const matched = new Set<string>();

  for (const [keyword, tag] of Object.entries(KEYWORDS)) {
    if (lower.includes(keyword)) {
      matched.add(tag);
    }
  }

  return Array.from(matched);
}

async function fetchFeed(source: FeedSource): Promise<NewsItem[]> {
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const parsed = parser.parse(xml);

    const channel = parsed.rss?.channel ?? parsed.feed;
    if (!channel) return [];

    let rawItems = channel.item ?? channel.entry ?? [];
    if (!Array.isArray(rawItems)) rawItems = [rawItems];

    return rawItems.map((item: Record<string, unknown>): NewsItem => {
      const title = (typeof item.title === "string"
        ? item.title
        : (item.title as Record<string, unknown>)?.["#text"] ?? "") as string;

      const link = (typeof item.link === "string"
        ? item.link
        : (item.link as Record<string, unknown>)?.["@_href"] ?? "") as string;

      const pubDate = (item.pubDate ?? item.published ?? item.updated ?? "") as string;
      const date = parseDate(pubDate);

      return {
        id: `${source.name}-${date.getTime()}-${title.slice(0, 30)}`,
        title: title.trim(),
        source: source.name,
        timestamp: date.toISOString(),
        link,
      };
    });
  } catch {
    return [];
  }
}

function similarity(a: string, b: string): number {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-záéíóúñü0-9\s]/g, "").replace(/\s+/g, " ").trim();
  const arrA = normalize(a).split(" ");
  const arrB = normalize(b).split(" ");
  const setB = new Set(arrB);
  const intersection = arrA.filter((w) => setB.has(w)).length;
  const unionSet = new Set(arrA.concat(arrB));
  return unionSet.size === 0 ? 0 : intersection / unionSet.size;
}

export async function GET() {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const allItems: NewsItem[] = results.flatMap((r) =>
    r.status === "fulfilled" ? r.value : []
  );

  // Filter by keyword match
  const tagged: ArgentinaNewsItem[] = [];
  for (const item of allItems) {
    const tags = matchKeywords(item.title);
    if (tags.length === 0) continue;
    tagged.push({
      ...item,
      tags,
      priority: tags.length > 1 ? "HIGH" : "NORMAL",
    });
  }

  // Sort: HIGH priority first, then by date descending
  tagged.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority === "HIGH" ? -1 : 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Deduplicate
  const kept: ArgentinaNewsItem[] = [];
  for (const item of tagged) {
    const isDuplicate = kept.some((k) => similarity(k.title, item.title) > 0.6);
    if (!isDuplicate) kept.push(item);
  }

  const response: ArgentinaNewsResponse = {
    items: kept.slice(0, 25),
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
