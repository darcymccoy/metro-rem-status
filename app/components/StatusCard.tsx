import type { LineStatus, StatusLevel } from "@/lib/types";

const LEVEL_STYLES: Record<StatusLevel, { dot: string; label: string }> = {
  normal: { dot: "bg-emerald-500", label: "text-emerald-400" },
  minor: { dot: "bg-amber-500", label: "text-amber-400" },
  major: { dot: "bg-red-500", label: "text-red-400" },
  unknown: { dot: "bg-zinc-500", label: "text-zinc-400" },
};

export function StatusCard({ status }: { status: LineStatus }) {
  const level = LEVEL_STYLES[status.level];
  return (
    <div className="rounded-xl border border-white/10 bg-white/3 p-4">
      <div className="flex items-center gap-3">
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: status.color }}
          aria-hidden
        />
        <span className="font-medium">{status.line}</span>
        <span className="ml-auto flex items-center gap-2 text-sm">
          <span className={`inline-block h-2 w-2 rounded-full ${level.dot}`} />
          <span className={level.label}>{status.summary}</span>
        </span>
      </div>

      {status.alerts.length > 0 && (
        <details className="group mt-3 border-t border-white/5 pt-3">
          <summary className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400 marker:content-none">
            <svg
              className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-open:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
            {status.alerts.length} planned interruption
            {status.alerts.length > 1 ? "s" : ""}
          </summary>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            {status.alerts.map((a, i) => (
              <li key={i}>
                <p>{a.text}</p>
                {a.when && (
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {a.kind === "upcoming" ? "Planned: " : ""}
                    {a.when}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
