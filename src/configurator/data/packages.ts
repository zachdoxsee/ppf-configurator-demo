import type { PackageDefinition, PackageId } from "../types";

/**
 * Preset PPF packages. Each is just a canonical panel list; vehicles that lack
 * a panel drop it when the package is applied (see `lib/selection.ts`).
 */
export const PACKAGES: PackageDefinition[] = [
  {
    id: "partial-front",
    name: "Partial Front",
    tagline: "Highway essentials",
    description:
      "Leading edges only — the surfaces that take the most rock chips on the highway.",
    panelIds: ["hood-partial", "front-fenders-partial", "front-bumper", "mirrors"],
    discountPercent: 5,
    tone: "neutral",
  },
  {
    id: "full-front",
    name: "Full Front",
    tagline: "Most popular",
    description:
      "Complete front-end coverage with no visible film lines on the hood or fenders.",
    panelIds: [
      "hood-full",
      "front-fenders-full",
      "front-bumper",
      "headlights",
      "mirrors",
    ],
    discountPercent: 8,
    tone: "brand",
  },
  {
    id: "track",
    name: "Track Package",
    tagline: "Full front + impact zones",
    description:
      "Everything in Full Front plus the pillars, rockers, rear arches and high-wear touch points.",
    panelIds: [
      "hood-full",
      "front-fenders-full",
      "front-bumper",
      "headlights",
      "mirrors",
      "a-pillars",
      "rocker-panels",
      "rear-quarters-partial",
      "door-cups",
      "door-edges",
      "trunk-ledge",
    ],
    discountPercent: 10,
    tone: "neutral",
  },
  {
    id: "full-body",
    name: "Full Body",
    tagline: "Every painted panel",
    description:
      "Nose to tail. Every painted exterior panel plus lights, mirrors and touch points.",
    panelIds: [
      "hood-full",
      "front-fenders-full",
      "front-bumper",
      "headlights",
      "mirrors",
      "a-pillars",
      "front-doors",
      "rear-doors",
      "rocker-panels",
      "rear-quarters-full",
      "door-cups",
      "door-edges",
      "trunk",
      "rear-bumper",
      "trunk-ledge",
      "taillights",
      "roof",
    ],
    discountPercent: 15,
    tone: "dark",
  },
];

export const PACKAGES_BY_ID: Record<PackageId, PackageDefinition> = Object.fromEntries(
  PACKAGES.map((p) => [p.id, p]),
) as Record<PackageId, PackageDefinition>;
