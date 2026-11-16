import type { PanelShape, VehicleType, ViewId } from "../../../types";

/**
 * Traced panel overlays for real vehicle photography.
 *
 * Workflow:
 *   1. Drop the image in `public/vehicles/<vehicle>/<view>.png` (white
 *      background, one vehicle, no perspective distortion).
 *   2. Run the app with `?trace`, load the image, pick each panel and click
 *      around it. Export → JSON.
 *   3. Save the JSON as `traced/<vehicle>.<view>.json` and register it below.
 *
 * Registered views replace the generated placeholder art automatically.
 */
export interface TracedView {
  vehicle: VehicleType;
  view: ViewId;
  /** Public URL of the photo. */
  image: string;
  /** Natural pixel size of the photo — the overlay coordinate space. */
  viewBox: { width: number; height: number };
  panels: (PanelShape & { points?: [number, number][] })[];
}

// Example once you have a traced file:
//   import truckSide from "./truck.side.json";
//   export const TRACED = { truck: { side: truckSide as TracedView } };
export const TRACED: Partial<Record<VehicleType, Partial<Record<ViewId, TracedView>>>> = {};
