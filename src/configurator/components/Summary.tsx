import { ArrowRight, RotateCcw } from "lucide-react";
import type { ConfiguratorPayload } from "../types";
import { PACKAGES_BY_ID } from "../data/packages";
import { useConfigurator } from "../state";
import { money } from "../lib/pricing";

interface SummaryProps {
  onSubmit?: (payload: ConfiguratorPayload) => void;
  submitLabel?: string;
}

/** Running estimate and the hand-off point to the booking flow. */
export function Summary({ onSubmit, submitLabel = "Continue to booking" }: SummaryProps) {
  const { selected, matchedPackage, estimate, payload, clear } = useConfigurator();
  const count = selected.length;
  const title = matchedPackage ? PACKAGES_BY_ID[matchedPackage].name : count > 0 ? "Custom coverage" : "Nothing selected";

  return (
    <section className="frame p-4" aria-labelledby="summary-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Your build</p>
          <h2 id="summary-heading" className="text-base">
            {title}
          </h2>
          <p className="text-xs text-chalk-500">
            {count} panel{count === 1 ? "" : "s"} selected
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          disabled={count === 0}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-chalk-500 transition hover:text-chalk-50 disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset
        </button>
      </div>

      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between text-chalk-300">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{money(estimate.subtotalCents)}</dd>
        </div>
        {estimate.discountCents > 0 && (
          <div className="flex justify-between text-chalk-300">
            <dt>Package discount ({estimate.discountPercent}%)</dt>
            <dd className="tabular-nums">−{money(estimate.discountCents)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-[var(--hairline-strong)] pt-2 text-base font-bold text-chalk-50">
          <dt>Estimate</dt>
          <dd className="tabular-nums">{money(estimate.totalCents)}</dd>
        </div>
      </dl>
      <p className="mt-1 text-[11px] text-chalk-600">Placeholder pricing — final quote confirmed by the shop.</p>

      <button
        type="button"
        disabled={count === 0}
        onClick={() => onSubmit?.(payload)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-redline-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-redline-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitLabel}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </section>
  );
}
