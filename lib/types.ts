export type Network = "STM" | "REM";

export type StatusLevel = "normal" | "minor" | "major" | "unknown";

export interface Alert {
  text: string;
  when?: string;
  kind: "current" | "upcoming";
  url?: string;
}

export interface LineStatus {
  network: Network;
  line: string;
  color: string;
  level: StatusLevel;
  summary: string;
  alerts: Alert[];
}

export interface NetworkStatus {
  network: Network;
  fetchedAt: string;
  ok: boolean;
  lines: LineStatus[];
  error?: string;
}

export interface CombinedStatus {
  fetchedAt: string;
  stm: NetworkStatus;
  rem: NetworkStatus;
}
