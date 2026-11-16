/**
 * Core types for the PPF (paint protection film) per-panel configurator.
 *
 * Everything the backend needs to persist is expressed in terms of
 * `VehicleType`, `PanelId` and `PackageId` string ids — the geometry below is
 * purely presentational and can be swapped per vehicle without touching the
 * booking payload.
 */

export type VehicleType =
  | "truck"
  | "sedan"
  | "coupe"
  | "suv"
  | "van"
  | "convertible";

export type ViewId = "side" | "front" | "rear" | "top";

export type Zone = "front" | "side" | "rear" | "roof";

export type PanelId =
  // Front zone
  | "front-bumper"
  | "hood-full"
  | "hood-partial"
  | "front-fenders-full"
  | "front-fenders-partial"
  | "headlights"
  | "mirrors"
  | "a-pillars"
  // Side zone
  | "front-doors"
  | "rear-doors"
  | "door-cups"
  | "door-edges"
  | "rocker-panels"
  | "rear-quarters-full"
  | "rear-quarters-partial"
  // Rear zone
  | "rear-bumper"
  | "trunk"
  | "taillights"
  | "trunk-ledge"
  // Roof
  | "roof";

export interface PanelDefinition {
  id: PanelId;
  label: string;
  zone: Zone;
  /**
   * Panels that share a `variantGroup` are mutually exclusive — e.g. a hood is
   * either fully wrapped or partially wrapped, never both. The UI renders them
   * as a single row with a Full / Partial switch.
   */
  variantGroup?: string;
  variantLabel?: string;
  description?: string;
  /** Placeholder list price in cents — the backend owns real pricing. */
  basePriceCents: number;
}

export type PackageId = "partial-front" | "full-front" | "track" | "full-body";

export interface PackageDefinition {
  id: PackageId;
  name: string;
  tagline: string;
  description: string;
  /**
   * Canonical panel list. When a vehicle lacks a panel (a convertible has no
   * roof), it is simply dropped when the package is applied.
   */
  panelIds: PanelId[];
  /** Whole-percent discount applied to the summed panel prices. */
  discountPercent: number;
  /** Visual accent used on the preset card. */
  tone: "neutral" | "brand" | "dark";
}

/** One selectable region drawn over a vehicle view. */
export interface PanelShape {
  panelId: PanelId;
  /** SVG path data in the view's viewBox coordinate space. */
  d: string;
}

/**
 * Non-interactive placeholder line-art used until real vehicle photography is
 * traced. Every layer is raw SVG path data in the view's coordinate space.
 */
export interface ViewArt {
  /** Body outline; also used as the clip path for the panel overlays. */
  silhouette: string;
  /** Additional shapes that are part of the clip (e.g. mirrors in the top view). */
  clipExtras?: string[];
  /** Ordered decorative layers drawn underneath the panel overlays. */
  layers: ArtLayer[];
}

export interface ArtLayer {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

export interface ViewDefinition {
  id: ViewId;
  label: string;
  viewBox: { width: number; height: number };
  /**
   * Optional raster background (e.g. `/vehicles/truck/side.png`). When set,
   * the placeholder `art` is skipped and `panels` are expected to be traced
   * against the image's natural pixel dimensions (= `viewBox`).
   */
  image?: string;
  art?: ViewArt;
  panels: PanelShape[];
}

export interface VehicleDefinition {
  type: VehicleType;
  label: string;
  /** Vehicle-specific naming, e.g. trunk → "Tailgate" on a truck. */
  panelLabels?: Partial<Record<PanelId, string>>;
  /** Panels this body style has at all. Everything else is hidden. */
  availablePanels: PanelId[];
  /** Multiplier applied to `basePriceCents` for this body style. */
  priceMultiplier: number;
  views: Record<ViewId, ViewDefinition>;
}

/** What the frontend hands to the booking backend. */
export interface ConfiguratorPayload {
  vehicleType: VehicleType;
  /** Set when the selection exactly matches a preset, otherwise null (custom). */
  packageId: PackageId | null;
  panels: PanelId[];
  estimate: {
    subtotalCents: number;
    discountCents: number;
    totalCents: number;
    currency: "USD";
  };
}
