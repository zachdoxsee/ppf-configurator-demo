/** Tiny SVG path helpers shared by the placeholder vehicle generators. */

export type Pt = [number, number];

const r = (n: number) => Math.round(n * 10) / 10;

export const poly = (pts: Pt[]): string =>
  `M${pts.map(([x, y]) => `${r(x)},${r(y)}`).join("L")}Z`;

export const rect = (x: number, y: number, w: number, h: number): string =>
  poly([
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ]);

export const rrect = (x: number, y: number, w: number, h: number, rad: number): string => {
  const k = Math.min(rad, w / 2, h / 2);
  return [
    `M${r(x + k)},${r(y)}`,
    `H${r(x + w - k)}`,
    `Q${r(x + w)},${r(y)} ${r(x + w)},${r(y + k)}`,
    `V${r(y + h - k)}`,
    `Q${r(x + w)},${r(y + h)} ${r(x + w - k)},${r(y + h)}`,
    `H${r(x + k)}`,
    `Q${r(x)},${r(y + h)} ${r(x)},${r(y + h - k)}`,
    `V${r(y + k)}`,
    `Q${r(x)},${r(y)} ${r(x + k)},${r(y)}`,
    "Z",
  ].join("");
};

export const circle = (cx: number, cy: number, rad: number): string =>
  `M${r(cx - rad)},${r(cy)}a${r(rad)},${r(rad)} 0 1,0 ${r(rad * 2)},0a${r(rad)},${r(rad)} 0 1,0 ${r(-rad * 2)},0Z`;

export const ellipse = (cx: number, cy: number, rx: number, ry: number): string =>
  `M${r(cx - rx)},${r(cy)}a${r(rx)},${r(ry)} 0 1,0 ${r(rx * 2)},0a${r(rx)},${r(ry)} 0 1,0 ${r(-rx * 2)},0Z`;

/** Mirror a point list across a vertical axis at `cx`. */
export const mirrorX = (pts: Pt[], cx: number): Pt[] => pts.map(([x, y]) => [2 * cx - x, y]);

/** Mirror a point list across a horizontal axis at `cy`. */
export const mirrorY = (pts: Pt[], cy: number): Pt[] => pts.map(([x, y]) => [x, 2 * cy - y]);

/** Reflect a left-half outline across `cx` to make a closed symmetric outline. */
export const symmetricX = (leftHalf: Pt[], cx: number): Pt[] => [
  ...leftHalf,
  ...mirrorX([...leftHalf].reverse(), cx),
];

/** Reflect a top-half outline across `cy` to make a closed symmetric outline. */
export const symmetricY = (topHalf: Pt[], cy: number): Pt[] => [
  ...topHalf,
  ...mirrorY([...topHalf].reverse(), cy),
];

/**
 * Closed polygon whose corners are rounded with quadratic curves. `radius` can
 * be a single number or a per-vertex list (use 0 for a sharp corner).
 */
export const roundedPoly = (pts: Pt[], radius: number | number[]): string => {
  const n = pts.length;
  const radii = Array.isArray(radius) ? radius : pts.map(() => radius);
  const segs: string[] = [];
  for (let i = 0; i < n; i++) {
    const p = pts[(i - 1 + n) % n];
    const v = pts[i];
    const q = pts[(i + 1) % n];
    const lenIn = Math.hypot(v[0] - p[0], v[1] - p[1]);
    const lenOut = Math.hypot(q[0] - v[0], q[1] - v[1]);
    const rad = Math.min(radii[i] ?? 0, lenIn / 2, lenOut / 2);
    if (rad <= 0.01) {
      segs.push(`${i === 0 ? "M" : "L"}${r(v[0])},${r(v[1])}`);
      continue;
    }
    const a: Pt = [v[0] + ((p[0] - v[0]) / lenIn) * rad, v[1] + ((p[1] - v[1]) / lenIn) * rad];
    const b: Pt = [v[0] + ((q[0] - v[0]) / lenOut) * rad, v[1] + ((q[1] - v[1]) / lenOut) * rad];
    segs.push(`${i === 0 ? "M" : "L"}${r(a[0])},${r(a[1])}`);
    segs.push(`Q${r(v[0])},${r(v[1])} ${r(b[0])},${r(b[1])}`);
  }
  return segs.join("") + "Z";
};

/** x on the line through (x1,y1)-(x2,y2) at height y. */
export const xAt = (y: number, x1: number, y1: number, x2: number, y2: number): number =>
  y1 === y2 ? x1 : x1 + ((y - y1) * (x2 - x1)) / (y2 - y1);

/** y on the line through (x1,y1)-(x2,y2) at position x. */
export const yAt = (x: number, x1: number, y1: number, x2: number, y2: number): number =>
  x1 === x2 ? y1 : y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);

export const join = (...paths: string[]): string => paths.join(" ");

/** Shared placeholder palette — keeps every generated view consistent. */
export const INK = {
  body: "#e9ecef",
  bodyStroke: "#8d96a0",
  glass: "#c7d4e1",
  glassStroke: "#93a4b6",
  dark: "#2a2f36",
  rim: "#d3d8de",
  hub: "#8d96a0",
  detail: "#b8c0c8",
  shadow: "rgba(15, 18, 22, 0.10)",
  interior: "#3a4049",
};
