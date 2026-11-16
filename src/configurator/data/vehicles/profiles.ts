import type { SideProfile } from "./generate/side";
import type { FrontProfile } from "./generate/front";
import type { RearProfile } from "./generate/rear";
import type { TopProfile } from "./generate/top";

/**
 * Numeric profiles for the placeholder line-art. These are throwaway — once
 * real photography is traced, a vehicle's `ViewDefinition.image` + traced
 * `panels` replace the generated art entirely.
 */
export interface VehicleProfiles {
  side: SideProfile;
  front: FrontProfile;
  rear: RearProfile;
  top: TopProfile;
}

export const SEDAN: VehicleProfiles = {
  side: {
    body: "sedan", groundY: 400, frontX: 40, rearX: 960,
    wheelR: 44, archR: 54, frontWheelX: 215, rearWheelX: 785,
    rockerY: 352, bumperTopY: 298, rearBumperTopY: 300,
    hoodStartX: 96, hoodFrontY: 258, cowlX: 335, beltY: 242,
    roofFrontX: 445, roofY: 148, roofRearX: 690,
    rearGlassBottomX: 805, trunkY: 232,
    bPillarX: 560, cPillarX: 705, rearSideGlassBottomX: 745,
    taillightW: 48, taillightH: 40,
  },
  front: {
    body: "sedan", groundY: 410, bottomY: 392, bumperHalfW: 222, bodyHalfW: 240,
    bumperTopY: 300, lightTopY: 262, hoodTopY: 204, hoodHalfW: 206, roofY: 100, roofHalfW: 150,
    wheelX: 172, wheelW: 52, wheelTopY: 368, headlightW: 84, headlightInset: 22, mirrorY: 214, grilleHalfW: 70,
  },
  rear: {
    body: "sedan", groundY: 410, bottomY: 392, bumperHalfW: 224, bodyHalfW: 240, bumperTopY: 310,
    deckY: 236, shoulderY: 236, deckHalfW: 200, deckTopY: 208, roofY: 104, roofHalfW: 150,
    wheelX: 172, wheelW: 52, wheelTopY: 368, taillightW: 62, taillightH: 40, taillightInset: 22, mirrorY: 214,
  },
  top: {
    body: "sedan", frontX: 40, rearX: 960, halfW: 180, frontTaper: 40, rearTaper: 36, cornerR: 40,
    bumperDepth: 48, rearBumperDepth: 34, cowlX: 340, roofFrontX: 450, roofRearX: 690, roofHalfW: 130,
    rearGlassEndX: 800, sideGlassEndX: 760, doorFrontX: 368, bPillarX: 560, cPillarX: 705,
    frontWheelX: 215, rearWheelX: 785, headlightW: 66, headlightH: 44, taillightW: 56, taillightH: 40, mirrorX: 350,
  },
};

export const COUPE: VehicleProfiles = {
  side: {
    body: "coupe", groundY: 400, frontX: 40, rearX: 960,
    wheelR: 45, archR: 55, frontWheelX: 220, rearWheelX: 780,
    rockerY: 352, bumperTopY: 300, rearBumperTopY: 302,
    hoodStartX: 98, hoodFrontY: 256, cowlX: 355, beltY: 244,
    roofFrontX: 480, roofY: 160, roofRearX: 690,
    rearGlassBottomX: 820, trunkY: 236,
    bPillarX: 640, rearSideGlassBottomX: 706,
    taillightW: 50, taillightH: 38,
  },
  front: {
    body: "coupe", groundY: 410, bottomY: 392, bumperHalfW: 226, bodyHalfW: 244,
    bumperTopY: 304, lightTopY: 268, hoodTopY: 214, hoodHalfW: 208, roofY: 118, roofHalfW: 140,
    wheelX: 176, wheelW: 54, wheelTopY: 368, headlightW: 88, headlightInset: 20, mirrorY: 224, grilleHalfW: 74,
  },
  rear: {
    body: "coupe", groundY: 410, bottomY: 392, bumperHalfW: 228, bodyHalfW: 244, bumperTopY: 312,
    deckY: 240, shoulderY: 240, deckHalfW: 196, deckTopY: 216, roofY: 122, roofHalfW: 140,
    wheelX: 176, wheelW: 54, wheelTopY: 368, taillightW: 64, taillightH: 38, taillightInset: 20, mirrorY: 224,
  },
  top: {
    body: "coupe", frontX: 40, rearX: 960, halfW: 184, frontTaper: 44, rearTaper: 40, cornerR: 44,
    bumperDepth: 50, rearBumperDepth: 34, cowlX: 360, roofFrontX: 485, roofRearX: 680, roofHalfW: 128,
    rearGlassEndX: 815, sideGlassEndX: 720, doorFrontX: 388, bPillarX: 640,
    frontWheelX: 220, rearWheelX: 780, headlightW: 70, headlightH: 44, taillightW: 58, taillightH: 40, mirrorX: 372,
  },
};

export const SUV: VehicleProfiles = {
  side: {
    body: "suv", groundY: 400, frontX: 36, rearX: 964,
    wheelR: 48, archR: 60, frontWheelX: 210, rearWheelX: 790,
    rockerY: 340, bumperTopY: 296, rearBumperTopY: 300,
    hoodStartX: 92, hoodFrontY: 232, cowlX: 322, beltY: 216,
    roofFrontX: 425, roofY: 112, roofRearX: 905,
    rearGlassBottomX: 952, trunkY: 214,
    bPillarX: 520, cPillarX: 700, rearSideGlassBottomX: 885,
    taillightW: 34, taillightH: 60,
  },
  front: {
    body: "suv", groundY: 410, bottomY: 386, bumperHalfW: 232, bodyHalfW: 248,
    bumperTopY: 296, lightTopY: 236, hoodTopY: 186, hoodHalfW: 214, roofY: 70, roofHalfW: 172,
    wheelX: 178, wheelW: 56, wheelTopY: 356, headlightW: 80, headlightInset: 22, mirrorY: 190, grilleHalfW: 80,
  },
  rear: {
    body: "suv", groundY: 410, bottomY: 386, bumperHalfW: 236, bodyHalfW: 248, bumperTopY: 306,
    deckY: 214, shoulderY: 130, deckHalfW: 190, deckTopY: 96, roofY: 70, roofHalfW: 226,
    wheelX: 178, wheelW: 56, wheelTopY: 356, taillightW: 40, taillightH: 64, taillightInset: 12, mirrorY: 190,
  },
  top: {
    body: "suv", frontX: 36, rearX: 964, halfW: 190, frontTaper: 36, rearTaper: 30, cornerR: 36,
    bumperDepth: 46, rearBumperDepth: 30, cowlX: 328, roofFrontX: 430, roofRearX: 848, roofHalfW: 150,
    rearGlassEndX: 882, sideGlassEndX: 860, doorFrontX: 356, bPillarX: 520, cPillarX: 700,
    frontWheelX: 210, rearWheelX: 790, headlightW: 62, headlightH: 42, taillightW: 40, taillightH: 44, mirrorX: 338,
  },
};

export const TRUCK: VehicleProfiles = {
  side: {
    body: "truck", groundY: 400, frontX: 30, rearX: 972,
    wheelR: 50, archR: 62, frontWheelX: 215, rearWheelX: 775,
    rockerY: 322, bumperTopY: 290, rearBumperTopY: 296,
    hoodStartX: 66, hoodFrontY: 226, cowlX: 335, beltY: 208,
    roofFrontX: 418, roofY: 108, roofRearX: 612,
    cabRearX: 636, bedFrontX: 650, rearGlassBottomX: 636, trunkY: 216,
    bPillarX: 505, cPillarX: 622, rearSideGlassBottomX: 620,
    taillightW: 30, taillightH: 56,
  },
  front: {
    body: "truck", groundY: 410, bottomY: 372, bumperHalfW: 238, bodyHalfW: 252,
    bumperTopY: 296, lightTopY: 222, hoodTopY: 176, hoodHalfW: 222, roofY: 62, roofHalfW: 176,
    wheelX: 180, wheelW: 60, wheelTopY: 340, headlightW: 76, headlightInset: 20, mirrorY: 180, grilleHalfW: 96,
  },
  rear: {
    body: "truck", groundY: 410, bottomY: 372, bumperHalfW: 240, bodyHalfW: 252, bumperTopY: 302,
    deckY: 214, shoulderY: 214, deckHalfW: 0, deckTopY: 0, roofY: 62, roofHalfW: 176,
    cab: { halfW: 178, glassBottomY: 170 },
    wheelX: 180, wheelW: 60, wheelTopY: 340, taillightW: 44, taillightH: 66, taillightInset: 12, mirrorY: 180,
  },
  top: {
    body: "truck", frontX: 30, rearX: 972, halfW: 190, frontTaper: 30, rearTaper: 20, cornerR: 28,
    bumperDepth: 44, rearBumperDepth: 30, cowlX: 340, roofFrontX: 425, roofRearX: 600, roofHalfW: 150,
    rearGlassEndX: 628, sideGlassEndX: 618, doorFrontX: 368, bPillarX: 505, cPillarX: 622,
    frontWheelX: 215, rearWheelX: 775, headlightW: 56, headlightH: 40, taillightW: 34, taillightH: 46, mirrorX: 350,
    truck: { cabRearX: 636, bedFrontX: 650, tailgateDepth: 26 },
  },
};

export const VAN: VehicleProfiles = {
  side: {
    body: "van", groundY: 400, frontX: 40, rearX: 960,
    wheelR: 44, archR: 54, frontWheelX: 190, rearWheelX: 800,
    rockerY: 340, bumperTopY: 300, rearBumperTopY: 302,
    hoodStartX: 84, hoodFrontY: 236, cowlX: 250, beltY: 222,
    roofFrontX: 372, roofY: 98, roofRearX: 930,
    rearGlassBottomX: 958, trunkY: 200,
    bPillarX: 450, cPillarX: 700, rearSideGlassBottomX: 910,
    taillightW: 30, taillightH: 70,
  },
  front: {
    body: "van", groundY: 410, bottomY: 388, bumperHalfW: 234, bodyHalfW: 248,
    bumperTopY: 300, lightTopY: 242, hoodTopY: 200, hoodHalfW: 228, roofY: 44, roofHalfW: 200,
    wheelX: 176, wheelW: 54, wheelTopY: 360, headlightW: 70, headlightInset: 20, mirrorY: 204, grilleHalfW: 84,
  },
  rear: {
    body: "van", groundY: 410, bottomY: 388, bumperHalfW: 238, bodyHalfW: 248, bumperTopY: 308,
    deckY: 200, shoulderY: 100, deckHalfW: 196, deckTopY: 72, roofY: 44, roofHalfW: 232,
    wheelX: 176, wheelW: 54, wheelTopY: 360, taillightW: 36, taillightH: 80, taillightInset: 8, mirrorY: 204,
  },
  top: {
    body: "van", frontX: 40, rearX: 960, halfW: 194, frontTaper: 30, rearTaper: 20, cornerR: 30,
    bumperDepth: 40, rearBumperDepth: 28, cowlX: 256, roofFrontX: 376, roofRearX: 870, roofHalfW: 160,
    rearGlassEndX: 892, sideGlassEndX: 880, doorFrontX: 284, bPillarX: 450, cPillarX: 700,
    frontWheelX: 190, rearWheelX: 800, headlightW: 54, headlightH: 40, taillightW: 34, taillightH: 50, mirrorX: 268,
  },
};

export const CONVERTIBLE: VehicleProfiles = {
  side: {
    body: "convertible", groundY: 400, frontX: 40, rearX: 960,
    wheelR: 45, archR: 55, frontWheelX: 220, rearWheelX: 780,
    rockerY: 352, bumperTopY: 300, rearBumperTopY: 302,
    hoodStartX: 98, hoodFrontY: 256, cowlX: 355, beltY: 244,
    roofFrontX: 455, roofY: 176, roofRearX: 455,
    rearGlassBottomX: 760, trunkY: 238,
    bPillarX: 620, rearSideGlassBottomX: 620,
    taillightW: 50, taillightH: 38,
  },
  front: {
    body: "convertible", groundY: 410, bottomY: 392, bumperHalfW: 226, bodyHalfW: 244,
    bumperTopY: 304, lightTopY: 268, hoodTopY: 214, hoodHalfW: 208, roofY: 150, roofHalfW: 156,
    wheelX: 176, wheelW: 54, wheelTopY: 368, headlightW: 88, headlightInset: 20, mirrorY: 224, grilleHalfW: 74,
  },
  rear: {
    body: "convertible", groundY: 410, bottomY: 392, bumperHalfW: 228, bodyHalfW: 244, bumperTopY: 312,
    deckY: 242, shoulderY: 242, deckHalfW: 200, deckTopY: 222, roofY: 152, roofHalfW: 156,
    wheelX: 176, wheelW: 54, wheelTopY: 368, taillightW: 64, taillightH: 38, taillightInset: 20, mirrorY: 224,
  },
  top: {
    body: "convertible", frontX: 40, rearX: 960, halfW: 184, frontTaper: 44, rearTaper: 40, cornerR: 44,
    bumperDepth: 50, rearBumperDepth: 34, cowlX: 360, roofFrontX: 462, roofRearX: 462, roofHalfW: 128,
    rearGlassEndX: 765, sideGlassEndX: 700, doorFrontX: 388, bPillarX: 620,
    frontWheelX: 220, rearWheelX: 780, headlightW: 70, headlightH: 44, taillightW: 58, taillightH: 40, mirrorX: 372,
  },
};
