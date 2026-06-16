export type Category = "Politics & World" | "Technology" | "Finance & Corporate" | "Sports";

export interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  imageUrl: string | null;
  publishedAt: string;
  category: Category;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  city: string;
  country: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  "Politics & World",
  "Technology",
  "Finance & Corporate",
  "Sports",
];
