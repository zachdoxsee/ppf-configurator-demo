import { Check } from "lucide-react";
import type { PanelDefinition, PanelId } from "../types";
import { PANELS, ZONES } from "../data/panels";
import { useConfigurator } from "../state";
import { panelLabel } from "../lib/selection";
import { money, panelPriceCents } from "../lib/pricing";

/** A single panel, or a variant group (Full / Partial) rendered as one row. */
type Row = { key: string; label: string; variants: PanelDefinition[] };

function rowsForZone(zone: string, available: Set<PanelId>, vehicleLabel: (id: PanelId) => string): Row[] {
  const rows: Row[] = [];
  const seen = new Set<string>();
  for (const def of PANELS) {
    if (def.zone !== zone || !available.has(def.id)) continue;
    const key = def.variantGroup ?? def.id;
    if (seen.has(key)) {
      rows.find((r) => r.key === key)!.variants.push(def);
      continue;
    }
    seen.add(key);
    rows.push({ key, label: vehicleLabel(def.id), variants: [def] });
  }
  return rows;
}

/** Every selectable panel for the current body style, grouped by zone. */
export function PanelList() {
  const { vehicle, selected, toggle, select, deselect, hover, hovered } = useConfigurator();
  const available = new Set(vehicle.availablePanels);
  const selectedSet = new Set(selected);
  const label = (id: PanelId) => panelLabel(id, vehicle);

  return (
    <section aria-labelledby="panels-heading">
      <div className="mb-3">
        <p className="eyebrow">Step 2</p>
        <h2 id="panels-heading" className="text-lg">
          Customize panels
        </h2>
        <p className="mt-0.5 text-xs text-chalk-500">
          Fine-tune the package. Hover a row to see it on the vehicle.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {ZONES.map((zone) => {
          const rows = rowsForZone(zone.id, available, label);
          if (rows.length === 0) return null;
          const count = rows.filter((r) => r.variants.some((v) => selectedSet.has(v.id))).length;
          return (
            <div key={zone.id} className="frame overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 hairline-b">
                <span className="eyebrow text-chalk-300">{zone.label}</span>
                <span className="text-[11px] text-chalk-500">
                  {count}/{rows.length}
                </span>
              </div>
              <ul className="divide-y divide-[var(--hairline)]">
                {rows.map((row) => {
                  const active = row.variants.find((v) => selectedSet.has(v.id)) ?? null;
                  const isOn = active !== null;
                  const priceOf = active ?? row.variants[0];
                  const isHovered = row.variants.some((v) => v.id === hovered);
                  const hoverTarget = (active ?? row.variants[0]).id;
                  const onToggle = () => (isOn ? deselect(active!.id) : toggle(row.variants[0].id));
                  return (
                    <li
                      key={row.key}
                      className={`flex items-center gap-3 px-3 py-2 transition ${isHovered ? "bg-blue-500/10" : ""}`}
                      onMouseEnter={() => hover(hoverTarget)}
                      onMouseLeave={() => hover(null)}
                    >
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isOn}
                        onClick={onToggle}
                        onFocus={() => hover(hoverTarget)}
                        onBlur={() => hover(null)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span
                          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border transition ${
                            isOn ? "border-redline-500 bg-redline-500 text-white" : "border-[var(--frame)] bg-ink-800"
                          }`}
                          aria-hidden="true"
                        >
                          {isOn && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-sm font-medium ${isOn ? "text-chalk-50" : "text-chalk-300"}`}>
                            {row.label}
                          </span>
                          <span className="block truncate text-[11px] text-chalk-500">
                            {(active ?? row.variants[0]).description}
                          </span>
                        </span>
                      </button>

                      {row.variants.length > 1 && (
                        <div className="flex shrink-0 rounded-md border border-[var(--hairline-strong)] p-0.5" role="radiogroup" aria-label={`${row.label} coverage`}>
                          {row.variants.map((v) => {
                            const on = active?.id === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                role="radio"
                                aria-checked={on}
                                onClick={() => select(v.id)}
                                onMouseEnter={() => hover(v.id)}
                                onMouseLeave={() => hover(hoverTarget)}
                                className={`rounded px-2 py-0.5 text-[11px] font-semibold transition ${
                                  on ? "bg-chalk-50 text-ink-900" : "text-chalk-500 hover:text-chalk-100"
                                }`}
                              >
                                {v.variantLabel}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <span className={`w-14 shrink-0 text-right text-sm tabular-nums ${isOn ? "font-semibold text-chalk-50" : "text-chalk-500"}`}>
                        {money(panelPriceCents(priceOf.id, vehicle))}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
