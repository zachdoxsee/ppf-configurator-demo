import { Check, Sparkles } from "lucide-react";
import { PACKAGES } from "../data/packages";
import { useConfigurator } from "../state";
import { resolvePackage } from "../lib/selection";
import { estimate, money } from "../lib/pricing";

/** Preset package cards. The active card is whichever preset the selection matches exactly. */
export function PackagePicker() {
  const { vehicle, matchedPackage, selected, applyPackage } = useConfigurator();
  const isCustom = selected.length > 0 && !matchedPackage;

  return (
    <section aria-labelledby="packages-heading">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="eyebrow">Step 1</p>
          <h2 id="packages-heading" className="text-lg">
            Choose a package
          </h2>
        </div>
        {isCustom && (
          <span className="inline-flex items-center gap-1 rounded-full border border-redline-500/60 bg-redline-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-redline-400">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Custom
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="PPF packages">
        {PACKAGES.map((pkg) => {
          const ids = resolvePackage(pkg, vehicle);
          const est = estimate(ids, vehicle, pkg.id);
          const active = matchedPackage === pkg.id;
          return (
            <button
              key={pkg.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => applyPackage(pkg.id)}
              className={`frame relative flex flex-col gap-1 p-3 text-left transition ${
                active
                  ? "border-redline-500 bg-redline-500/10"
                  : "hover:border-[var(--frame-hover)] hover:bg-ink-800"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-bold leading-tight text-chalk-50">{pkg.name}</span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    active ? "border-redline-500 bg-redline-500 text-white" : "border-[var(--frame)]"
                  }`}
                  aria-hidden="true"
                >
                  {active && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
              </div>
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${pkg.tone === "brand" ? "text-redline-400" : "text-chalk-500"}`}>
                {pkg.tagline}
              </span>
              <span className="mt-1 text-xs leading-snug text-chalk-300">{pkg.description}</span>
              <span className="mt-2 flex items-baseline justify-between">
                <span className="text-xs text-chalk-500">
                  {ids.length} panel{ids.length === 1 ? "" : "s"}
                </span>
                <span className="text-sm font-bold text-chalk-50">{money(est.totalCents)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
