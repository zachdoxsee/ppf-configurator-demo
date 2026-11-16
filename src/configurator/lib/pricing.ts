import type { PackageId, PanelId, VehicleDefinition } from "../types";
import { PANELS_BY_ID } from "../data/panels";
import { PACKAGES_BY_ID } from "../data/packages";

/** Placeholder pricing: catalog base × body-style multiplier, rounded to the dollar. */
export function panelPriceCents(id: PanelId, vehicle: VehicleDefinition): number {
  return Math.round((PANELS_BY_ID[id].basePriceCents * vehicle.priceMultiplier) / 100) * 100;
}

export interface Estimate {
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  discountPercent: number;
}

export function estimate(
  selected: readonly PanelId[],
  vehicle: VehicleDefinition,
  packageId: PackageId | null,
): Estimate {
  const subtotalCents = selected.reduce((sum, id) => sum + panelPriceCents(id, vehicle), 0);
  const discountPercent = packageId ? PACKAGES_BY_ID[packageId].discountPercent : 0;
  const discountCents = Math.round((subtotalCents * discountPercent) / 100 / 100) * 100;
  return { subtotalCents, discountCents, totalCents: subtotalCents - discountCents, discountPercent };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function money(cents: number): string {
  return usd.format(cents / 100);
}
