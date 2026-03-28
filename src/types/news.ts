export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  link: string;
}

export interface WorldNewsResponse {
  items: NewsItem[];
  fetchedAt: string;
}

export interface ArgentinaNewsItem extends NewsItem {
  tags: string[];
  priority: "HIGH" | "NORMAL";
}

export interface ArgentinaNewsResponse {
  items: ArgentinaNewsItem[];
  fetchedAt: string;
}
