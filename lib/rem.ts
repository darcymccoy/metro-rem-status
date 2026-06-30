import * as cheerio from "cheerio";
import type { Alert, NetworkStatus } from "./types";
import { REVALIDATE_SECONDS } from "./config";

const REM_STATUS_URL = "https://rem.info/en/travelling/network-status";

const USER_AGENT = "metro-rem-status/1.0 (https://github.com/darcymccoy/metro-rem-status; darcymccoy4@gmail.com)";

const REM_COLOR = "#00a3a1";

export async function getRemStatus(): Promise<NetworkStatus> {
  try {
    const res = await fetch(REM_STATUS_URL, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`rem.info responded ${res.status}`);
    const html = await res.text();
    return parseRem(html);
  } catch (err) {
    return {
      network: "REM",
      fetchedAt: new Date().toISOString(),
      ok: false,
      lines: [
        {
          network: "REM",
          line: "REM",
          color: REM_COLOR,
          level: "unknown",
          summary: "Status unavailable",
          alerts: [],
        },
      ],
      error: err instanceof Error ? err.message : "Unknown REM error",
    };
  }
}

function parseRem(html: string): NetworkStatus {
  const $ = cheerio.load(html);

  const alerts: Alert[] = [];
  $(".live-network-status__trip-details").each((_, el) => {
    const text = $(el)
      .find(".live-network-status__trip-details-text")
      .text()
      .trim();
    const when = $(el)
      .find(".live-network-status__trip-details-expected-date")
      .text()
      .trim();
    if (text) {
      alerts.push({ text, when: when || undefined, kind: "upcoming" });
    }
  });

  const level = "normal" as const;
  const summary = alerts.length
    ? `Normal service — ${alerts.length} planned interruption${
        alerts.length > 1 ? "s" : ""
      }`
    : "Normal service";

  return {
    network: "REM",
    fetchedAt: new Date().toISOString(),
    ok: true,
    lines: [
      {
        network: "REM",
        line: "REM",
        color: REM_COLOR,
        level,
        summary,
        alerts,
      },
    ],
  };
}
