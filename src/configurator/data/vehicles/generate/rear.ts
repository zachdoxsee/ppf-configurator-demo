import type { PanelShape, ViewDefinition } from "../../../types";
import type { BodyStyle } from "./side";
import { INK, ellipse, join, mirrorX, poly, rect, roundedPoly, rrect, symmetricX, xAt, type Pt } from "./geometry";

/** Rear elevation in a 600×440 box, centred on x = 300. */
export interface RearProfile {
  body: BodyStyle;
  groundY: number;
  bottomY: number;
  bumperHalfW: number;
  bodyHalfW: number;
  bumperTopY: number;
  /** Top of the painted closure face (trunk face / tailgate / liftgate). */
  deckY: number;
  /** Where the body sides begin tapering inward toward the roof. */
  shoulderY: number;
  /** Half width at the base of the rear glass. */
  deckHalfW: number;
  /** Base of the rear glass. */
  deckTopY: number;
  roofY: number;
  roofHalfW: number;
  wheelX: number;
  wheelW: number;
  wheelTopY: number;
  taillightW: number;
  taillightH: number;
  taillightInset: number;
  mirrorY: number;
  /** Trucks only — cab dimensions above the bed. */
  cab?: { halfW: number; glassBottomY: number };
}

const CX = 300;
const ROOF_BAND = 14;
const LEDGE_H = 12;
const QUARTER_W = 26;
const MIRROR_W = 40;
const MIRROR_H = 22;
const LENS = { fill: "#ecb7bb", stroke: "#c9878d" };

export function generateRearView(p: RearProfile): ViewDefinition {
  const cx = CX;
  const isTruck = p.body === "truck";
  const isBoxy = p.body === "suv" || p.body === "van";
  const hasRoof = p.body !== "convertible";
  const ledgeTopY = p.bumperTopY - LEDGE_H;
  const lightInner = p.bodyHalfW - p.taillightInset - p.taillightW;

  // ---- Silhouette ---------------------------------------------------------
  let left: [Pt, number][];
  if (isTruck && p.cab) {
    left = [
      [[cx - p.bumperHalfW, p.bottomY], 14],
      [[cx - p.bodyHalfW, p.bumperTopY + 4], 14],
      [[cx - p.bodyHalfW, p.deckY], 8],
      [[cx - p.cab.halfW, p.deckY], 0],
      [[cx - p.cab.halfW, p.roofY], 30],
    ];
  } else if (isBoxy) {
    left = [
      [[cx - p.bumperHalfW, p.bottomY], 16],
      [[cx - p.bodyHalfW, p.bumperTopY + 4], 24],
      [[cx - p.bodyHalfW, p.shoulderY], 44],
      [[cx - p.roofHalfW, p.roofY], 30],
    ];
  } else if (hasRoof) {
    left = [
      [[cx - p.bumperHalfW, p.bottomY], 16],
      [[cx - p.bodyHalfW, p.bumperTopY + 4], 30],
      [[cx - p.bodyHalfW, p.shoulderY + 6], 26],
      [[cx - p.deckHalfW, p.deckTopY], 12],
      [[cx - p.roofHalfW, p.roofY], 36],
    ];
  } else {
    left = [
      [[cx - p.bumperHalfW, p.bottomY], 16],
      [[cx - p.bodyHalfW, p.bumperTopY + 4], 30],
      [[cx - p.bodyHalfW, p.shoulderY + 6], 26],
      [[cx - p.deckHalfW, p.deckTopY], 14],
    ];
  }
  const pts = symmetricX(left.map((e) => e[0]), cx);
  const radii = [...left.map((e) => e[1]), ...[...left].reverse().map((e) => e[1])];
  const silhouette = roundedPoly(pts, radii);

  // Mirrors sit just outboard of the body at their height. On tapered tails the
  // side is the shoulder-to-deck line, so find where that line is at mirrorY.
  let bodyEdgeAtMirror = cx - p.bodyHalfW;
  let mirrorW = MIRROR_W;
  if (isTruck && p.cab) {
    // Truck mirrors hang off the (narrower) cab and reach out past the bed.
    bodyEdgeAtMirror = cx - p.cab.halfW;
    mirrorW = 58;
  } else if (!isBoxy && p.mirrorY < p.shoulderY + 6) {
    bodyEdgeAtMirror = xAt(p.mirrorY, cx - p.bodyHalfW, p.shoulderY + 6, cx - p.deckHalfW, p.deckTopY);
  }
  const mirrorOverlap = 10;
  const mirrors = [
    rrect(bodyEdgeAtMirror - mirrorW + mirrorOverlap, p.mirrorY, mirrorW, MIRROR_H, 6),
    rrect(2 * cx - bodyEdgeAtMirror - mirrorOverlap, p.mirrorY, mirrorW, MIRROR_H, 6),
  ];

  // ---- Panels --------------------------------------------------------------
  const panels: PanelShape[] = [];
  const add = (panelId: PanelShape["panelId"], d: string) => panels.push({ panelId, d });
  const both = (leftPts: Pt[]) => join(poly(leftPts), poly(mirrorX(leftPts, cx)));

  add("rear-bumper", rect(cx - p.bodyHalfW - 8, p.bumperTopY, p.bodyHalfW * 2 + 16, p.bottomY - p.bumperTopY + 8));

  const lightY = isTruck ? p.deckY + 8 : isBoxy ? p.deckY - 14 : p.deckY;

  if (isTruck) {
    add("trunk", rect(cx - lightInner, p.deckY + 4, lightInner * 2, ledgeTopY - p.deckY - 4));
    add(
      "rear-quarters-full",
      both([
        [cx - p.bodyHalfW - 8, ledgeTopY],
        [cx - p.bodyHalfW - 8, p.deckY - 8],
        [cx - lightInner, p.deckY - 8],
        [cx - lightInner, ledgeTopY],
      ]),
    );
  } else if (isBoxy) {
    add("trunk", rect(cx - (p.bodyHalfW - QUARTER_W), p.deckY, (p.bodyHalfW - QUARTER_W) * 2, ledgeTopY - p.deckY));
    add(
      "rear-quarters-full",
      both([
        [cx - p.bodyHalfW - 8, ledgeTopY],
        [cx - p.bodyHalfW - 8, p.roofY + 26],
        [cx - p.bodyHalfW + QUARTER_W, p.roofY + 44],
        [cx - p.bodyHalfW + QUARTER_W, ledgeTopY],
      ]),
    );
  } else {
    add(
      "trunk",
      poly([
        [cx - p.deckHalfW + 6, p.deckTopY],
        [cx + p.deckHalfW - 6, p.deckTopY],
        [cx + p.deckHalfW - 6, p.deckY],
        [cx + lightInner, p.deckY],
        [cx + lightInner, p.deckY + p.taillightH],
        [cx + p.bodyHalfW - p.taillightInset, p.deckY + p.taillightH],
        [cx + p.bodyHalfW - p.taillightInset, ledgeTopY],
        [cx - p.bodyHalfW + p.taillightInset, ledgeTopY],
        [cx - p.bodyHalfW + p.taillightInset, p.deckY + p.taillightH],
        [cx - lightInner, p.deckY + p.taillightH],
        [cx - lightInner, p.deckY],
        [cx - p.deckHalfW + 6, p.deckY],
      ]),
    );
    add(
      "rear-quarters-full",
      both([
        [cx - p.bodyHalfW - 8, ledgeTopY],
        [cx - p.bodyHalfW - 8, p.shoulderY - 28],
        [cx - p.deckHalfW + 6, p.deckTopY],
        [cx - p.bodyHalfW + p.taillightInset, p.deckY],
        [cx - p.bodyHalfW + p.taillightInset, ledgeTopY],
      ]),
    );
  }
  // Rear wheel-arch impact zone: the lower outer corners.
  add(
    "rear-quarters-partial",
    both([
      [cx - p.bodyHalfW - 8, ledgeTopY],
      [cx - p.bodyHalfW - 8, ledgeTopY - 40],
      [cx - p.bodyHalfW + QUARTER_W, ledgeTopY - 40],
      [cx - p.bodyHalfW + QUARTER_W, ledgeTopY],
    ]),
  );
  add("trunk-ledge", rect(cx - p.bodyHalfW - 8, ledgeTopY, p.bodyHalfW * 2 + 16, LEDGE_H));
  if (hasRoof) {
    const rhw = isTruck && p.cab ? p.cab.halfW : p.roofHalfW;
    add("roof", rect(cx - rhw + 34, p.roofY - 12, (rhw - 34) * 2, ROOF_BAND + 12));
  }
  add(
    "taillights",
    both([
      [cx - p.bodyHalfW + p.taillightInset, lightY],
      [cx - lightInner, lightY],
      [cx - lightInner, lightY + p.taillightH],
      [cx - p.bodyHalfW + p.taillightInset, lightY + p.taillightH],
    ]),
  );
  add("mirrors", join(...mirrors));

  // ---- Layers --------------------------------------------------------------
  const layers: { d: string; fill?: string; stroke?: string; strokeWidth?: number }[] = [
    { d: ellipse(cx, p.groundY + 2, p.bodyHalfW + 24, 10), fill: INK.shadow },
    { d: rrect(cx - p.wheelX - p.wheelW / 2, p.wheelTopY, p.wheelW, p.groundY - p.wheelTopY, 6), fill: INK.dark },
    { d: rrect(cx + p.wheelX - p.wheelW / 2, p.wheelTopY, p.wheelW, p.groundY - p.wheelTopY, 6), fill: INK.dark },
  ];
  if (!hasRoof) {
    // Windshield frame and headrests peek up behind the deck.
    layers.push({
      d: poly([
        [cx - p.roofHalfW, p.roofY],
        [cx + p.roofHalfW, p.roofY],
        [cx + p.deckHalfW - 14, p.deckTopY + 6],
        [cx - p.deckHalfW + 14, p.deckTopY + 6],
      ]),
      fill: INK.body,
      stroke: INK.bodyStroke,
      strokeWidth: 1.5,
    });
    layers.push({
      d: poly([
        [cx - p.roofHalfW + 14, p.roofY + 10],
        [cx + p.roofHalfW - 14, p.roofY + 10],
        [cx + p.deckHalfW - 26, p.deckTopY],
        [cx - p.deckHalfW + 26, p.deckTopY],
      ]),
      fill: INK.glass,
      stroke: INK.glassStroke,
      strokeWidth: 1,
    });
    layers.push({ d: rrect(cx - 80, p.deckTopY - 26, 44, 30, 9), fill: INK.interior });
    layers.push({ d: rrect(cx + 36, p.deckTopY - 26, 44, 30, 9), fill: INK.interior });
  }
  layers.push({ d: silhouette, fill: INK.body, stroke: INK.bodyStroke, strokeWidth: 1.5 });

  // Rear glass
  if (isTruck && p.cab) {
    layers.push({
      d: rrect(cx - p.cab.halfW + 24, p.roofY + ROOF_BAND + 6, (p.cab.halfW - 24) * 2, p.cab.glassBottomY - p.roofY - ROOF_BAND - 6, 6),
      fill: INK.glass,
      stroke: INK.glassStroke,
      strokeWidth: 1,
    });
  } else if (isBoxy) {
    layers.push({
      d: rrect(cx - p.deckHalfW, p.deckTopY, p.deckHalfW * 2, p.deckY - 8 - p.deckTopY, 8),
      fill: INK.glass,
      stroke: INK.glassStroke,
      strokeWidth: 1,
    });
    if (p.body === "van") {
      layers.push({ d: rect(cx - 1, p.deckTopY, 2, ledgeTopY - p.deckTopY), fill: INK.bodyStroke });
    }
  } else if (hasRoof) {
    layers.push({
      d: poly([
        [cx - p.deckHalfW + 12, p.deckTopY - 2],
        [cx - p.roofHalfW + 38, p.roofY + ROOF_BAND + 4],
        [cx + p.roofHalfW - 38, p.roofY + ROOF_BAND + 4],
        [cx + p.deckHalfW - 12, p.deckTopY - 2],
      ]),
      fill: INK.glass,
      stroke: INK.glassStroke,
      strokeWidth: 1,
    });
  }
  // Taillight lenses, plate, exhausts, mirrors
  layers.push(
    { d: rrect(cx - p.bodyHalfW + p.taillightInset + 4, lightY + 5, p.taillightW - 8, p.taillightH - 10, 5), ...LENS, strokeWidth: 1 },
    { d: rrect(cx + p.bodyHalfW - p.taillightInset - p.taillightW + 4, lightY + 5, p.taillightW - 8, p.taillightH - 10, 5), ...LENS, strokeWidth: 1 },
    { d: rrect(cx - 40, ledgeTopY - 38, 80, 24, 3), fill: "#d8dde2", stroke: INK.bodyStroke, strokeWidth: 1 },
    { d: rrect(cx - p.bodyHalfW + 44, p.bottomY - 24, 30, 12, 4), fill: INK.dark },
    { d: rrect(cx + p.bodyHalfW - 74, p.bottomY - 24, 30, 12, 4), fill: INK.dark },
    ...mirrors.map((d) => ({ d, fill: INK.body, stroke: INK.bodyStroke, strokeWidth: 1.5 })),
  );

  return {
    id: "rear",
    label: "Rear",
    viewBox: { width: 600, height: 440 },
    art: { silhouette, clipExtras: mirrors, layers },
    panels,
  };
}
