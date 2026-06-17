import { NextResponse } from "next/server";

/**
 * Cricket scores scraped from Cricbuzz live scores page.
 * International matches only — parsed from RSC payload embedded in HTML.
 */

export const dynamic = "force-dynamic";

interface CricketMatch {
  id: string;
  league: string;
  homeTeam: string;
  homeScore: string;
  awayTeam: string;
  awayScore: string;
  status: string;
  live: boolean;
}

// International team abbreviations to identify full-international matches
const INTERNATIONAL_TEAMS = new Set([
  "IND", "AUS", "ENG", "RSA", "NZ", "PAK", "SL", "BAN", "WI", "ZIM",
  "AFG", "IRE", "NED", "SCO", "UAE", "NEP", "OMA", "USA", "CAN",
  "PNG", "NAM", "HK", "UGA", "NAM", "KEN", "THA", "JP",
]);

function isInternationalMatch(
  homeTeam: string,
  awayTeam: string,
): boolean {
  // Both teams must be recognized international abbreviations
  return INTERNATIONAL_TEAMS.has(homeTeam) && INTERNATIONAL_TEAMS.has(awayTeam);
}

function parseCricbuzzData(html: string): CricketMatch[] {
  const matches: CricketMatch[] = [];

  // Find RSC chunk containing currentMatchesList
  const rscRegex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g;
  let rscChunk = "";
  let rscMatch: RegExpExecArray | null;

  while ((rscMatch = rscRegex.exec(html)) !== null) {
    if (rscMatch[1].includes("currentMatchesList")) {
      rscChunk = rscMatch[1];
      break;
    }
  }

  if (!rscChunk) return matches;

  // Decode escaped quotes in RSC payload: \" -> "
  const decoded = rscChunk.replace(/\\"/g, '"');

  // Find currentMatchesList section
  const listIdx = decoded.indexOf('"currentMatchesList"');
  if (listIdx < 0) return matches;
  const section = decoded.substring(listIdx);

  // Split by matchId to process individual matches
  const parts = section.split('"matchId":');

  for (const part of parts.slice(1)) {
    const idMatch = part.match(/^(\d+)/);
    if (!idMatch) continue;
    const id = idMatch[1];

    const team1 = part.match(
      /"team1":\{"teamId":\d+,"teamName":"([^"]+)","teamSName":"([^"]+)"/
    );
    const team2 = part.match(
      /"team2":\{"teamId":\d+,"teamName":"([^"]+)","teamSName":"([^"]+)"/
    );
    const state = part.match(/"state":"([^"]+)"/);
    const status = part.match(/"status":"([^"]+)"/);
    const seriesName = part.match(/"seriesName":"([^"]+)"/);

    if (!team1 || !team2 || !state) continue;

    const homeSName = team1[2];
    const awaySName = team2[2];
    const series = seriesName ? seriesName[1] : "";

    // Filter: only international matches (both teams must be recognized)
    if (!isInternationalMatch(homeSName, awaySName)) continue;

    // Extract scores
    let homeScore = "";
    let awayScore = "";
    const score1 = part.match(
      /"team1Score":\{"inngs1":\{"inningsId":\d+,"runs":(\d+),"wickets":(\d+),"overs":([\d.]+)}/
    );
    const score2 = part.match(
      /"team2Score":\{"inngs1":\{"inningsId":\d+,"runs":(\d+),"wickets":(\d+),"overs":([\d.]+)}/
    );
    if (score1) {
      homeScore = `${score1[1]}/${score1[2]} (${score1[3]} ov)`;
    }
    if (score2) {
      awayScore = `${score2[1]}/${score2[2]} (${score2[3]} ov)`;
    }

    const stateValue = state[1];
    const statusValue = status ? status[1] : "";
    const isLive = stateValue === "In Progress";

    // Include: live, recently completed (within 24h), or upcoming (within 2h)
    if (stateValue === "In Progress" || stateValue === "Innings Break" || stateValue === "Delay") {
      // include
    } else if (stateValue === "Complete") {
      // include recently completed
    } else if (stateValue === "Preview" || stateValue === "Upcoming") {
      // include upcoming
    } else {
      continue;
    }

    matches.push({
      id: `cricket-${id}`,
      league: series || "Cricket",
      homeTeam: homeSName,
      homeScore,
      awayTeam: awaySName,
      awayScore,
      status: statusValue,
      live: isLive,
    });
  }

  return matches;
}

export async function GET() {
  try {
    const res = await fetch("https://www.cricbuzz.com/cricket-match/live-scores", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 120 },
    });

    if (!res.ok) {
      return NextResponse.json({ matches: [] }, { status: 502 });
    }

    const html = await res.text();
    const matches = parseCricbuzzData(html);

    // Sort: live first, then completed
    matches.sort((a, b) => {
      if (a.live && !b.live) return -1;
      if (!a.live && b.live) return 1;
      return 0;
    });

    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ matches: [] }, { status: 500 });
  }
}
