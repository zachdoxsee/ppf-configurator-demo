import type { PanelShape, ViewDefinition } from "../../../types";
import {
  INK,
  circle,
  ellipse,
  join,
  poly,
  rect,
  rrect,
  xAt,
  yAt,
  type Pt,
} from "./geometry";

export type BodyStyle = "sedan" | "coupe" | "suv" | "truck" | "van" | "convertible";

/**
 * Side profile, drawn facing left (nose on the left) in a 1000×440 box.
 * Every number is a viewBox coordinate.
 */
export interface SideProfile {
  body: BodyStyle;
  groundY: number;
  frontX: number;
  rearX: number;
  wheelR: number;
  archR: number;
  frontWheelX: number;
  rearWheelX: number;
  /** Bottom of the painted body (rocker). Keep at or above the wheel centre. */
  rockerY: number;
  bumperTopY: number;
  rearBumperTopY: number;
  /** Where the hood begins behind the headlight. */
  hoodStartX: number;
  hoodFrontY: number;
  /** Base of the windshield. */
  cowlX: number;
  /** Bottom of the side glass. */
  beltY: number;
  roofFrontX: number;
  roofY: number;
  roofRearX: number;
  /** Where the rear glass / deck meets the trunk or rear face. */
  rearGlassBottomX: number;
  trunkY: number;
  bPillarX: number;
  cPillarX?: number;
  /** Rearmost point of the rear side glass along the beltline. */
  rearSideGlassBottomX: number;
  /** Trucks only — back wall of the cab and start of the bed. */
  cabRearX?: number;
  bedFrontX?: number;
  taillightW: number;
  taillightH: number;
}

const HOOD_BAND = 22;
const ROOF_BAND = 12;
const ROCKER_BAND = 20;
const TRUNK_BAND = 12;
const PILLAR_W = 16;
const DOOR_GAP = 28;
const REAR_SLIVER = 14;

export function generateSideView(p: SideProfile): ViewDefinition {
  const cowlY = p.beltY - HOOD_BAND;
  const wheelCY = p.groundY - p.wheelR;
  const doorFrontX = p.cowlX + DOOR_GAP;
  const bumperBackX = p.frontWheelX - p.archR - 8;
  const rockerStartX = p.frontWheelX + p.archR + 6;
  const rockerEndX = p.rearWheelX - p.archR - 6;
  const rearBumperFrontX = p.rearWheelX + p.archR + 8;
  const quarterFrontX = p.cPillarX ?? p.bPillarX;
  const hasRoof = p.body !== "convertible";
  const isTruck = p.body === "truck";
  const isBoxy = p.body === "suv" || p.body === "van";
  const glassTopY = p.roofY + ROOF_BAND + 2;

  const hoodY = (x: number) => yAt(x, p.hoodStartX, p.hoodFrontY, p.cowlX, cowlY);
  const windshieldX = (y: number) => xAt(y, p.cowlX, cowlY, p.roofFrontX, p.roofY);

  // ---- Wheel arch geometry (arc cut into the body's bottom edge) ---------
  const archDy = wheelCY - p.rockerY;
  const halfChord = Math.sqrt(Math.max(p.archR * p.archR - archDy * archDy, 1));
  const arch = (wx: number) =>
    `L${wx + halfChord},${p.rockerY}A${p.archR},${p.archR} 0 0 0 ${wx - halfChord},${p.rockerY}`;

  // ---- Silhouette ---------------------------------------------------------
  const top: string[] = [];
  top.push(`M${p.frontX},${p.rockerY - 10}`);
  top.push(`Q${p.frontX},${p.bumperTopY} ${p.frontX + 6},${p.bumperTopY - 4}`);
  top.push(`L${p.hoodStartX},${p.hoodFrontY}`);
  top.push(`L${p.cowlX},${cowlY}`);
  if (hasRoof) {
    top.push(`L${p.roofFrontX - 22},${p.roofY + 14}`);
    top.push(`Q${p.roofFrontX},${p.roofY} ${p.roofFrontX + 26},${p.roofY}`);
    top.push(`L${p.roofRearX - 26},${p.roofY}`);
    if (isTruck) {
      top.push(`Q${p.roofRearX},${p.roofY} ${p.roofRearX + 4},${p.roofY + 14}`);
      top.push(`L${p.cabRearX},${p.beltY - 6}`);
      top.push(`L${p.cabRearX},${p.trunkY}`);
      top.push(`L${p.rearX - 8},${p.trunkY}`);
      top.push(`Q${p.rearX},${p.trunkY} ${p.rearX},${p.trunkY + 8}`);
    } else if (isBoxy) {
      top.push(`Q${p.roofRearX},${p.roofY} ${p.roofRearX + 12},${p.roofY + 14}`);
      top.push(`L${p.rearGlassBottomX},${p.trunkY}`);
      top.push(`L${p.rearX},${p.trunkY + 24}`);
    } else {
      top.push(`Q${p.roofRearX},${p.roofY} ${p.roofRearX + 18},${p.roofY + 12}`);
      top.push(`L${p.rearGlassBottomX},${p.trunkY}`);
      top.push(`L${p.rearX - 8},${p.trunkY + 2}`);
      top.push(`Q${p.rearX},${p.trunkY + 2} ${p.rearX},${p.trunkY + 12}`);
    }
  } else {
    // Convertible, top down: windshield header then a flat deck.
    top.push(`L${p.roofFrontX - 4},${p.roofY + 4}`);
    top.push(`Q${p.roofFrontX + 4},${p.roofY - 2} ${p.roofFrontX + 12},${p.roofY + 4}`);
    top.push(`L${p.roofFrontX + 30},${p.beltY - 4}`);
    top.push(`L${p.rearGlassBottomX},${p.trunkY}`);
    top.push(`L${p.rearX - 8},${p.trunkY + 2}`);
    top.push(`Q${p.rearX},${p.trunkY + 2} ${p.rearX},${p.trunkY + 12}`);
  }
  top.push(`L${p.rearX},${p.rockerY - 10}`);
  top.push(`Q${p.rearX},${p.rockerY} ${p.rearX - 10},${p.rockerY}`);
  top.push(arch(p.rearWheelX));
  top.push(arch(p.frontWheelX));
  top.push(`L${p.frontX + 10},${p.rockerY}`);
  top.push(`Q${p.frontX},${p.rockerY} ${p.frontX},${p.rockerY - 10}`);
  top.push("Z");
  const silhouette = top.join("");

  // ---- Glass ---------------------------------------------------------------
  const glass: string[] = [];
  if (hasRoof) {
    const frontGlassBottomX = Math.max(windshieldX(p.beltY - 2), p.cowlX) + PILLAR_W + 6;
    const frontGlassTopX = windshieldX(glassTopY) + PILLAR_W + 6;
    glass.push(
      poly([
        [frontGlassBottomX, p.beltY - 2],
        [frontGlassTopX, glassTopY],
        [p.bPillarX - 7, glassTopY],
        [p.bPillarX - 7, p.beltY - 2],
      ]),
    );
    if (isTruck) {
      glass.push(
        poly([
          [p.bPillarX + 7, p.beltY - 2],
          [p.bPillarX + 7, glassTopY],
          [p.roofRearX - 6, glassTopY],
          [(p.cPillarX ?? p.roofRearX) - 4, p.beltY - 2],
        ]),
      );
    } else if (isBoxy && p.cPillarX) {
      glass.push(
        poly([
          [p.bPillarX + 7, p.beltY - 2],
          [p.bPillarX + 7, glassTopY],
          [p.cPillarX - 7, glassTopY],
          [p.cPillarX - 7, p.beltY - 2],
        ]),
      );
      glass.push(
        poly([
          [p.cPillarX + 7, p.beltY - 2],
          [p.cPillarX + 7, glassTopY],
          [p.roofRearX - 14, glassTopY],
          [p.rearSideGlassBottomX, p.beltY - 2],
        ]),
      );
    } else if (p.cPillarX) {
      glass.push(
        poly([
          [p.bPillarX + 7, p.beltY - 2],
          [p.bPillarX + 7, glassTopY],
          [p.roofRearX - 14, glassTopY],
          [p.rearSideGlassBottomX, p.beltY - 2],
        ]),
      );
    } else {
      // Coupe quarter glass.
      glass.push(
        poly([
          [p.bPillarX + 7, p.beltY - 2],
          [p.bPillarX + 7, glassTopY],
          [p.roofRearX - 14, glassTopY],
          [p.rearSideGlassBottomX, p.beltY - 2],
        ]),
      );
    }
  }

  // ---- Wheels -------------------------------------------------------------
  const wheelLayers = [p.frontWheelX, p.rearWheelX].flatMap((wx) => [
    { d: circle(wx, wheelCY, p.wheelR), fill: INK.dark },
    { d: circle(wx, wheelCY, p.wheelR * 0.64), fill: INK.rim, stroke: INK.hub, strokeWidth: 1.5 },
    { d: circle(wx, wheelCY, p.wheelR * 0.2), fill: INK.hub },
  ]);

  // ---- Panels --------------------------------------------------------------
  const panels: PanelShape[] = [];
  const add = (panelId: PanelShape["panelId"], d: string) => panels.push({ panelId, d });

  const hoodPartialX = p.hoodStartX + (p.cowlX - p.hoodStartX) * 0.42;
  const fenderPartialX = p.frontWheelX + 4;

  // Big surfaces first so the small touch-points render (and click) on top.
  add(
    "front-bumper",
    rect(p.frontX - 6, p.bumperTopY, bumperBackX - p.frontX + 6, p.rockerY - p.bumperTopY + 6),
  );
  add(
    "hood-full",
    poly([
      [p.hoodStartX - 2, p.hoodFrontY - 12],
      [p.cowlX, cowlY - 12],
      [p.cowlX, cowlY + HOOD_BAND],
      [p.hoodStartX - 2, p.hoodFrontY + HOOD_BAND],
    ]),
  );
  add(
    "hood-partial",
    poly([
      [p.hoodStartX - 2, p.hoodFrontY - 12],
      [hoodPartialX, hoodY(hoodPartialX) - 12],
      [hoodPartialX, hoodY(hoodPartialX) + HOOD_BAND],
      [p.hoodStartX - 2, p.hoodFrontY + HOOD_BAND],
    ]),
  );
  add(
    "front-fenders-full",
    poly([
      [p.hoodStartX - 2, p.hoodFrontY + HOOD_BAND],
      [p.cowlX, p.beltY],
      [doorFrontX, p.beltY],
      [doorFrontX, p.rockerY - ROCKER_BAND],
      [rockerStartX, p.rockerY - ROCKER_BAND],
      [rockerStartX, p.rockerY + 6],
      [bumperBackX, p.rockerY + 6],
      [bumperBackX, p.bumperTopY],
      [p.hoodStartX - 2, p.bumperTopY],
    ]),
  );
  add(
    "front-fenders-partial",
    poly([
      [p.hoodStartX - 2, p.hoodFrontY + HOOD_BAND],
      [fenderPartialX, hoodY(fenderPartialX) + HOOD_BAND],
      [fenderPartialX, p.rockerY + 6],
      [bumperBackX, p.rockerY + 6],
      [bumperBackX, p.bumperTopY],
      [p.hoodStartX - 2, p.bumperTopY],
    ]),
  );
  add(
    "front-doors",
    rect(doorFrontX, p.beltY, p.bPillarX - doorFrontX, p.rockerY - ROCKER_BAND - p.beltY),
  );
  if (p.cPillarX) {
    add(
      "rear-doors",
      rect(p.bPillarX, p.beltY, p.cPillarX - p.bPillarX, p.rockerY - ROCKER_BAND - p.beltY),
    );
  }
  add(
    "rocker-panels",
    rect(rockerStartX, p.rockerY - ROCKER_BAND, rockerEndX - rockerStartX, ROCKER_BAND + 6),
  );

  // Rear quarter / bedside.
  const quarterStartX = isTruck ? (p.bedFrontX ?? quarterFrontX) : quarterFrontX;
  const rearSliverX = p.rearX - REAR_SLIVER;
  let quarterTop: Pt[];
  if (isTruck) {
    quarterTop = [
      [quarterStartX, p.trunkY - 12],
      [rearSliverX, p.trunkY - 12],
      [rearSliverX, p.rearBumperTopY],
    ];
  } else if (isBoxy) {
    quarterTop = [
      [quarterStartX, p.beltY],
      [rearSliverX, p.beltY],
      [rearSliverX, p.rearBumperTopY],
    ];
  } else {
    quarterTop = [
      [quarterStartX, p.beltY],
      [p.rearGlassBottomX, p.beltY],
      [p.rearGlassBottomX, p.trunkY + TRUNK_BAND],
      [p.rearX - p.taillightW, p.trunkY + TRUNK_BAND],
      [p.rearX - p.taillightW, p.trunkY + p.taillightH + 4],
      [p.rearX + 6, p.trunkY + p.taillightH + 4],
      [p.rearX + 6, p.rearBumperTopY],
    ];
  }
  add(
    "rear-quarters-full",
    poly([
      ...quarterTop,
      [rearBumperFrontX, p.rearBumperTopY],
      [rearBumperFrontX, p.rockerY + 6],
      [rockerEndX, p.rockerY + 6],
      [rockerEndX, p.rockerY - ROCKER_BAND],
      [quarterStartX, p.rockerY - ROCKER_BAND],
    ]),
  );
  const archStartX = Math.max(quarterStartX, p.rearWheelX - p.archR - 44);
  add(
    "rear-quarters-partial",
    poly([
      [archStartX, p.beltY + 16],
      [p.rearWheelX + 12, p.beltY + 16],
      [p.rearWheelX + 12, p.rockerY + 6],
      [rockerEndX, p.rockerY + 6],
      [rockerEndX, p.rockerY - ROCKER_BAND],
      [archStartX, p.rockerY - ROCKER_BAND],
    ]),
  );
  add(
    "rear-bumper",
    rect(rearBumperFrontX, p.rearBumperTopY, p.rearX - rearBumperFrontX + 6, p.rockerY - p.rearBumperTopY + 6),
  );

  // Rear closure: trunk band (sedan-likes) or a sliver at the tail (boxy/truck).
  if (isTruck || isBoxy) {
    add("trunk", rect(rearSliverX, p.trunkY - 12, REAR_SLIVER + 6, p.rearBumperTopY - p.trunkY + 12));
  } else {
    add(
      "trunk",
      rect(p.rearGlassBottomX, p.trunkY - 12, p.rearX - p.taillightW - p.rearGlassBottomX, TRUNK_BAND + 12),
    );
  }

  if (hasRoof) {
    add("roof", rect(p.roofFrontX + PILLAR_W + 6, p.roofY - 12, p.roofRearX - p.roofFrontX - PILLAR_W - 10, ROOF_BAND + 12));
  }
  add(
    "a-pillars",
    poly([
      [p.cowlX - 10, cowlY + 2],
      [p.roofFrontX - 6, p.roofY - 14],
      [p.roofFrontX + PILLAR_W + 6, p.roofY - 14],
      [p.roofFrontX + PILLAR_W + 6, p.roofY + ROOF_BAND],
      [p.cowlX + PILLAR_W, cowlY + 4],
    ]),
  );

  // Small touch points last.
  add("headlights", poly([
    [p.frontX - 6, p.hoodFrontY - 4],
    [p.hoodStartX, p.hoodFrontY - 4],
    [p.hoodStartX, p.bumperTopY],
    [p.frontX - 6, p.bumperTopY],
  ]));
  if (isTruck) {
    add("taillights", rect(rearSliverX - p.taillightW, p.trunkY + 6, p.taillightW, p.taillightH));
  } else if (isBoxy) {
    add("taillights", rect(rearSliverX - p.taillightW, p.beltY + 6, p.taillightW, p.taillightH));
  } else {
    add("taillights", poly([
      [p.rearX - p.taillightW, p.trunkY + 2],
      [p.rearX + 6, p.trunkY + 2],
      [p.rearX + 6, p.trunkY + p.taillightH + 4],
      [p.rearX - p.taillightW, p.trunkY + p.taillightH + 4],
    ]));
  }
  const doorRears = p.cPillarX ? [p.bPillarX, p.cPillarX] : [p.bPillarX];
  add("door-edges", join(...doorRears.map((x) => rect(x - 6, p.beltY, 6, p.rockerY - ROCKER_BAND - p.beltY))));
  add("door-cups", join(...doorRears.map((x) => rrect(x - 48, p.beltY + 24, 30, 12, 5))));
  add("mirrors", rrect(doorFrontX - 8, p.beltY - 28, 32, 20, 6));

  // ---- Assemble ------------------------------------------------------------
  const layers = [
    { d: ellipse((p.frontX + p.rearX) / 2, p.groundY + 4, (p.rearX - p.frontX) / 2 + 10, 11), fill: INK.shadow },
    ...wheelLayers,
    { d: silhouette, fill: INK.body, stroke: INK.bodyStroke, strokeWidth: 1.5 },
    ...glass.map((d) => ({ d, fill: INK.glass, stroke: INK.glassStroke, strokeWidth: 1 })),
  ];
  if (!hasRoof) {
    // Cabin opening with two headrests.
    layers.push({ d: rrect(p.roofFrontX + 34, p.beltY - 6, p.rearGlassBottomX - p.roofFrontX - 44, 8, 4), fill: INK.interior });
    layers.push({ d: rrect(p.bPillarX - 30, p.beltY - 26, 34, 22, 8), fill: INK.interior });
  }
  if (isTruck && p.cabRearX && p.bedFrontX) {
    // Cab-to-bed gap.
    layers.push({ d: rect(p.cabRearX, p.trunkY, p.bedFrontX - p.cabRearX, p.rockerY - p.trunkY - 2), fill: INK.detail });
  }

  return {
    id: "side",
    label: "Side",
    viewBox: { width: 1000, height: 440 },
    art: { silhouette, layers },
    panels,
  };
}
