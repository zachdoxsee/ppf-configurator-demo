import { useState } from "react";
import { Copy, X } from "lucide-react";
import { Configurator } from "./configurator";
import { Gallery } from "./dev/Gallery";
import { TraceTool } from "./dev/TraceTool";
import type { ConfiguratorPayload } from "./configurator";

export default function App() {
  const [payload, setPayload] = useState<ConfiguratorPayload | null>(null);
  const params = new URLSearchParams(window.location.search);
  if (import.meta.env.DEV && params.has("gallery")) return <Gallery />;
  if (import.meta.env.DEV && params.has("trace")) return <TraceTool />;

  return (
    <div className="min-h-screen">
      <header className="hairline-b">
        <div className="shell flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-redline-500 text-sm font-black text-white">R</span>
            <div>
              <p className="eyebrow">Redline Labs · Booking</p>
              <h1 className="text-xl leading-tight">Paint Protection Film</h1>
            </div>
          </div>
          <p className="hidden text-sm text-chalk-500 sm:block">Build your coverage, then book your install.</p>
        </div>
      </header>

      <main className="shell py-6">
        <Configurator onSubmit={setPayload} />
      </main>

      {payload && <PayloadDialog payload={payload} onClose={() => setPayload(null)} />}
    </div>
  );
}

/** Demo-only: shows exactly what the booking backend will receive. */
function PayloadDialog({ payload, onClose }: { payload: ConfiguratorPayload; onClose: () => void }) {
  const json = JSON.stringify(payload, null, 2);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="payload-title">
      <div className="frame w-full max-w-lg p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Handoff</p>
            <h2 id="payload-title" className="text-lg">
              Booking payload
            </h2>
            <p className="text-xs text-chalk-500">This is what gets POSTed to the booking API.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-chalk-500 hover:text-chalk-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-ink-950 p-3 text-xs leading-relaxed text-chalk-300">{json}</pre>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(json)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--frame)] px-3 py-2 text-sm font-semibold text-chalk-100 hover:border-[var(--frame-hover)]"
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copy JSON
          </button>
          <button type="button" onClick={onClose} className="rounded-lg bg-redline-500 px-3 py-2 text-sm font-bold text-white hover:bg-redline-400">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
