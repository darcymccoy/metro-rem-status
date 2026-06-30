import { REVALIDATE_SECONDS } from "./config";
import type { Alert, LineStatus, NetworkStatus, StatusLevel } from "./types";

const STM_ETAT_URL = "https://api.stm.info/pub/od/i3/v2/messages/etatservice";

const METRO_LINES = [
  { id: "1", line: "1 - Green", color: "#008e4f" },
  { id: "2", line: "2 - Orange", color: "#ef8d22" },
  { id: "4", line: "4 - Yellow", color: "#f5d100" },
  { id: "5", line: "5 - Blue", color: "#0095da" },
] as const;

const METRO_IDS = new Set<string>(METRO_LINES.map((l) => l.id));

interface StmText {
  language: string;
  text: string | null;
}
interface StmEntity {
  route_short_name?: string;
  direction_id?: string;
  stop_code?: string;
}
interface StmAlert {
  active_periods?: { start: number | null; end: number | null };
  cause?: string | null;
  effect?: string | null;
  informed_entities?: StmEntity[];
  header_texts?: StmText[];
  description_texts?: StmText[];
}
interface StmResponse {
  header?: { timestamp?: number };
  alerts?: StmAlert[];
}

function normalLine(l: (typeof METRO_LINES)[number]): LineStatus {
  return {
    network: "STM",
    line: l.line,
    color: l.color,
    level: "normal",
    summary: "Normal service",
    alerts: [],
  };
}

function levelFromEffect(effect?: string | null): StatusLevel {
  switch ((effect ?? "").toUpperCase()) {
    case "NO_SERVICE":
      return "major";
    case "REDUCED_SERVICE":
    case "SIGNIFICANT_DELAYS":
    case "DETOUR":
    case "MODIFIED_SERVICE":
      return "minor";
    default:
      return "normal";
  }
}

function pickText(texts?: StmText[]): string | undefined {
  if (!texts?.length) return undefined;
  const en = texts.find((t) => t.language === "en" && t.text)?.text;
  if (en) return en;
  const fr = texts.find((t) => t.language === "fr" && t.text)?.text;
  return fr ?? undefined;
}

function isActive(
  period: StmAlert["active_periods"],
  nowSec: number
): boolean {
  if (!period) return true;
  const startsOk = period.start == null || period.start <= nowSec;
  const endsOk = period.end == null || period.end >= nowSec;
  return startsOk && endsOk;
}

const RANK: Record<StatusLevel, number> = {
  normal: 0,
  minor: 1,
  major: 2,
  unknown: 0,
};

const NORMAL_PHRASES = new Set([
  "normal métro service",
  "service normal du métro",
]);

export function parseEtatService(
  data: StmResponse,
  nowSec = Math.floor(Date.now() / 1000)
): NetworkStatus {
  const lines = METRO_LINES.map(normalLine);
  const byId = new Map<string, LineStatus>(
    lines.map((l, i) => [METRO_LINES[i].id, l])
  );

  for (const alert of data.alerts ?? []) {
    if (!isActive(alert.active_periods, nowSec)) continue;

    const entities = alert.informed_entities ?? [];

    if (entities.some((e) => e.stop_code)) continue;

    const routeIds = new Set(
      entities
        .map((e) => e.route_short_name)
        .filter((r): r is string => !!r && METRO_IDS.has(r))
    );
    if (routeIds.size === 0) continue;

    const text = pickText(alert.description_texts);
    if (!text) continue;
    if (NORMAL_PHRASES.has(text.trim().toLowerCase())) continue;

    let level = levelFromEffect(alert.effect);
    if (level === "normal") level = "minor";
    const entry: Alert = { text, kind: "current" };

    for (const id of routeIds) {
      const target = byId.get(id);
      if (!target) continue;
      target.alerts.push(entry);
      if (RANK[level] > RANK[target.level]) {
        target.level = level;
        target.summary = text;
      }
    }
  }

  return {
    network: "STM",
    fetchedAt: new Date(
      (data.header?.timestamp ?? nowSec) * 1000
    ).toISOString(),
    ok: true,
    lines,
  };
}

export async function getStmStatus(): Promise<NetworkStatus> {
  const key = process.env.STM_API_KEY;
  try {
    if (!key) throw new Error("STM_API_KEY is not set");
    const res = await fetch(STM_ETAT_URL, {
      headers: { apiKey: key, Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`STM API responded ${res.status}`);
    const data = (await res.json()) as StmResponse;
    return parseEtatService(data);
  } catch (err) {
    return {
      network: "STM",
      fetchedAt: new Date().toISOString(),
      ok: false,
      lines: METRO_LINES.map(normalLine),
      error: err instanceof Error ? err.message : "Unknown STM error",
    };
  }
}
