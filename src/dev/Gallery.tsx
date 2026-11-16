import { PANELS, PANELS_BY_ID } from "../configurator/data/panels";
import { VEHICLES, VEHICLE_ORDER, VIEW_ORDER } from "../configurator/data/vehicles";
import type { PanelId, ViewDefinition } from "../configurator/types";

/**
 * Dev-only: every vehicle × view with each panel tinted a distinct colour, so
 * the cut-outs can be checked at a glance. Open with `?gallery`.
 */
const HUES: Record<PanelId, string> = Object.fromEntries(
  PANELS.map((p, i) => [p.id, `hsl(${(i * 137.5) % 360} 70% 55% / 0.55)`]),
) as Record<PanelId, string>;

function TintedView({ view }: { view: ViewDefinition }) {
  const { width, height } = view.viewBox;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-lg bg-[#f6f7f9]">
      <defs>
        <clipPath id={`clip-${view.id}-${width}`}>
          {view.art && <path d={view.art.silhouette} />}
          {view.art?.clipExtras?.map((d, i) => <path key={i} d={d} />)}
        </clipPath>
      </defs>
      {view.art?.layers.map((l, i) => (
        <path key={i} d={l.d} fill={l.fill ?? "none"} stroke={l.stroke} strokeWidth={l.strokeWidth} strokeLinejoin="round" />
      ))}
      <g clipPath={view.art ? `url(#clip-${view.id}-${width})` : undefined}>
        {view.panels.map((s, i) => (
          <path key={i} d={s.d} fill={HUES[s.panelId]} stroke="#222" strokeWidth={1} strokeLinejoin="round">
            <title>{s.panelId}</title>
          </path>
        ))}
      </g>
    </svg>
  );
}

export function Gallery() {
  const params = new URLSearchParams(window.location.search);
  const only = params.get("vehicle");
  const onlyView = params.get("view");
  const vehicles = only ? VEHICLE_ORDER.filter((v) => v === only) : VEHICLE_ORDER;
  const views = onlyView ? VIEW_ORDER.filter((v) => v === onlyView) : VIEW_ORDER;
  const cols = onlyView ? "grid-cols-1" : "grid-cols-[3fr_2fr_2fr_3fr]";
  return (
    <div className={onlyView ? "p-2" : "shell py-6"}>
      {!onlyView && <h1 className="text-xl">Panel geometry gallery</h1>}
      <div className={`mt-3 flex flex-wrap gap-2 text-[11px] ${onlyView ? "hidden" : ""}`}>
        {PANELS.map((p) => (
          <span key={p.id} className="inline-flex items-center gap-1 rounded border border-[var(--hairline-strong)] px-1.5 py-0.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: HUES[p.id] }} />
            {p.id}
          </span>
        ))}
      </div>
      {vehicles.map((type) => {
        const v = VEHICLES[type];
        return (
          <section key={type} className={onlyView ? "" : "mt-8"}>
            {!onlyView && (
              <h2 className="mb-2 text-lg">
                {v.label} <span className="text-sm font-normal text-chalk-500">{v.availablePanels.length} panels</span>
              </h2>
            )}
            <div className={`grid ${cols} gap-3`}>
              {views.map((id) => (
                <div key={id} className={onlyView && (id === "front" || id === "rear") ? "mx-auto w-full max-w-[600px]" : ""}>
                  <TintedView view={v.views[id]} />
                  <p className="mt-1 text-xs text-chalk-500">
                    {id} · {v.views[id].panels.length} shapes ·{" "}
                    {[...new Set(v.views[id].panels.map((s) => s.panelId))].map((p) => PANELS_BY_ID[p].label).length} panels
                  </p>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
