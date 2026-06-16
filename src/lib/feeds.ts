import Parser from "rss-parser";
import type { Article, Category } from "./types";

interface FeedConfig {
  url: string;
  source: string;
  category: Category;
}

const FEEDS: FeedConfig[] = [
  // Politics & World
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml", source: "NY Times", category: "Politics & World" },
  { url: "http://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC", category: "Politics & World" },
  { url: "https://feeds.npr.org/1001/rss.xml", source: "NPR", category: "Politics & World" },
  { url: "https://www.cbc.ca/webfeed/rss/rss-politics", source: "CBC News", category: "Politics & World" },
  { url: "https://www.theguardian.com/world/rss", source: "The Guardian", category: "Politics & World" },
  { url: "https://abcnews.go.com/abcnews/politicsheadlines", source: "ABC News", category: "Politics & World" },

  // Technology
  { url: "https://www.theverge.com/rss/index.xml", source: "The Verge", category: "Technology" },
  { url: "https://techcrunch.com/feed/", source: "TechCrunch", category: "Technology" },
  { url: "https://feeds.arstechnica.com/arstechnica/index", source: "Ars Technica", category: "Technology" },
  { url: "https://www.wired.com/feed/rss", source: "Wired", category: "Technology" },

  // Finance & Corporate
  { url: "https://seekingalpha.com/feed.xml", source: "Seeking Alpha", category: "Finance & Corporate" },
  { url: "https://www.investing.com/rss/news_1.rss", source: "Investing.com", category: "Finance & Corporate" },
  { url: "https://www.federalreserve.gov/feeds/press_all.xml", source: "Federal Reserve", category: "Finance & Corporate" },
  { url: "https://economictimes.indiatimes.com/markets/rssfeeds/2146842.cms", source: "Economic Times", category: "Finance & Corporate" },

  // Sports
  { url: "https://sports.yahoo.com/rss/", source: "Yahoo Sports", category: "Sports" },
  { url: "https://feeds.bbci.co.uk/sport/rss.xml", source: "BBC Sport", category: "Sports" },
  { url: "https://www.skysports.com/rss/12040", source: "Sky Sports", category: "Sports" },
  { url: "https://www.cbssports.com/rss/headlines/", source: "CBS Sports", category: "Sports" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function cleanHtml(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#\d+;/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
    .trim();
}

function detectPublisher(feedTitle: string, configuredSource: string): string {
  const name = feedTitle || "";
  if (name.includes("NYT") && configuredSource.includes("NY")) return "NY Times";
  return configuredSource;
}

function extractUniversalImage(item: Parser.Item & Record<string, unknown>): string | null {
  try {
    // 1. Standard RSS Enclosure
    if (item.enclosure && typeof item.enclosure === "object" && "url" in item.enclosure) {
      if (item.enclosure.type && typeof item.enclosure.type === "string" && item.enclosure.type.startsWith("image")) {
        return item.enclosure.url;
      }
    }

    // 2. Media namespaces
    const mediaKeys = ["media:content", "media:thumbnail", "media:group", "media:player"];
    for (const key of mediaKeys) {
      const data = item[key] as unknown;
      if (data) {
        if (Array.isArray(data) && data.length > 0) {
          for (const entry of data) {
            if (entry && typeof entry === "object") {
              let url: unknown = entry;
              if ("$" in entry && entry.$ && typeof entry.$ === "object" && "url" in entry.$) {
                url = entry.$.url;
              } else if ("url" in entry) {
                url = entry.url;
              }
              if (typeof url === "string" && url.match(/\.(jpeg|jpg|gif|png|webp)/i)) return url;
            }
          }
        }
        if (data && typeof data === "object" && "$" in data && data.$ && typeof data.$ === "object" && "url" in data.$) {
          const url = data.$.url;
          if (typeof url === "string" && url.match(/\.(jpeg|jpg|gif|png|webp)/i)) return url;
        }
        if (data && typeof data === "object" && "url" in data) {
          const url = data.url;
          if (typeof url === "string") return url;
        }
      }
    }

    // 3. Atom link rel="enclosure" with image type
    if (Array.isArray(item.links)) {
      const imgLink = item.links.find(
        (l: unknown) => {
          if (typeof l !== "object" || l === null) return false;
          const link = l as Record<string, unknown>;
          return (link.$ && typeof link.$ === "object" && "type" in link.$ && typeof link.$.type === "string" && link.$.type.includes("image")) || (link.$ && typeof link.$ === "object" && "rel" in link.$ && link.$.rel === "enclosure");
        }
      );
      if (imgLink && typeof imgLink === "object" && "$" in imgLink && imgLink.$ && typeof imgLink.$ === "object" && "href" in imgLink.$) {
        const href = imgLink.$.href;
        if (typeof href === "string") return href;
      }
    }

    // 4. Deep property scan
    for (const prop in item) {
      if (prop.toLowerCase().match(/image|thumbnail|video|player/)) {
        const val = item[prop] as unknown;
        if (typeof val === "string" && val.startsWith("http") && val.match(/\.(jpeg|jpg|gif|png|webp)/i)) return val;
        if (val && typeof val === "object" && "$" in val && val.$ && typeof val.$ === "object" && "url" in val.$) {
          const url = val.$.url;
          if (typeof url === "string" && url.startsWith("http")) return url;
        }
      }
    }

    // 5. HTML / oEmbed thumbnail fallback
    const htmlPayload = [
      item.content,
      item.summary,
      item.description,
      item["content:encoded"],
    ]
      .filter(Boolean)
      .join(" ");
    if (htmlPayload.trim()) {
      const ytRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/i;
      const ytMatch = htmlPayload.match(ytRegex);
      if (ytMatch?.[1]) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;

      const imgRegex = /<img[^>]+(?:src|data-src|srcset|url)=["']([^"'\s>]+)["']/i;
      const match = htmlPayload.match(imgRegex);
      if (match?.[1]) {
        const cleaned = match[1].split(",")[0].trim().split(" ")[0];
        if (cleaned.startsWith("http")) return cleaned;
      }
    }
  } catch (err) {
    console.error("Image extraction error:", err);
  }
  return null;
}

async function fetchFeed(config: FeedConfig): Promise<Article[]> {
  try {
    const parser = new Parser({
      timeout: 8000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const feed = await parser.parseURL(config.url);
    const publisher = detectPublisher(feed.title || "", config.source);

    return (feed.items || []).slice(0, 6).map((item) => {
      const rawTitle = item.title || "";
      const rawDescription = item.contentSnippet || item.summary || item.description || "";

      return {
        id: slugify(rawTitle),
        title: cleanHtml(rawTitle) || "Untitled",
        description: cleanHtml(rawDescription).slice(0, 300),
        url: item.link || "",
        source: publisher,
        imageUrl: extractUniversalImage(item),
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        category: config.category,
      };
    });
  } catch (err) {
    console.error(`RSS failed [${config.source}]:`, (err as Error).message);
    return [];
  }
}

export async function aggregateNews(): Promise<Article[]> {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const all: Article[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  const seenTitle = new Set<string>();
  const seenUrl = new Set<string>();
  return all
    .filter((a) => {
      const titleKey = a.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 80);
      const urlKey = a.url.replace(/https?:\/\/(www\.)?/i, "").replace(/\/$/, "").slice(0, 120);
      if (seenTitle.has(titleKey) || seenUrl.has(urlKey)) return false;
      seenTitle.add(titleKey);
      seenUrl.add(urlKey);
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}
