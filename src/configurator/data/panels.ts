import type { PanelDefinition, PanelId, Zone } from "../types";

/**
 * Canonical panel catalog. Order here is the order rows appear in the UI.
 * Prices are placeholders in cents so the demo can show a running estimate;
 * real pricing comes from the backend.
 */
export const PANELS: PanelDefinition[] = [
  // ---- Front -------------------------------------------------------------
  {
    id: "hood-full",
    label: "Hood",
    zone: "front",
    variantGroup: "hood",
    variantLabel: "Full",
    description: "Entire hood surface, edges wrapped.",
    basePriceCents: 45000,
  },
  {
    id: "hood-partial",
    label: "Hood",
    zone: "front",
    variantGroup: "hood",
    variantLabel: "Partial",
    description: "Leading 18–24\" of the hood.",
    basePriceCents: 22500,
  },
  {
    id: "front-fenders-full",
    label: "Front Fenders",
    zone: "front",
    variantGroup: "front-fenders",
    variantLabel: "Full",
    description: "Both front fenders, full coverage.",
    basePriceCents: 30000,
  },
  {
    id: "front-fenders-partial",
    label: "Front Fenders",
    zone: "front",
    variantGroup: "front-fenders",
    variantLabel: "Partial",
    description: "Leading edge of both front fenders.",
    basePriceCents: 15000,
  },
  {
    id: "front-bumper",
    label: "Front Bumper",
    zone: "front",
    description: "Full painted bumper cover.",
    basePriceCents: 40000,
  },
  {
    id: "headlights",
    label: "Headlights",
    zone: "front",
    description: "Both headlight lenses.",
    basePriceCents: 12000,
  },
  {
    id: "mirrors",
    label: "Mirror Caps",
    zone: "front",
    description: "Both side mirror housings.",
    basePriceCents: 9000,
  },
  {
    id: "a-pillars",
    label: "A-Pillars & Roof Edge",
    zone: "front",
    description: "Windshield pillars and leading roof edge.",
    basePriceCents: 14000,
  },

  // ---- Sides -------------------------------------------------------------
  {
    id: "front-doors",
    label: "Front Doors",
    zone: "side",
    description: "Both front door skins.",
    basePriceCents: 38000,
  },
  {
    id: "rear-doors",
    label: "Rear Doors",
    zone: "side",
    description: "Both rear door skins.",
    basePriceCents: 36000,
  },
  {
    id: "rocker-panels",
    label: "Rocker Panels",
    zone: "side",
    description: "Sills below the doors.",
    basePriceCents: 22000,
  },
  {
    id: "rear-quarters-full",
    label: "Rear Quarter Panels",
    zone: "side",
    variantGroup: "rear-quarters",
    variantLabel: "Full",
    description: "Both rear quarter panels, full coverage.",
    basePriceCents: 42000,
  },
  {
    id: "rear-quarters-partial",
    label: "Rear Quarter Panels",
    zone: "side",
    variantGroup: "rear-quarters",
    variantLabel: "Wheel Arch",
    description: "Impact area ahead of the rear wheels.",
    basePriceCents: 16000,
  },
  {
    id: "door-cups",
    label: "Door Handle Cups",
    zone: "side",
    description: "Recess behind each door handle.",
    basePriceCents: 6000,
  },
  {
    id: "door-edges",
    label: "Door Edges",
    zone: "side",
    description: "Trailing edge of each door.",
    basePriceCents: 8000,
  },

  // ---- Rear --------------------------------------------------------------
  {
    id: "trunk",
    label: "Trunk Lid",
    zone: "rear",
    description: "Rear closure panel.",
    basePriceCents: 30000,
  },
  {
    id: "rear-bumper",
    label: "Rear Bumper",
    zone: "rear",
    description: "Full painted bumper cover.",
    basePriceCents: 38000,
  },
  {
    id: "trunk-ledge",
    label: "Rear Bumper Ledge",
    zone: "rear",
    description: "Loading edge on top of the rear bumper.",
    basePriceCents: 7000,
  },
  {
    id: "taillights",
    label: "Taillights",
    zone: "rear",
    description: "Both taillight lenses.",
    basePriceCents: 10000,
  },

  // ---- Roof --------------------------------------------------------------
  {
    id: "roof",
    label: "Roof",
    zone: "roof",
    description: "Full roof panel.",
    basePriceCents: 35000,
  },
];

export const PANELS_BY_ID: Record<PanelId, PanelDefinition> = Object.fromEntries(
  PANELS.map((p) => [p.id, p]),
) as Record<PanelId, PanelDefinition>;

export const ZONES: { id: Zone; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "side", label: "Sides" },
  { id: "rear", label: "Rear" },
  { id: "roof", label: "Roof" },
];
