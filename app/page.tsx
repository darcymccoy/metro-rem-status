import { getCombinedStatus } from "@/lib/status";
import { StatusCard } from "./components/StatusCard";
import type { NetworkStatus } from "@/lib/types";

function Section({ status }: { status: NetworkStatus }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">
          {status.network === "STM" ? "STM Métro" : "REM"}
        </h2>
        {!status.ok && (
          <span className="text-sm text-red-400">Status unavailable</span>
        )}
      </div>
      <div className="space-y-2">
        {status.lines.map((line) => (
          <StatusCard key={`${line.network}-${line.line}`} status={line} />
        ))}
      </div>
      {status.error && (
        <p className="text-xs text-zinc-600">Error: {status.error}</p>
      )}
    </section>
  );
}

export default async function Home() {
  const { stm, rem, fetchedAt } = await getCombinedStatus();
  const updated = new Date(fetchedAt).toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Toronto",
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Montréal Metro &amp; REM Status
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Last updated {updated} · refreshes every minute
        </p>
      </header>

      <div className="space-y-8">
        <Section status={stm} />
        <Section status={rem} />
      </div>

      <footer className="mt-12 text-xs text-zinc-600">
        STM data via the official Service status API · REM data scraped from
        rem.info. Unofficial; not affiliated with STM or REM.
      </footer>
    </main>
  );
}
