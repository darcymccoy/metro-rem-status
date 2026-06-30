import { getCombinedStatus } from "@/lib/status";
import { StatusCard } from "./components/StatusCard";
import type { NetworkStatus } from "@/lib/types";

function Section({ status }: { status: NetworkStatus }) {
  return (
    <section className="space-y-3">
      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">
            {status.network === "STM" ? "STM Métro" : "REM"}
          </h2>
          {!status.ok && (
            <span className="text-sm text-red-400">Status unavailable</span>
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {status.network === "STM" ? <a href="https://www.stm.info/en/info/service-updates/metro">Metro status page</a> : <a href="https://rem.info/en/travelling/network-status">REM status page</a>}
        </p>
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
          Last updated {updated}
        </p>
      </header>

      <div className="space-y-8">
        <Section status={stm} />
        <Section status={rem} />
      </div>

      <footer className="mt-12 text-xs text-zinc-600">
        Darcy McCoy - {new Date().getFullYear()}
        <span className="ml-3"><a href="https://github.com/darcymccoy/metro-rem-status">See the code on GitHub.</a></span>
      </footer>
    </main>
  );
}
