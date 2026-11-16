import type { PanelId, VehicleDefinition, VehicleType, ViewDefinition, ViewId } from "../../types";
import { PANELS } from "../panels";
import { generateSideView } from "./generate/side";
import { generateFrontView } from "./generate/front";
import { generateRearView } from "./generate/rear";
import { generateTopView } from "./generate/top";
import { CONVERTIBLE, COUPE, SEDAN, SUV, TRUCK, VAN, type VehicleProfiles } from "./profiles";
import { TRACED } from "./traced";

interface BuildOptions {
  label: string;
  priceMultiplier: number;
  panelLabels?: Partial<Record<PanelId, string>>;
  /**
   * Real photography goes here. Keys are view ids; values are URLs whose
   * natural pixel size should match the view's `viewBox`. When present, the
   * generated art is skipped and the traced `panels` for that view should be
   * supplied via `tracedPanels` (export them from the built-in trace tool).
   */
  images?: Partial<Record<ViewId, string>>;
  tracedPanels?: Partial<Record<ViewId, ViewDefinition["panels"]>>;
  viewBoxes?: Partial<Record<ViewId, { width: number; height: number }>>;
}

function build(type: VehicleType, profiles: VehicleProfiles, opts: BuildOptions): VehicleDefinition {
  const generated: Record<ViewId, ViewDefinition> = {
    side: generateSideView(profiles.side),
    front: generateFrontView(profiles.front),
    rear: generateRearView(profiles.rear),
    top: generateTopView(profiles.top),
  };

  const views = Object.fromEntries(
    (Object.keys(generated) as ViewId[]).map((id) => {
      const view = generated[id];
      // Traced photography (see ./traced) wins over explicit options, which win
      // over the generated placeholder art.
      const traced = TRACED[type]?.[id];
      if (traced) {
        return [
          id,
          {
            ...view,
            image: traced.image,
            art: undefined,
            viewBox: traced.viewBox,
            panels: traced.panels.map(({ panelId, d }) => ({ panelId, d })),
          } satisfies ViewDefinition,
        ];
      }
      const image = opts.images?.[id];
      if (!image) return [id, view];
      return [
        id,
        {
          ...view,
          image,
          art: undefined,
          viewBox: opts.viewBoxes?.[id] ?? view.viewBox,
          panels: opts.tracedPanels?.[id] ?? [],
        } satisfies ViewDefinition,
      ];
    }),
  ) as Record<ViewId, ViewDefinition>;

  const present = new Set<PanelId>();
  for (const view of Object.values(views)) for (const shape of view.panels) present.add(shape.panelId);

  return {
    type,
    label: opts.label,
    panelLabels: opts.panelLabels,
    priceMultiplier: opts.priceMultiplier,
    availablePanels: PANELS.filter((p) => present.has(p.id)).map((p) => p.id),
    views,
  };
}

export const VEHICLES: Record<VehicleType, VehicleDefinition> = {
  sedan: build("sedan", SEDAN, { label: "Sedan", priceMultiplier: 1 }),
  coupe: build("coupe", COUPE, { label: "Coupe", priceMultiplier: 0.95 }),
  suv: build("suv", SUV, {
    label: "SUV",
    priceMultiplier: 1.2,
    panelLabels: { trunk: "Liftgate" },
  }),
  truck: build("truck", TRUCK, {
    label: "Pickup Truck",
    priceMultiplier: 1.25,
    panelLabels: {
      trunk: "Tailgate",
      "rear-quarters-full": "Bedsides",
      "rear-quarters-partial": "Bedsides",
      "trunk-ledge": "Rear Bumper Step",
    },
  }),
  van: build("van", VAN, {
    label: "Van",
    priceMultiplier: 1.3,
    panelLabels: { trunk: "Rear Cargo Doors", "rear-doors": "Sliding Doors" },
  }),
  convertible: build("convertible", CONVERTIBLE, { label: "Convertible", priceMultiplier: 1.05 }),
};

export const VEHICLE_ORDER: VehicleType[] = ["sedan", "coupe", "suv", "truck", "van", "convertible"];

export const VIEW_ORDER: ViewId[] = ["side", "front", "rear", "top"];
