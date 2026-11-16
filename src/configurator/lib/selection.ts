import type { PackageDefinition, PackageId, PanelId, VehicleDefinition } from "../types";
import { PANELS_BY_ID } from "../data/panels";
import { PACKAGES } from "../data/packages";

/** A package's panel list narrowed to what this body style actually has. */
export function resolvePackage(pkg: PackageDefinition, vehicle: VehicleDefinition): PanelId[] {
  const available = new Set(vehicle.availablePanels);
  return pkg.panelIds.filter((id) => available.has(id));
}

/** Add a panel, dropping any sibling in the same variant group (full vs partial). */
export function withPanel(selected: readonly PanelId[], id: PanelId): PanelId[] {
  const group = PANELS_BY_ID[id].variantGroup;
  const next = selected.filter((s) => s !== id && (!group || PANELS_BY_ID[s].variantGroup !== group));
  next.push(id);
  return sortByCatalog(next);
}

export function withoutPanel(selected: readonly PanelId[], id: PanelId): PanelId[] {
  return selected.filter((s) => s !== id);
}

export function togglePanel(selected: readonly PanelId[], id: PanelId): PanelId[] {
  return selected.includes(id) ? withoutPanel(selected, id) : withPanel(selected, id);
}

/** Keep only panels that exist on the given vehicle. */
export function narrowToVehicle(selected: readonly PanelId[], vehicle: VehicleDefinition): PanelId[] {
  const available = new Set(vehicle.availablePanels);
  return selected.filter((id) => available.has(id));
}

export function sameSet(a: readonly PanelId[], b: readonly PanelId[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((id) => set.has(id));
}

/** The preset whose resolved panel list equals the current selection, if any. */
export function matchPackage(selected: readonly PanelId[], vehicle: VehicleDefinition): PackageId | null {
  if (selected.length === 0) return null;
  for (const pkg of PACKAGES) {
    if (sameSet(resolvePackage(pkg, vehicle), selected)) return pkg.id;
  }
  return null;
}

/** Keep selections in catalog order so payloads and lists are stable. */
export function sortByCatalog(ids: readonly PanelId[]): PanelId[] {
  const order = new Map(Object.keys(PANELS_BY_ID).map((id, i) => [id, i]));
  return [...ids].sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
}

/** The label a panel should show for a given vehicle (e.g. Trunk Lid → Tailgate). */
export function panelLabel(id: PanelId, vehicle: VehicleDefinition): string {
  return vehicle.panelLabels?.[id] ?? PANELS_BY_ID[id].label;
}
