import type { PanelShape, ViewDefinition } from "../../../types";
import type { BodyStyle } from "./side";
import { INK, ellipse, join, mirrorX, poly, rect, roundedPoly, rrect, symmetricX, xAt, type Pt } from "./geometry";

/** Front elevation in a 600×440 box, centred on x = 300. */
export interface FrontProfile {
  body: BodyStyle;
  groundY: number;
  /** Bumper bottom edge. */
  bottomY: number;
  bumperHalfW: number;
  bodyHalfW: number;
  bumperTopY: number;
  /** Hood leading edge / top of the headlights. */
  lightTopY: number;
  /** Base of the windshield. */
  hoodTopY: number;
  hoodHalfW: number;
  /** Roof top (windshield header on a convertible). */
  roofY: number;
  roofHalfW: number;
  wheelX: number;
  wheelW: number;
  wheelTopY: number;
  headlightW: number;
  headlightInset: number;
  mirrorY: number;
  grilleHalfW: number;
}

const CX = 300;
const PILLAR_W = 16;
const ROOF_BAND = 14;
const MIRROR_W = 40;
const MIRROR_H = 22;

export function generateFrontView(p: FrontProfile): ViewDefinition {
  const hasRoof = p.body !== "convertible";
  const cx = CX;

  // ---- Silhouette ---------------------------------------------------------
  const left: [Pt, number][] = [
    [[cx - p.bumperHalfW, p.bottomY], 16],
    [[cx - p.bodyHalfW, p.bumperTopY + 4], 30],
    [[cx - p.bodyHalfW, p.lightTopY + 6], 26],
    [[cx - p.hoodHalfW, p.hoodTopY], 10],
    [[cx - p.roofHalfW, p.roofY], hasRoof ? 36 : 8],
  ];
  const pts = symmetricX(left.map((e) => e[0]), cx);
  const radii = [...left.map((e) => e[1]), ...[...left].reverse().map((e) => e[1])];
  const silhouette = roundedPoly(pts, radii);

  // Hood edge: from the cowl corner down to the outer top corner of the headlight.
  const hx1 = cx - p.hoodHalfW + 10;
  const hy1 = p.hoodTopY;
  const hx2 = cx - p.bodyHalfW + p.headlightInset;
  const hy2 = p.lightTopY;
  const hoodEdgeX = (y: number) => xAt(y, hx1, hy1, hx2, hy2);

  const mirrorLeft = cx - p.hoodHalfW - MIRROR_W + 8;
  const mirrorRight = cx + p.hoodHalfW - 8;
  const mirrors = [
    rrect(mirrorLeft, p.mirrorY, MIRROR_W, MIRROR_H, 6),
    rrect(mirrorRight, p.mirrorY, MIRROR_W, MIRROR_H, 6),
  ];

  // ---- Panels --------------------------------------------------------------
  const panels: PanelShape[] = [];
  const add = (panelId: PanelShape["panelId"], d: string) => panels.push({ panelId, d });
  const both = (leftPts: Pt[]) => join(poly(leftPts), poly(mirrorX(leftPts, cx)));

  add("front-bumper", rect(cx - p.bodyHalfW - 8, p.bumperTopY, p.bodyHalfW * 2 + 16, p.bottomY - p.bumperTopY + 8));
  add(
    "hood-full",
    poly([
      [hx1, hy1],
      [2 * cx - hx1, hy1],
      [2 * cx - hx2, hy2],
      [hx2, hy2],
    ]),
  );
  const partialY = p.lightTopY - (p.lightTopY - p.hoodTopY) * 0.45;
  add(
    "hood-partial",
    poly([
      [hoodEdgeX(partialY), partialY],
      [2 * cx - hoodEdgeX(partialY), partialY],
      [2 * cx - hx2, hy2],
      [hx2, hy2],
    ]),
  );
  add(
    "front-fenders-full",
    both([
      [cx - p.bodyHalfW - 8, p.bumperTopY],
      [cx - p.bodyHalfW - 8, p.lightTopY - 26],
      [cx - p.hoodHalfW - 8, p.hoodTopY - 2],
      [hx1, hy1],
      [hx2, hy2],
      [hx2, p.bumperTopY],
    ]),
  );
  const fpY = p.lightTopY - 14;
  add(
    "front-fenders-partial",
    both([
      [cx - p.bodyHalfW - 8, p.bumperTopY],
      [cx - p.bodyHalfW - 8, fpY],
      [hoodEdgeX(fpY), fpY],
      [hx2, hy2],
      [hx2, p.bumperTopY],
    ]),
  );
  if (hasRoof) {
    add("roof", rect(cx - p.roofHalfW + 34, p.roofY - 12, (p.roofHalfW - 34) * 2, ROOF_BAND + 12));
  }
  add(
    "a-pillars",
    both([
      [cx - p.hoodHalfW - 14, p.hoodTopY + 6],
      [cx - p.roofHalfW - 16, p.roofY - 12],
      [cx - p.roofHalfW + 34, p.roofY - 12],
      [cx - p.roofHalfW + 34, p.roofY + (hasRoof ? ROOF_BAND : 6)],
      [cx - p.hoodHalfW + 10 + PILLAR_W, p.hoodTopY + 6],
    ]),
  );
  const lightH = p.bumperTopY - p.lightTopY;
  add(
    "headlights",
    join(
      rect(hx2, p.lightTopY, p.headlightW, lightH),
      rect(2 * cx - hx2 - p.headlightW, p.lightTopY, p.headlightW, lightH),
    ),
  );
  add("mirrors", join(...mirrors));

  // ---- Layers --------------------------------------------------------------
  const glassTop = p.roofY + (hasRoof ? ROOF_BAND : 6) + 4;
  const windshield = poly([
    [cx - p.hoodHalfW + 10 + PILLAR_W + 4, p.hoodTopY + 2],
    [cx - p.roofHalfW + 38, glassTop],
    [cx + p.roofHalfW - 38, glassTop],
    [cx + p.hoodHalfW - 10 - PILLAR_W - 4, p.hoodTopY + 2],
  ]);
  const layers = [
    { d: ellipse(cx, p.groundY + 2, p.bodyHalfW + 24, 10), fill: INK.shadow },
    { d: rrect(cx - p.wheelX - p.wheelW / 2, p.wheelTopY, p.wheelW, p.groundY - p.wheelTopY, 6), fill: INK.dark },
    { d: rrect(cx + p.wheelX - p.wheelW / 2, p.wheelTopY, p.wheelW, p.groundY - p.wheelTopY, 6), fill: INK.dark },
    { d: silhouette, fill: INK.body, stroke: INK.bodyStroke, strokeWidth: 1.5 },
    { d: windshield, fill: INK.glass, stroke: INK.glassStroke, strokeWidth: 1 },
    // Headlight lenses
    { d: rrect(hx2 + 4, p.lightTopY + 6, p.headlightW - 8, lightH - 12, 6), fill: "#dfe6ee", stroke: INK.glassStroke, strokeWidth: 1 },
    { d: rrect(2 * cx - hx2 - p.headlightW + 4, p.lightTopY + 6, p.headlightW - 8, lightH - 12, 6), fill: "#dfe6ee", stroke: INK.glassStroke, strokeWidth: 1 },
    // Grille and lower intake
    { d: rrect(cx - p.grilleHalfW, p.lightTopY + 8, p.grilleHalfW * 2, lightH - 16, 6), fill: INK.dark },
    { d: rrect(cx - p.grilleHalfW * 0.7, p.bumperTopY + 16, p.grilleHalfW * 1.4, 22, 6), fill: INK.interior },
    { d: rrect(cx - 40, p.bumperTopY + 48, 80, 24, 3), fill: "#d8dde2", stroke: INK.bodyStroke, strokeWidth: 1 },
    // Fog lights
    { d: ellipse(cx - p.bodyHalfW + 52, p.bumperTopY + 40, 9, 9), fill: "#dfe6ee", stroke: INK.glassStroke, strokeWidth: 1 },
    { d: ellipse(cx + p.bodyHalfW - 52, p.bumperTopY + 40, 9, 9), fill: "#dfe6ee", stroke: INK.glassStroke, strokeWidth: 1 },
    ...mirrors.map((d) => ({ d, fill: INK.body, stroke: INK.bodyStroke, strokeWidth: 1.5 })),
  ];
  if (!hasRoof) {
    layers.push({ d: rrect(cx - 60, p.roofY + 18, 36, 26, 8), fill: INK.interior });
    layers.push({ d: rrect(cx + 24, p.roofY + 18, 36, 26, 8), fill: INK.interior });
  }

  return {
    id: "front",
    label: "Front",
    viewBox: { width: 600, height: 440 },
    art: { silhouette, clipExtras: mirrors, layers },
    panels,
  };
}
