import { promises as fs } from "node:fs";
import path from "node:path";

const VALID_SIZES = new Set(["sm", "md", "lg", "xl"] as const);
const VALID_CATEGORIES = new Set([
  "markets",
  "news",
  "argentina",
  "crypto",
  "custom",
] as const);

type WidgetSize = "sm" | "md" | "lg" | "xl";
type WidgetCategory = "markets" | "news" | "argentina" | "crypto" | "custom";

function parseArgs(argv: string[]) {
  const params: Record<string, string> = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    params[key] = value;
    i += 1;
  }

  return params;
}

function toPascalCase(input: string): string {
  return input
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join("");
}

function toKebabCase(input: string): string {
  return input
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function toTitleFromPascalCase(input: string): string {
  return input.replace(/([a-z\d])([A-Z])/g, "$1 $2").toUpperCase();
}

async function ensureFileDoesNotExist(filePath: string) {
  try {
    await fs.access(filePath);
    throw new Error(`File already exists: ${filePath}`);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const rawName = args.name;
  if (!rawName) {
    throw new Error("Missing required argument: --name");
  }

  const componentName = toPascalCase(rawName);
  if (!componentName) {
    throw new Error("Invalid --name. Use letters and numbers.");
  }

  const size = (args.size ?? "md") as WidgetSize;
  const category = (args.category ?? "custom") as WidgetCategory;

  if (!VALID_SIZES.has(size)) {
    throw new Error(`Invalid --size '${size}'. Valid values: sm, md, lg, xl`);
  }

  if (!VALID_CATEGORIES.has(category)) {
    throw new Error(
      `Invalid --category '${category}'. Valid values: markets, news, argentina, crypto, custom`
    );
  }

  const widgetId = toKebabCase(componentName);
  const widgetTitle = toTitleFromPascalCase(componentName);

  const root = process.cwd();
  const componentPath = path.join(
    root,
    "src/app/components/widgets",
    `${componentName}.tsx`
  );
  const routePath = path.join(root, "src/app/api", widgetId, "route.ts");
  const registryPath = path.join(root, "src/config/widgets.ts");

  await ensureFileDoesNotExist(componentPath);
  await ensureFileDoesNotExist(routePath);

  const componentTemplate = `"use client";

import useSWR from "swr";

const fetcher = (url: string): Promise<{ ok: boolean; timestamp: string }> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return res.json();
  });

export default function ${componentName}() {
  const { data, error, isLoading } = useSWR("/api/${widgetId}", fetcher, {
    refreshInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <span
          className="text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "var(--hud-text-dim)" }}
        >
          INITIALIZING ${widgetTitle}...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <span
          className="text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "var(--hud-red)" }}
        >
          ${widgetTitle} OFFLINE
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between p-3">
      <span
        className="text-[9px] tracking-[0.25em] uppercase"
        style={{ color: "var(--hud-text-dim)" }}
      >
        ${widgetTitle}
      </span>
      <span
        className="text-sm tracking-wider"
        style={{ color: "var(--hud-text)" }}
      >
        READY · {data?.ok ? "DATA LINKED" : "NO DATA"}
      </span>
      <span
        className="text-[8px] tracking-widest"
        style={{ color: "var(--hud-text-dim)" }}
      >
        LAST UPDATE: {data?.timestamp ?? "--"}
      </span>
    </div>
  );
}
`;

  const routeTemplate = `import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "TODO: implement ${widgetTitle} data feed",
    timestamp: new Date().toISOString(),
  });
}
`;

  await fs.mkdir(path.dirname(componentPath), { recursive: true });
  await fs.writeFile(componentPath, componentTemplate, "utf8");

  await fs.mkdir(path.dirname(routePath), { recursive: true });
  await fs.writeFile(routePath, routeTemplate, "utf8");

  const registryRaw = await fs.readFile(registryPath, "utf8");

  if (registryRaw.includes(`id: "${widgetId}"`)) {
    throw new Error(`Widget id '${widgetId}' already exists in registry.`);
  }

  if (registryRaw.includes(`import ${componentName} from`)) {
    throw new Error(`Import for '${componentName}' already exists in registry.`);
  }

  const importAnchor = /export const WIDGET_SIZE_CLASS/;
  const importStatement = `import ${componentName} from "@/app/components/widgets/${componentName}";\n`;

  if (!importAnchor.test(registryRaw)) {
    throw new Error("Could not find import insertion point in src/config/widgets.ts");
  }

  const withImport = registryRaw.replace(importAnchor, `${importStatement}\nexport const WIDGET_SIZE_CLASS`);

  const widgetEntry = `  {\n    id: "${widgetId}",\n    title: "${widgetTitle}",\n    size: "${size}",\n    refreshInterval: 60000,\n    component: ${componentName},\n    category: "${category}",\n  },\n`;

  const listAnchor = /\n\];\s*$/;
  if (!listAnchor.test(withImport)) {
    throw new Error("Could not find widgets array ending in src/config/widgets.ts");
  }

  const withWidget = withImport.replace(listAnchor, `\n${widgetEntry}];\n`);
  await fs.writeFile(registryPath, withWidget, "utf8");

  console.log(`Created component: ${path.relative(root, componentPath)}`);
  console.log(`Created route: ${path.relative(root, routePath)}`);
  console.log(`Updated registry: ${path.relative(root, registryPath)}`);
  console.log(`Widget id: ${widgetId}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`new-widget error: ${message}`);
  process.exit(1);
});
