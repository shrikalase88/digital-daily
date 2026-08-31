import Parser from "rss-parser";
import type { Article, Category, Region } from "./types";

interface FeedConfig {
  url: string;
  source: string;
  category: Category;
  region: Region;
  timeout?: number;
  retries?: number;
}

// Curated top 2026 global & regional news sources with verified high-res image feeds
const FEEDS: FeedConfig[] = [
  // ── Politics & World (India, USA, Europe & Global) ──
  // India
  { url: "https://indianexpress.com/section/world/feed/", source: "Indian Express", category: "Politics & World", region: "India", timeout: 6000 },
  { url: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml", source: "Hindustan Times", category: "Politics & World", region: "India", timeout: 6000 },
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", source: "The Hindu", category: "Politics & World", region: "India", timeout: 6000 },
  { url: "https://feeds.feedburner.com/ndtvnews-top-stories", source: "NDTV", category: "Politics & World", region: "India", timeout: 6000 },

  // USA
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NY Times", category: "Politics & World", region: "USA", timeout: 6000 },
  { url: "https://www.theguardian.com/us-news/rss", source: "The Guardian US", category: "Politics & World", region: "USA", timeout: 6000 },
  { url: "https://rss.politico.com/politics-news.xml", source: "Politico", category: "Politics & World", region: "USA", timeout: 6000 },
  { url: "https://feeds.npr.org/1001/rss.xml", source: "NPR", category: "Politics & World", region: "USA", timeout: 6000 },

  // Europe & Global
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC News", category: "Politics & World", region: "Europe", timeout: 6000 },
  { url: "https://www.theguardian.com/world/rss", source: "The Guardian", category: "Politics & World", region: "Europe", timeout: 6000 },
  { url: "https://www.france24.com/en/rss", source: "France 24", category: "Politics & World", region: "Europe", timeout: 6000 },

  // ── Technology (USA, Global & India) ──
  { url: "https://www.theverge.com/rss/index.xml", source: "The Verge", category: "Technology", region: "USA", timeout: 6000 },
  { url: "https://www.wired.com/feed/rss", source: "Wired", category: "Technology", region: "USA", timeout: 6000 },
  { url: "https://feeds.arstechnica.com/arstechnica/index", source: "Ars Technica", category: "Technology", region: "USA", timeout: 6000 },
  { url: "https://9to5mac.com/feed/", source: "9to5Mac", category: "Technology", region: "USA", timeout: 6000 },
  { url: "https://www.techradar.com/rss", source: "TechRadar", category: "Technology", region: "Global", timeout: 6000 },
  { url: "https://indianexpress.com/section/technology/feed/", source: "Indian Express Tech", category: "Technology", region: "India", timeout: 6000 },

  // ── Finance & Corporate (USA, Europe & India) ──
  { url: "https://www.livemint.com/rss/markets", source: "Livemint", category: "Finance & Corporate", region: "India", timeout: 6000 },
  { url: "https://economictimes.indiatimes.com/news/rssfeeds/1715249553.cms", source: "Economic Times", category: "Finance & Corporate", region: "India", timeout: 6000 },
  { url: "https://finance.yahoo.com/news/rssindex", source: "Yahoo Finance", category: "Finance & Corporate", region: "USA", timeout: 6000 },
  { url: "https://feeds.content.dowjones.io/public/rss/mw_topstories", source: "MarketWatch", category: "Finance & Corporate", region: "USA", timeout: 6000 },
  { url: "https://fortune.com/feed/", source: "Fortune", category: "Finance & Corporate", region: "USA", timeout: 6000 },
  { url: "https://seekingalpha.com/feed.xml", source: "Seeking Alpha", category: "Finance & Corporate", region: "Global", timeout: 6000 },

  // ── Sports (Cricket, Football, F1 & Global) ──
  { url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml", source: "ESPN Cricinfo", category: "Sports", region: "India", timeout: 6000 },
  { url: "https://www.sportskeeda.com/feed/cricket", source: "Sportskeeda", category: "Sports", region: "India", timeout: 6000 },
  { url: "https://feeds.bbci.co.uk/sport/rss.xml", source: "BBC Sport", category: "Sports", region: "Europe", timeout: 6000 },
  { url: "https://www.skysports.com/rss/12040", source: "Sky Sports Football", category: "Sports", region: "Europe", timeout: 6000 },
  { url: "https://www.skysports.com/rss/12433", source: "Sky Sports F1", category: "Sports", region: "Europe", timeout: 6000 },
  { url: "https://www.motorsport.com/rss/f1/news/", source: "Motorsport.com", category: "Sports", region: "Global", timeout: 6000 },
];

const parserCache = new Map<string, Parser>();

function getParser(timeout: number): Parser {
  const cacheKey = `parser-${timeout}`;
  if (!parserCache.has(cacheKey)) {
    parserCache.set(
      cacheKey,
      new Parser({
        timeout,
        customFields: {
          item: [
            ["media:content", "mediaContent", { keepArray: true }],
            ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
            ["media:group", "mediaGroup"],
            ["enclosure", "enclosure"],
            ["content:encoded", "contentEncoded"],
          ],
        },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "application/rss+xml, application/xml, text/xml, */*",
          "Cache-Control": "no-cache",
        },
      })
    );
  }
  return parserCache.get(cacheKey)!;
}

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
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
    .trim();
}

/**
 * Normalizes and upgrades CDN URLs to guaranteed high-definition crystal clear formats
 */
function normalizeImageUrl(url: unknown): string | null {
  if (typeof url !== "string" || !url.startsWith("http")) return null;
  let clean = url.trim();

  // Filter 1x1 tracking beacons and invalid placeholders
  if (
    clean.includes("1x1") ||
    clean.includes("spacer") ||
    clean.includes("feedburner") ||
    clean.includes("doubleclick") ||
    clean.includes("pixel.wp.com")
  ) {
    return null;
  }

  // Upgrade http to https
  if (clean.startsWith("http://")) {
    clean = clean.replace("http://", "https://");
  }

  // 1. BBC News / BBC Sport: Upgrade 240px thumbnail to 976px HD master
  if (clean.includes("ichef.bbci.co.uk")) {
    clean = clean.replace(/\/standard\/\d+\//, "/standard/976/");
  }

  // 2. The Guardian: Upgrade width from low-res (140/460) to 1000px high quality
  if (clean.includes("i.guim.co.uk")) {
    clean = clean.replace(/width=\d+/, "width=1000").replace(/quality=\d+/, "quality=90");
  }

  // 3. Indian Express: Upgrade small thumbnail sizes (e.g. /150x84/) to full 1200x675
  if (clean.includes("indianexpress.com")) {
    clean = clean.replace(/\/\d+x\d+\//, "/1200x675/");
  }

  // 4. Hindustan Times / Livemint: Upgrade to 1600x900 full HD
  if (clean.includes("hindustantimes.com") || clean.includes("livemint.com")) {
    clean = clean.replace(/\/\d+x\d+\//, "/1600x900/");
  }

  // 5. NDTV: Strip thumbnail downscaler suffix
  if (clean.includes("ndtv.com") && clean.includes("_thumb_")) {
    clean = clean.replace(/_thumb_\d+x\d+/, "");
  }

  return clean;
}

interface MediaCandidate {
  url?: string;
  width?: number;
}

function extractUniversalImage(item: Parser.Item & Record<string, unknown>): string | null {
  try {
    // 1. Standard RSS Enclosure
    if (item.enclosure && typeof item.enclosure === "object") {
      const enc = item.enclosure as { url?: string; type?: string };
      const normalized = normalizeImageUrl(enc.url);
      if (normalized && (!enc.type || enc.type.startsWith("image"))) {
        return normalized;
      }
    }

    // 2. Media Content: Collect all candidates and select the highest resolution width
    const mediaContent = item.mediaContent || (item.mediaGroup && (item.mediaGroup as Record<string, unknown>)["media:content"]);
    if (Array.isArray(mediaContent) && mediaContent.length > 0) {
      const candidates: MediaCandidate[] = [];
      for (const entry of mediaContent) {
        if (entry && typeof entry === "object") {
          const rawUrl = (entry as { $?: { url?: string; width?: string }; url?: string }).$?.url || (entry as { url?: string }).url;
          const rawWidth = (entry as { $?: { width?: string }; width?: number }).$?.width || (entry as { width?: number }).width;
          const normalized = normalizeImageUrl(rawUrl);
          if (normalized) {
            candidates.push({
              url: normalized,
              width: rawWidth ? parseInt(String(rawWidth), 10) || 0 : 0,
            });
          }
        }
      }
      if (candidates.length > 0) {
        // Sort descending by width to pick highest resolution
        candidates.sort((a, b) => (b.width || 0) - (a.width || 0));
        return candidates[0].url || null;
      }
    } else if (mediaContent && typeof mediaContent === "object") {
      const url = (mediaContent as { $?: { url?: string }; url?: string }).$?.url || (mediaContent as { url?: string }).url;
      const normalized = normalizeImageUrl(url);
      if (normalized) return normalized;
    }

    // 3. Media Thumbnail: Sort descending by width if array
    const mediaThumbnail = item.mediaThumbnail || (item.mediaGroup && (item.mediaGroup as Record<string, unknown>)["media:thumbnail"]);
    if (Array.isArray(mediaThumbnail) && mediaThumbnail.length > 0) {
      const candidates: MediaCandidate[] = [];
      for (const entry of mediaThumbnail) {
        if (entry && typeof entry === "object") {
          const rawUrl = (entry as { $?: { url?: string; width?: string }; url?: string }).$?.url || (entry as { url?: string }).url;
          const rawWidth = (entry as { $?: { width?: string }; width?: number }).$?.width || (entry as { width?: number }).width;
          const normalized = normalizeImageUrl(rawUrl);
          if (normalized) {
            candidates.push({
              url: normalized,
              width: rawWidth ? parseInt(String(rawWidth), 10) || 0 : 0,
            });
          }
        }
      }
      if (candidates.length > 0) {
        candidates.sort((a, b) => (b.width || 0) - (a.width || 0));
        return candidates[0].url || null;
      }
    } else if (mediaThumbnail && typeof mediaThumbnail === "object") {
      const url = (mediaThumbnail as { $?: { url?: string }; url?: string }).$?.url || (mediaThumbnail as { url?: string }).url;
      const normalized = normalizeImageUrl(url);
      if (normalized) return normalized;
    }

    // 4. HTML parsing from contentEncoded, content, description, summary
    const htmlPayload = [
      item.contentEncoded,
      item["content:encoded"],
      item.content,
      item.summary,
      item.description,
    ]
      .filter(Boolean)
      .join(" ");

    if (htmlPayload.trim()) {
      // YouTube high quality embed thumbnail
      const ytMatch = htmlPayload.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/i);
      if (ytMatch?.[1]) return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;

      // Extract high-res srcset (pick largest resolution candidate)
      const srcsetMatch = htmlPayload.match(/srcset=["']([^"']+)["']/i);
      if (srcsetMatch?.[1]) {
        const parts = srcsetMatch[1].split(",").map((s) => s.trim());
        // Reverse so highest width candidate at the end is checked first
        for (let i = parts.length - 1; i >= 0; i--) {
          const candidateUrl = parts[i].split(" ")[0];
          const normalized = normalizeImageUrl(candidateUrl);
          if (normalized) return normalized;
        }
      }

      // Extract image tags
      const imgMatch = htmlPayload.match(/<img[^>]+(?:src|data-src|data-original)=["'](https?:\/\/[^"'\s>]+)/i);
      if (imgMatch?.[1]) {
        const normalized = normalizeImageUrl(imgMatch[1]);
        if (normalized) return normalized;
      }
    }
  } catch (err) {
    console.error("Image extraction error:", err);
  }
  return null;
}

async function fetchFeedWithRetry(config: FeedConfig, attempt = 1): Promise<Article[]> {
  const timeout = config.timeout || 6000;
  const maxRetries = config.retries ?? 2;

  try {
    const parser = getParser(timeout);
    const feed = await parser.parseURL(config.url);

    return (feed.items || []).slice(0, 8).map((item) => {
      const rawTitle = item.title || "";
      const rawDescription = item.contentSnippet || item.summary || item.description || "";

      return {
        id: slugify(rawTitle),
        title: cleanHtml(rawTitle) || "Untitled",
        description: cleanHtml(rawDescription).slice(0, 300),
        url: item.link || "",
        source: config.source,
        imageUrl: extractUniversalImage(item),
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        category: config.category,
        region: config.region,
      };
    });
  } catch (err) {
    const error = err as Error & { code?: string };
    if (attempt < maxRetries && (error.code === "ETIMEDOUT" || error.code === "ECONNRESET" || error.message.includes("timeout"))) {
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      return fetchFeedWithRetry(config, attempt + 1);
    }
    console.error(`RSS failed [${config.source}]:`, error.message);
    return [];
  }
}

export async function aggregateNews(): Promise<Article[]> {
  const results = await Promise.allSettled(FEEDS.map((f) => fetchFeedWithRetry(f)));

  const all: Article[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  const seenTitle = new Set<string>();
  const seenUrl = new Set<string>();
  const deduped = all
    .filter((a) => {
      const titleKey = a.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 80);
      const urlKey = a.url.replace(/https?:\/\/(www\.)?/i, "").replace(/\/$/, "").slice(0, 120);
      if (seenTitle.has(titleKey) || seenUrl.has(urlKey)) return false;
      seenTitle.add(titleKey);
      seenUrl.add(urlKey);
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // Group by category, prioritizing high-res image articles, then interleave sources for maximum diversity
  const byCategory = new Map<string, Article[]>();
  for (const a of deduped) {
    const list = byCategory.get(a.category) || [];
    list.push(a);
    byCategory.set(a.category, list);
  }

  const mixed: Article[] = [];
  for (const [, articles] of byCategory) {
    // Separate into articles with images vs without
    const withImg = articles.filter((a) => a.imageUrl);
    const withoutImg = articles.filter((a) => !a.imageUrl);

    // Group withImg by source to round-robin
    const bySource = new Map<string, Article[]>();
    for (const a of [...withImg, ...withoutImg]) {
      const src = a.source || "Unknown";
      const list = bySource.get(src) || [];
      list.push(a);
      bySource.set(src, list);
    }

    const sources = Array.from(bySource.values());
    let idx = 0;
    while (sources.some((s) => s.length > 0)) {
      if (sources[idx % sources.length].length > 0) {
        mixed.push(sources[idx % sources.length].shift()!);
      }
      idx++;
    }
  }

  return mixed;
}
