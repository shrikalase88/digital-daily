# Digital Daily - Architecture Graph

## System Overview

```mermaid
graph TB
    subgraph "🌐 Client (Browser)"
        UI["Next.js App Router<br/>React 19 + Tailwind CSS 4"]
        SW["Service Worker<br/>(PWA-capable)"]
    end

    subgraph "🖥️ Vercel Edge Network"
        direction TB
        subgraph "Pages"
            HOME["/ <br/>Homepage"]
            BOOK["/bookmarks<br/>Bookmarks"]
            CONTACT["/contact<br/>Contact"]
            PRIV["/privacy<br/>Privacy"]
            TERMS["/terms<br/>Terms"]
        end
        subgraph "API Routes"
            NEWS_API["/api/news<br/>RSS Aggregator"]
            WEATHER_API["/api/weather<br/>Geolocation Weather"]
            WEATHER_FB["/api/weather/fallback<br/>IP-based Weather"]
            CRICKET["/api/sports/cricket<br/>Cricbuzz Scraper"]
            FOOTBALL["/api/sports/football<br/>ESPN API"]
            NBA["/api/sports/nba<br/>ESPN API"]
            F1["/api/sports/f1<br/>ESPN API"]
        end
        subgraph "Data Layer"
            FEEDS["lib/feeds.ts<br/>26 RSS Feeds"]
            CACHE["In-Memory Cache<br/>5-min TTL"]
            TYPES["lib/types.ts<br/>TypeScript Types"]
            THEMES["lib/themes.ts<br/>Category Themes"]
            UTILS["lib/utils.ts<br/>Helpers"]
        end
    end

    subgraph "🌍 External Data Sources"
        RSS["26 RSS Feeds<br/>Reuters, BBC, NYT,<br/>TechCrunch, ESPN..."]
        OPEN_METEO["Open-Meteo API<br/>Weather Data"]
        NOMINATIM["Nominatim<br/>Reverse Geocoding"]
        IP_API["ip-api.com<br/>IP Geolocation"]
        ESPN["ESPN Scoreboard<br/>Football, NBA, F1"]
        CRICBUZZ["Cricbuzz<br/>Cricket Scores"]
    end

    UI -->|fetch /api/news| NEWS_API
    UI -->|fetch /api/weather| WEATHER_API
    UI -->|fetch /api/weather/fallback| WEATHER_FB
    UI -->|fetch /api/sports/*| CRICKET
    UI -->|fetch /api/sports/*| FOOTBALL
    UI -->|fetch /api/sports/*| NBA
    UI -->|fetch /api/sports/*| F1

    NEWS_API --> FEEDS
    FEEDS --> RSS
    NEWS_API --> CACHE

    WEATHER_API --> OPEN_METEO
    WEATHER_API --> NOMINATIM
    WEATHER_FB --> IP_API
    WEATHER_FB --> OPEN_METEO

    CRICKET --> CRICBUZZ
    FOOTBALL --> ESPN
    NBA --> ESPN
    F1 --> ESPN

    style UI fill:#1e1b4b,stroke:#a78bfa,color:#fff
    style NEWS_API fill:#312e81,stroke:#818cf8,color:#fff
    style FEEDS fill:#3b0764,stroke:#c084fc,color:#fff
    style RSS fill:#064e3b,stroke:#34d399,color:#fff
    style CACHE fill:#78350f,stroke:#fbbf24,color:#fff
```

## Component Hierarchy

```mermaid
graph TD
    LAYOUT["layout.tsx<br/>Root Layout<br/>Geist Fonts + Metadata"]
    PAGE["page.tsx<br/>Homepage (use client)<br/>State Manager"]

    subgraph "Navigation & Controls"
        NAV["Navbar<br/>Category Pills + Bookmarks"]
        SEARCH["SearchBar<br/>Search + Source Filter"]
        TICKER["LiveSportsTicker<br/>Auto-refresh 60s"]
    end

    subgraph "Content Display"
        HERO["HeroSection<br/>Featured + Trending"]
        CAT_SEC["CategorySection × 4<br/>Politics | Tech | Finance | Sports"]
        NEWS_CARD["NewsCard × N<br/>Article Card + Bookmark"]
    end

    subgraph "Sidebar Widgets"
        SIDEBAR["Sidebar<br/>Weather + Latest"]
        WEATHER_W["WeatherWidget<br/>3D Tilt + Animation"]
    end

    FOOTER["Footer<br/>Links + Credits"]

    LAYOUT --> PAGE
    PAGE --> NAV
    PAGE --> SEARCH
    PAGE --> TICKER
    PAGE --> HERO
    PAGE --> CAT_SEC
    CAT_SEC --> NEWS_CARD
    PAGE --> SIDEBAR
    SIDEBAR --> WEATHER_W
    PAGE --> FOOTER

    style LAYOUT fill:#1e1b4b,stroke:#a78bfa,color:#fff
    style PAGE fill:#312e81,stroke:#818cf8,color:#fff
    style NAV fill:#3b0764,stroke:#c084fc,color:#fff
    style HERO fill:#064e3b,stroke:#34d399,color:#fff
    style NEWS_CARD fill:#1e3a5f,stroke:#38bdf8,color:#fff
    style WEATHER_W fill:#78350f,stroke:#fbbf24,color:#fff
```

## Data Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant P as page.tsx
    participant N as /api/news
    participant F as feeds.ts
    participant RSS as 26 RSS Feeds
    participant C as Cache

    U->>P: Load Homepage
    P->>N: GET /api/news
    N->>C: Check Cache

    alt Cache Hit
        C-->>N: Return Cached Articles
    else Cache Miss
        N->>F: aggregateNews()
        F->>RSS: Fetch all 26 feeds in parallel
        RSS-->>F: RSS XML responses
        F->>F: Parse + Deduplicate
        F->>F: Interleave by Source
        F-->>N: Article[]
        N->>C: Store in Cache (5min TTL)
    end

    N-->>P: Article[] Response
    P->>P: State: articles, category, search
    P->>U: Render UI

    Note over U: User interacts
    U->>P: Toggle Category
    P->>P: Filter articles client-side
    U->>P: Search Query
    P->>P: Filter by title/description
    U->>P: Bookmark Article
    P->>P: Save to localStorage
```

## Sports Data Flow

```mermaid
graph LR
    subgraph "User Browser"
        TICKER["LiveSportsTicker"]
    end

    subgraph "API Routes"
        CRICKET_API["/api/sports/cricket"]
        FOOTBALL_API["/api/sports/football"]
        NBA_API["/api/sports/nba"]
        F1_API["/api/sports/f1"]
    end

    subgraph "External APIs"
        CRICBUZZ["Cricbuzz<br/>(HTML Scraping)"]
        ESPN_FB["ESPN<br/>Football"]
        ESPN_NBA["ESPN<br/>NBA"]
        ESPN_F1["ESPN<br/>F1"]
    end

    TICKER -->|60s refresh| CRICKET_API
    TICKER -->|60s refresh| FOOTBALL_API
    TICKER -->|60s refresh| NBA_API
    TICKER -->|60s refresh| F1_API

    CRICKET_API -->|scrape| CRICBUZZ
    FOOTBALL_API -->|REST| ESPN_FB
    NBA_API -->|REST| ESPN_NBA
    F1_API -->|REST| ESPN_F1

    style TICKER fill:#312e81,stroke:#818cf8,color:#fff
    style CRICBUZZ fill:#064e3b,stroke:#34d399,color:#fff
    style ESPN_FB fill:#78350f,stroke:#fbbf24,color:#fff
    style ESPN_NBA fill:#78350f,stroke:#fbbf24,color:#fff
    style ESPN_F1 fill:#78350f,stroke:#fbbf24,color:#fff
```

## Weather Data Flow

```mermaid
graph TD
    WW["WeatherWidget"]

    subgraph "Primary: Browser Geolocation"
        WW -->|lat/lon| WA["/api/weather"]
        WA --> OM["Open-Meteo API<br/>Temperature, Humidity, Wind"]
        WA --> NO["Nominatim<br/>City Name"]
    end

    subgraph "Fallback: IP-based"
        WW -->|geolocation denied| WFB["/api/weather/fallback"]
        WFB --> IPA["ip-api.com<br/>IP Geolocation"]
        IPA -->|lat/lon| WFB
        WFB --> OM
    end

    OM --> WD["WeatherData<br/>Temperature, Description,<br/>Humidity, Wind, Icon"]
    WD --> WW

    style WW fill:#312e81,stroke:#818cf8,color:#fff
    style OM fill:#064e3b,stroke:#34d399,color:#fff
    style NO fill:#064e3b,stroke:#34d399,color:#fff
    style IPA fill:#78350f,stroke:#fbbf24,color:#fff
```

## RSS Feed Distribution by Category

```mermaid
pie title 26 RSS Feeds by Category
    "Politics & World (7)" : 7
    "Technology (7)" : 7
    "Finance & Corporate (6)" : 6
    "Sports (6)" : 6
```

```mermaid
graph LR
    subgraph "Politics & World"
        P1["Reuters World"]
        P2["BBC World"]
        P3["Al Jazeera"]
        P4["NPR Politics"]
        P5["The Guardian"]
        P6["AP News"]
        P7["Politico"]
    end

    subgraph "Technology"
        T1["TechCrunch"]
        T2["The Verge"]
        T3["Ars Technica"]
        T4["Hacker News"]
        T5["MIT Tech Review"]
        T6["Wired"]
        T7["Engadget"]
    end

    subgraph "Finance & Corporate"
        F1["Bloomberg"]
        F2["CNBC"]
        F3["Financial Times"]
        F4["Wall Street Journal"]
        F5["MarketWatch"]
        F6["Reuters Business"]
    end

    subgraph "Sports"
        S1["ESPN"]
        S2["BBC Sport"]
        S3["Sky Sports"]
        S4["Fox Sports"]
        S5["NBA.com"]
        S6["Formula1.com"]
    end

    style P1 fill:#fb7185,stroke:#f43f5e,color:#fff
    style P2 fill:#fb7185,stroke:#f43f5e,color:#fff
    style P3 fill:#fb7185,stroke:#f43f5e,color:#fff
    style P4 fill:#fb7185,stroke:#f43f5e,color:#fff
    style P5 fill:#fb7185,stroke:#f43f5e,color:#fff
    style P6 fill:#fb7185,stroke:#f43f5e,color:#fff
    style P7 fill:#fb7185,stroke:#f43f5e,color:#fff
    style T1 fill:#22d3ee,stroke:#06b6d4,color:#fff
    style T2 fill:#22d3ee,stroke:#06b6d4,color:#fff
    style T3 fill:#22d3ee,stroke:#06b6d4,color:#fff
    style T4 fill:#22d3ee,stroke:#06b6d4,color:#fff
    style T5 fill:#22d3ee,stroke:#06b6d4,color:#fff
    style T6 fill:#22d3ee,stroke:#06b6d4,color:#fff
    style T7 fill:#22d3ee,stroke:#06b6d4,color:#fff
    style F1 fill:#34d399,stroke:#10b981,color:#fff
    style F2 fill:#34d399,stroke:#10b981,color:#fff
    style F3 fill:#34d399,stroke:#10b981,color:#fff
    style F4 fill:#34d399,stroke:#10b981,color:#fff
    style F5 fill:#34d399,stroke:#10b981,color:#fff
    style F6 fill:#34d399,stroke:#10b981,color:#fff
    style S1 fill:#fbbf24,stroke:#f59e0b,color:#000
    style S2 fill:#fbbf24,stroke:#f59e0b,color:#000
    style S3 fill:#fbbf24,stroke:#f59e0b,color:#000
    style S4 fill:#fbbf24,stroke:#f59e0b,color:#000
    style S5 fill:#fbbf24,stroke:#f59e0b,color:#000
    style S6 fill:#fbbf24,stroke:#f59e0b,color:#000
```

## Security & Deployment

```mermaid
graph TB
    subgraph "Vercel Deployment"
        VERCEL["Vercel Edge<br/>Next.js 16 + Turbopack"]
        CSP["Content Security Policy"]
        HSTS["HSTS<br/>2-year max-age"]
        XFO["X-Frame-Options: DENY"]
        XCTO["X-Content-Type-Options: nosniff"]
        RP["Referrer-Policy"]
        PP["Permissions-Policy"]
        CORS["CORS Headers<br/>Access-Control-Allow-Origin: *"]
    end

    subgraph "Security Headers"
        VERCEL --> CSP
        VERCEL --> HSTS
        VERCEL --> XFO
        VERCEL --> XCTO
        VERCEL --> RP
        VERCEL --> PP
        VERCEL --> CORS
    end

    style VERCEL fill:#1e1b4b,stroke:#a78bfa,color:#fff
    style CSP fill:#78350f,stroke:#fbbf24,color:#fff
    style HSTS fill:#78350f,stroke:#fbbf24,color:#fff
```
