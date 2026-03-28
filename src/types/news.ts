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
