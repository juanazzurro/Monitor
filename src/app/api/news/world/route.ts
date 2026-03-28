import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import type { NewsItem, WorldNewsResponse } from "@/types/news";

export const revalidate = 120;

interface FeedSource {
  url: string;
  name: string;
}

const FEEDS: FeedSource[] = [
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", name: "ALJAZEERA" },
  { url: "https://www.reutersagency.com/feed/?best-topics=world&post_type=best", name: "REUTERS" },
  { url: "https://www.france24.com/en/rss", name: "FRANCE24" },
  { url: "https://feeds.bloomberg.com/markets/news.rss", name: "BLOOMBERG" },
  { url: "https://rsshub.app/apnews/topics/apf-topnews", name: "AP" },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a: string, b: string): number {
  const arrA = normalizeTitle(a).split(" ");
  const arrB = normalizeTitle(b).split(" ");
  const setB = new Set(arrB);
  const intersection = arrA.filter((w) => setB.has(w)).length;
  const unionSet = new Set(arrA.concat(arrB));
  return unionSet.size === 0 ? 0 : intersection / unionSet.size;
}

function parseDate(raw: string | undefined): Date {
  if (!raw) return new Date(0);
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? new Date(0) : parsed;
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

    // RSS 2.0 items
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

function deduplicateByTitle(items: NewsItem[]): NewsItem[] {
  const kept: NewsItem[] = [];

  for (const item of items) {
    const isDuplicate = kept.some((k) => similarity(k.title, item.title) > 0.6);
    if (!isDuplicate) kept.push(item);
  }

  return kept;
}

export async function GET() {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const allItems: NewsItem[] = results.flatMap((r) =>
    r.status === "fulfilled" ? r.value : []
  );

  // Sort by date descending
  allItems.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Deduplicate similar headlines
  const unique = deduplicateByTitle(allItems);

  // Return top 25
  const response: WorldNewsResponse = {
    items: unique.slice(0, 25),
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
