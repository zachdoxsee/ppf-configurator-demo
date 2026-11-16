import type { PanelShape, ViewDefinition } from "../../../types";
import type { BodyStyle } from "./side";
import { INK, ellipse, join, mirrorY, poly, rect, roundedPoly, rrect, symmetricY, type Pt } from "./geometry";

/** Plan view in a 1000×480 box, nose on the left, centred on y = 240. */
export interface TopProfile {
  body: BodyStyle;
  frontX: number;
  rearX: number;
  halfW: number;
  /** How far the nose / tail corners are pulled in. */
  frontTaper: number;
  rearTaper: number;
  cornerR: number;
  bumperDepth: number;
  rearBumperDepth: number;
  cowlX: number;
  roofFrontX: number;
  roofRearX: number;
  roofHalfW: number;
  /** Where the rear glass meets the trunk / tail. */
  rearGlassEndX: number;
  /** Rearmost point of the side glass along the shoulder. */
  sideGlassEndX: number;
  doorFrontX: number;
  bPillarX: number;
  cPillarX?: number;
  frontWheelX: number;
  rearWheelX: number;
  headlightW: number;
  headlightH: number;
  taillightW: number;
  taillightH: number;
  mirrorX: number;
  truck?: { cabRearX: number; bedFrontX: number; tailgateDepth: number };
}

const CY = 240;
const DOOR_STRIP = 26;
const FENDER_STRIP = 28;
const LEDGE_DEPTH = 16;
const PILLAR_W = 14;
const MIRROR_W = 30;
const MIRROR_H = 26;
const LENS = { fill: "#ecb7bb", stroke: "#c9878d" };

export function generateTopView(p: TopProfile): ViewDefinition {
  const cy = CY;
  const hasRoof = p.body !== "convertible";
  const isTruck = p.body === "truck" && !!p.truck;
  const isBoxy = p.body === "suv" || p.body === "van";
  const hoodHalfW = p.halfW - FENDER_STRIP;
  const bumperX = p.rearX - p.rearBumperDepth;
  const ledgeX = bumperX - LEDGE_DEPTH;
  const tlX = bumperX - p.taillightW;
  const hlX = p.frontX + p.bumperDepth - 4;
  const hlEnd = hlX + p.headlightW;
  const quarterFrontX = isTruck ? p.truck!.bedFrontX : (p.cPillarX ?? p.bPillarX);

  // ---- Silhouette ---------------------------------------------------------
  const topHalf: Pt[] = [
    [p.frontX, cy - p.halfW + p.frontTaper],
    [p.frontX + 40, cy - p.halfW],
    [p.rearX - 40, cy - p.halfW],
    [p.rearX, cy - p.halfW + p.rearTaper],
  ];
  const silhouette = roundedPoly(symmetricY(topHalf, cy), p.cornerR);
  const mirrors = [
    rrect(p.mirrorX, cy - p.halfW - MIRROR_H + 8, MIRROR_W, MIRROR_H, 7),
    rrect(p.mirrorX, cy + p.halfW - 8, MIRROR_W, MIRROR_H, 7),
  ];

  // ---- Panels --------------------------------------------------------------
  const panels: PanelShape[] = [];
  const add = (panelId: PanelShape["panelId"], d: string) => panels.push({ panelId, d });
  const both = (topPts: Pt[]) => join(poly(topPts), poly(mirrorY(topPts, cy)));
  const strip = (x1: number, x2: number, inset: number) =>
    both([
      [x1, cy - p.halfW - 6],
      [x2, cy - p.halfW - 6],
      [x2, cy - p.halfW + inset],
      [x1, cy - p.halfW + inset],
    ]);

  add("front-bumper", rect(p.frontX - 6, cy - p.halfW - 6, p.bumperDepth + 6, p.halfW * 2 + 12));
  const ov = Math.max(p.headlightH - FENDER_STRIP, 0); // how far the lights bite into the hood
  const hoodShape = (endX: number) =>
    poly([
      [p.frontX + p.bumperDepth, cy - hoodHalfW + ov],
      [hlEnd, cy - hoodHalfW + ov],
      [hlEnd, cy - hoodHalfW],
      [endX, cy - hoodHalfW],
      [endX, cy + hoodHalfW],
      [hlEnd, cy + hoodHalfW],
      [hlEnd, cy + hoodHalfW - ov],
      [p.frontX + p.bumperDepth, cy + hoodHalfW - ov],
    ]);
  add("hood-full", hoodShape(p.cowlX));
  add("hood-partial", hoodShape(p.frontX + p.bumperDepth + (p.cowlX - p.frontX - p.bumperDepth) * 0.42));
  add("front-fenders-full", strip(hlEnd, p.doorFrontX, FENDER_STRIP));
  add("front-fenders-partial", strip(hlEnd, p.frontWheelX + 12, FENDER_STRIP));
  add("front-doors", strip(p.doorFrontX, p.bPillarX, DOOR_STRIP));
  if (p.cPillarX) add("rear-doors", strip(p.bPillarX, p.cPillarX, DOOR_STRIP));
  add("rear-quarters-full", strip(quarterFrontX, tlX, DOOR_STRIP));
  const archStart = Math.max(quarterFrontX, p.rearWheelX - 70);
  add("rear-quarters-partial", strip(archStart, Math.min(p.rearWheelX + 26, tlX), DOOR_STRIP));

  // Rear closure
  const trunkHalfW = p.halfW - DOOR_STRIP;
  if (isTruck) {
    const t = p.truck!;
    const tailgateX = ledgeX - t.tailgateDepth;
    add("trunk", rect(tailgateX, cy - trunkHalfW, t.tailgateDepth, trunkHalfW * 2));
  } else {
    add(
      "trunk",
      poly([
        [p.rearGlassEndX, cy - trunkHalfW],
        [tlX, cy - trunkHalfW],
        [tlX, cy - p.halfW + p.taillightH],
        [ledgeX, cy - p.halfW + p.taillightH],
        [ledgeX, cy + p.halfW - p.taillightH],
        [tlX, cy + p.halfW - p.taillightH],
        [tlX, cy + trunkHalfW],
        [p.rearGlassEndX, cy + trunkHalfW],
      ]),
    );
  }
  add("trunk-ledge", rect(ledgeX, cy - p.halfW + p.taillightH, LEDGE_DEPTH, (p.halfW - p.taillightH) * 2));
  add("rear-bumper", rect(bumperX, cy - p.halfW - 6, p.rearBumperDepth + 6, p.halfW * 2 + 12));

  if (hasRoof) {
    add("roof", rect(p.roofFrontX + PILLAR_W, cy - p.roofHalfW, p.roofRearX - p.roofFrontX - PILLAR_W, p.roofHalfW * 2));
  }
  add(
    "a-pillars",
    join(
      both([
        [p.cowlX, cy - hoodHalfW + 4],
        [p.roofFrontX, cy - p.roofHalfW],
        [p.roofFrontX + PILLAR_W, cy - p.roofHalfW],
        [p.roofFrontX + PILLAR_W, cy - p.roofHalfW + PILLAR_W],
        [p.cowlX, cy - hoodHalfW + 4 + PILLAR_W],
      ]),
      rect(p.roofFrontX, cy - p.roofHalfW, PILLAR_W, p.roofHalfW * 2),
    ),
  );
  add(
    "headlights",
    both([
      [hlX, cy - p.halfW - 6],
      [hlEnd, cy - p.halfW - 6],
      [hlEnd, cy - p.halfW + p.headlightH],
      [hlX, cy - p.halfW + p.headlightH],
    ]),
  );
  add(
    "taillights",
    both([
      [tlX, cy - p.halfW - 6],
      [bumperX, cy - p.halfW - 6],
      [bumperX, cy - p.halfW + p.taillightH],
      [tlX, cy - p.halfW + p.taillightH],
    ]),
  );
  add("mirrors", join(...mirrors));

  // ---- Layers --------------------------------------------------------------
  const layers: { d: string; fill?: string; stroke?: string; strokeWidth?: number }[] = [
    { d: ellipse((p.frontX + p.rearX) / 2, cy + 8, (p.rearX - p.frontX) / 2 + 4, p.halfW + 10), fill: INK.shadow },
    { d: silhouette, fill: INK.body, stroke: INK.bodyStroke, strokeWidth: 1.5 },
  ];
  // Windshield
  layers.push({
    d: poly([
      [p.cowlX + 4, cy - hoodHalfW + PILLAR_W + 6],
      [p.roofFrontX + PILLAR_W + 2, cy - p.roofHalfW + PILLAR_W + 2],
      [p.roofFrontX + PILLAR_W + 2, cy + p.roofHalfW - PILLAR_W - 2],
      [p.cowlX + 4, cy + hoodHalfW - PILLAR_W - 6],
    ]),
    fill: INK.glass,
    stroke: INK.glassStroke,
    strokeWidth: 1,
  });
  if (hasRoof) {
    // Side glass bands between roof and shoulders
    const sideGlass = (sign: 1 | -1) =>
      poly([
        [p.roofFrontX + 6, cy - sign * p.roofHalfW],
        [p.roofRearX - 4, cy - sign * p.roofHalfW],
        [p.sideGlassEndX, cy - sign * (p.halfW - DOOR_STRIP)],
        [p.doorFrontX + 8, cy - sign * (p.halfW - DOOR_STRIP)],
      ]);
    layers.push({ d: sideGlass(1), fill: INK.glass, stroke: INK.glassStroke, strokeWidth: 1 });
    layers.push({ d: sideGlass(-1), fill: INK.glass, stroke: INK.glassStroke, strokeWidth: 1 });
    // Rear glass
    const rearHalf = isTruck ? p.roofHalfW + 10 : isBoxy ? p.halfW - DOOR_STRIP - 6 : hoodHalfW - 6;
    layers.push({
      d: poly([
        [p.roofRearX, cy - p.roofHalfW],
        [p.roofRearX, cy + p.roofHalfW],
        [p.rearGlassEndX, cy + rearHalf],
        [p.rearGlassEndX, cy - rearHalf],
      ]),
      fill: INK.glass,
      stroke: INK.glassStroke,
      strokeWidth: 1,
    });
  } else {
    // Open cabin with four seats
    const cabinW = p.rearGlassEndX - p.roofFrontX - PILLAR_W - 8;
    layers.push({ d: rrect(p.roofFrontX + PILLAR_W + 4, cy - p.roofHalfW, cabinW, p.roofHalfW * 2, 14), fill: INK.interior });
    const seatW = 44;
    for (const sx of [p.roofFrontX + PILLAR_W + 30, p.roofFrontX + PILLAR_W + 30 + seatW + 40]) {
      layers.push({ d: rrect(sx, cy - p.roofHalfW + 14, seatW, 44, 8), fill: "#5a626d" });
      layers.push({ d: rrect(sx, cy + p.roofHalfW - 58, seatW, 44, 8), fill: "#5a626d" });
    }
  }
  if (isTruck) {
    const t = p.truck!;
    const tailgateX = ledgeX - t.tailgateDepth;
    layers.push({ d: rect(t.cabRearX, cy - p.halfW - 2, t.bedFrontX - t.cabRearX, p.halfW * 2 + 4), fill: INK.detail });
    layers.push({
      d: rrect(t.bedFrontX + 6, cy - p.halfW + DOOR_STRIP, tailgateX - t.bedFrontX - 8, (p.halfW - DOOR_STRIP) * 2, 6),
      fill: INK.interior,
    });
  }
  // Lenses
  layers.push(
    { d: rrect(hlX + 4, cy - p.halfW + 5, p.headlightW - 8, p.headlightH - 10, 5), fill: "#dfe6ee", stroke: INK.glassStroke, strokeWidth: 1 },
    { d: rrect(hlX + 4, cy + p.halfW - p.headlightH + 5, p.headlightW - 8, p.headlightH - 10, 5), fill: "#dfe6ee", stroke: INK.glassStroke, strokeWidth: 1 },
    { d: rrect(tlX + 4, cy - p.halfW + 5, p.taillightW - 8, p.taillightH - 10, 5), ...LENS, strokeWidth: 1 },
    { d: rrect(tlX + 4, cy + p.halfW - p.taillightH + 5, p.taillightW - 8, p.taillightH - 10, 5), ...LENS, strokeWidth: 1 },
    ...mirrors.map((d) => ({ d, fill: INK.body, stroke: INK.bodyStroke, strokeWidth: 1.5 })),
  );

  return {
    id: "top",
    label: "Top",
    viewBox: { width: 1000, height: 480 },
    art: { silhouette, clipExtras: mirrors, layers },
    panels,
  };
}
