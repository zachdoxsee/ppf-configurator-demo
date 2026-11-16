import { MousePointerClick } from "lucide-react";
import { VIEW_ORDER } from "../data/vehicles";
import { PANELS_BY_ID } from "../data/panels";
import { useConfigurator } from "../state";
import { panelLabel } from "../lib/selection";
import { VehicleView } from "./VehicleView";

/** Large active view plus a strip of clickable thumbnails for the other angles. */
export function VehicleStage() {
  const { vehicle, activeView, setView, hovered, selected } = useConfigurator();
  const view = vehicle.views[activeView];

  let caption: string;
  if (hovered) {
    const def = PANELS_BY_ID[hovered];
    const label = panelLabel(hovered, vehicle);
    const name = def.variantLabel ? `${label} · ${def.variantLabel}` : label;
    caption = selected.includes(hovered) ? `${name} — click to remove` : `${name} — click to add`;
  } else {
    caption = "Click a panel to add it. Click again to remove.";
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="frame overflow-hidden">
        <div className="ppf-stage relative p-4 sm:p-6">
          <VehicleView view={view} className="mx-auto max-w-[960px]" />
          <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-ink-800 shadow-sm backdrop-blur">
            <MousePointerClick className="h-3.5 w-3.5 text-redline-500" aria-hidden="true" />
            <span aria-live="polite">{caption}</span>
          </div>
          <div className="pointer-events-none absolute right-4 top-4 hidden rounded-full bg-ink-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-chalk-100 sm:block">
            {view.label}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3" role="tablist" aria-label="Vehicle views">
        {VIEW_ORDER.map((id) => {
          const v = vehicle.views[id];
          const active = id === activeView;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setView(id)}
              className={`frame group flex flex-col overflow-hidden text-left transition ${
                active ? "border-redline-500" : "hover:border-[var(--frame-hover)]"
              }`}
            >
              <div className="ppf-stage w-full p-2">
                <VehicleView view={v} compact />
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider">
                <span className={active ? "text-chalk-50" : "text-chalk-500 group-hover:text-chalk-300"}>
                  {v.label}
                </span>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-redline-500" aria-hidden="true" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
