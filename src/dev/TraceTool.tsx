import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Copy, Download, Redo2, Trash2, Undo2, Upload } from "lucide-react";
import { PANELS } from "../configurator/data/panels";
import { VEHICLES, VEHICLE_ORDER, VIEW_ORDER } from "../configurator/data/vehicles";
import type { PanelId, VehicleType, ViewId } from "../configurator/types";
import type { TracedView } from "../configurator/data/vehicles/traced";

/**
 * Dev-only panel tracer. Open with `?trace`.
 *
 * Load a photo, pick a panel, click around its outline, press Enter (or click
 * the first point) to close. Export produces the JSON consumed by
 * `data/vehicles/traced/`. Work is kept in localStorage per vehicle+view.
 */

type Pt = [number, number];
interface Shape {
  panelId: PanelId;
  points: Pt[];
}
interface Doc {
  image?: string;
  imageName?: string;
  viewBox: { width: number; height: number };
  shapes: Shape[];
}

const SNAP = 10;
const key = (v: VehicleType, view: ViewId) => `ppf-trace:${v}:${view}`;

const HUE = (id: PanelId) => `hsl(${(PANELS.findIndex((p) => p.id === id) * 137.5) % 360} 70% 50%)`;

const toPath = (pts: Pt[]) => `M${pts.map(([x, y]) => `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`).join("L")}Z`;

function loadDoc(v: VehicleType, view: ViewId): Doc {
  try {
    const raw = localStorage.getItem(key(v, view));
    if (raw) return JSON.parse(raw) as Doc;
  } catch {
    /* ignore */
  }
  const def = VEHICLES[v].views[view];
  return { image: def.image, viewBox: def.viewBox, shapes: [] };
}

export function TraceTool() {
  const [vehicle, setVehicle] = useState<VehicleType>("truck");
  const [view, setView] = useState<ViewId>("side");
  const [doc, setDoc] = useState<Doc>(() => loadDoc("truck", "side"));
  const [panelId, setPanelId] = useState<PanelId>("hood-full");
  const [draft, setDraft] = useState<Pt[]>([]);
  const [cursor, setCursor] = useState<Pt | null>(null);
  const [selectedShape, setSelectedShape] = useState<number | null>(null);
  const [undone, setUndone] = useState<Shape[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Persist and reload per vehicle/view.
  useEffect(() => {
    setDoc(loadDoc(vehicle, view));
    setDraft([]);
    setSelectedShape(null);
  }, [vehicle, view]);
  useEffect(() => {
    try {
      // Object URLs from a file picker don't survive reload; keep the name so
      // the user knows which file to re-attach.
      const persisted = doc.image?.startsWith("blob:") ? { ...doc, image: undefined } : doc;
      localStorage.setItem(key(vehicle, view), JSON.stringify(persisted));
    } catch {
      /* ignore */
    }
  }, [doc, vehicle, view]);

  const allPoints = useMemo(() => doc.shapes.flatMap((s) => s.points), [doc.shapes]);

  const toViewBox = (e: MouseEvent): Pt => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * doc.viewBox.width;
    const y = ((e.clientY - rect.top) / rect.height) * doc.viewBox.height;
    return snap([x, y]);
  };
  const snap = (p: Pt): Pt => {
    let best: Pt = p;
    let bestD = SNAP;
    for (const q of [...allPoints, ...draft]) {
      const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (d < bestD) {
        bestD = d;
        best = q;
      }
    }
    return best;
  };

  const closeDraft = () => {
    if (draft.length < 3) return;
    setDoc((d) => ({ ...d, shapes: [...d.shapes, { panelId, points: draft }] }));
    setDraft([]);
    setUndone([]);
  };

  const onCanvasClick = (e: MouseEvent) => {
    const p = toViewBox(e);
    if (draft.length >= 3 && Math.hypot(p[0] - draft[0][0], p[1] - draft[0][1]) < SNAP) {
      closeDraft();
      return;
    }
    setDraft((d) => [...d, p]);
    setSelectedShape(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "SELECT" || (e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "Enter") closeDraft();
      else if (e.key === "Escape") setDraft([]);
      else if (e.key === "Backspace") {
        e.preventDefault();
        if (draft.length) setDraft((d) => d.slice(0, -1));
        else if (selectedShape !== null) deleteShape(selectedShape);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const deleteShape = (i: number) => {
    setDoc((d) => {
      setUndone((u) => [...u, d.shapes[i]]);
      return { ...d, shapes: d.shapes.filter((_, j) => j !== i) };
    });
    setSelectedShape(null);
  };
  const redo = () => {
    const s = undone[undone.length - 1];
    if (!s) return;
    setUndone((u) => u.slice(0, -1));
    setDoc((d) => ({ ...d, shapes: [...d.shapes, s] }));
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setDoc((d) => ({ ...d, image: url, imageName: file.name, viewBox: { width: img.naturalWidth, height: img.naturalHeight } }));
    };
    img.src = url;
  };

  const exportJson = (): string => {
    const out: TracedView = {
      vehicle,
      view,
      image: `/vehicles/${vehicle}/${view}.png`,
      viewBox: doc.viewBox,
      panels: doc.shapes.map((s) => ({ panelId: s.panelId, d: toPath(s.points), points: s.points })),
    };
    return JSON.stringify(out, null, 2);
  };
  const download = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${vehicle}.${view}.json`;
    a.click();
  };

  const art = VEHICLES[vehicle].views[view].art;
  const { width, height } = doc.viewBox;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="hairline-b flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
        <strong className="mr-2">Panel tracer</strong>
        <Select value={vehicle} onChange={(v) => setVehicle(v as VehicleType)} options={VEHICLE_ORDER.map((v) => [v, VEHICLES[v].label])} />
        <Select value={view} onChange={(v) => setView(v as ViewId)} options={VIEW_ORDER.map((v) => [v, v])} />
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[var(--frame)] px-2.5 py-1.5 hover:border-[var(--frame-hover)]">
          <Upload className="h-4 w-4" />
          {doc.imageName ?? (doc.image ? "Image loaded" : "Load image…")}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        <span className="text-chalk-500">
          {width}×{height}
        </span>
        <span className="mx-2 h-5 w-px bg-[var(--hairline-strong)]" />
        <span className="text-chalk-500">Panel</span>
        <Select
          value={panelId}
          onChange={(v) => setPanelId(v as PanelId)}
          options={PANELS.map((p) => [p.id, p.variantLabel ? `${p.label} (${p.variantLabel})` : p.label])}
          color={HUE(panelId)}
        />
        <span className="ml-auto flex items-center gap-1.5">
          <Btn onClick={() => setDraft((d) => d.slice(0, -1))} disabled={!draft.length} title="Undo point (Backspace)">
            <Undo2 className="h-4 w-4" />
          </Btn>
          <Btn onClick={redo} disabled={!undone.length} title="Redo deleted shape">
            <Redo2 className="h-4 w-4" />
          </Btn>
          <Btn onClick={closeDraft} disabled={draft.length < 3}>
            Close shape ⏎
          </Btn>
          <Btn onClick={() => navigator.clipboard?.writeText(exportJson())} disabled={!doc.shapes.length}>
            <Copy className="h-4 w-4" /> Copy JSON
          </Btn>
          <Btn onClick={download} disabled={!doc.shapes.length} primary>
            <Download className="h-4 w-4" /> Export
          </Btn>
        </span>
      </header>

      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_260px]">
        <div className="ppf-stage p-4">
          <div className="relative mx-auto max-w-[1100px] select-none" style={{ aspectRatio: `${width} / ${height}` }}>
            {doc.image && <img src={doc.image} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" />}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`}
              className="absolute inset-0 h-full w-full cursor-crosshair"
              onClick={onCanvasClick}
              onMouseMove={(e) => setCursor(toViewBox(e))}
              onMouseLeave={() => setCursor(null)}
            >
              {!doc.image &&
                art?.layers.map((l, i) => (
                  <path key={i} d={l.d} fill={l.fill ?? "none"} stroke={l.stroke} strokeWidth={l.strokeWidth} opacity={0.5} />
                ))}
              {doc.shapes.map((s, i) => (
                <path
                  key={i}
                  d={toPath(s.points)}
                  fill={HUE(s.panelId)}
                  fillOpacity={selectedShape === i ? 0.7 : 0.4}
                  stroke={HUE(s.panelId)}
                  strokeWidth={selectedShape === i ? 3 : 1.5}
                  vectorEffect="non-scaling-stroke"
                  onClick={(e) => {
                    if (draft.length) return;
                    e.stopPropagation();
                    setSelectedShape(i);
                    setPanelId(s.panelId);
                  }}
                >
                  <title>{s.panelId}</title>
                </path>
              ))}
              {draft.length > 0 && (
                <>
                  <polyline
                    points={[...draft, ...(cursor ? [cursor] : [])].map((p) => p.join(",")).join(" ")}
                    fill="none"
                    stroke={HUE(panelId)}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    vectorEffect="non-scaling-stroke"
                  />
                  {draft.map((p, i) => (
                    <circle key={i} cx={p[0]} cy={p[1]} r={i === 0 ? 7 : 4} fill={i === 0 ? "#fff" : HUE(panelId)} stroke={HUE(panelId)} strokeWidth={2} vectorEffect="non-scaling-stroke" />
                  ))}
                </>
              )}
              {cursor && <circle cx={cursor[0]} cy={cursor[1]} r={3} fill="#111" pointerEvents="none" />}
            </svg>
          </div>
          <p className="mt-3 text-center text-xs text-ink-700">
            Click to add points · click the first point or press <kbd>Enter</kbd> to close · <kbd>Backspace</kbd> removes the last point (or the selected shape) · <kbd>Esc</kbd> cancels · points snap to existing vertices
          </p>
        </div>

        <aside className="hairline-l flex flex-col border-l border-[var(--hairline)]">
          <div className="hairline-b px-3 py-2 text-xs font-semibold uppercase tracking-wider text-chalk-500">
            Shapes ({doc.shapes.length})
          </div>
          <ul className="flex-1 overflow-auto text-sm">
            {doc.shapes.map((s, i) => (
              <li
                key={i}
                className={`flex cursor-pointer items-center gap-2 px-3 py-1.5 ${selectedShape === i ? "bg-ink-700" : "hover:bg-ink-800"}`}
                onClick={() => {
                  setSelectedShape(i);
                  setPanelId(s.panelId);
                }}
              >
                <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: HUE(s.panelId) }} />
                <span className="flex-1 truncate">{s.panelId}</span>
                <span className="text-xs text-chalk-500">{s.points.length} pts</span>
                <button type="button" onClick={(e) => (e.stopPropagation(), deleteShape(i))} className="text-chalk-500 hover:text-redline-400" aria-label="Delete shape">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
            {!doc.shapes.length && <li className="px-3 py-4 text-xs text-chalk-500">No shapes yet. Pick a panel and start clicking.</li>}
          </ul>
          <div className="hairline-t p-3 text-xs text-chalk-500">
            Missing on this vehicle:{" "}
            {PANELS.filter((p) => !doc.shapes.some((s) => s.panelId === p.id)).map((p) => p.id).join(", ") || "nothing 🎉"}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Select({ value, onChange, options, color }: { value: string; onChange: (v: string) => void; options: [string, string][]; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {color && <span className="h-3 w-3 rounded-sm" style={{ background: color }} />}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-md border border-[var(--frame)] bg-ink-800 px-2 py-1.5 text-sm text-chalk-100">
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </span>
  );
}

function Btn({ children, onClick, disabled, title, primary }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; title?: string; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-semibold transition disabled:opacity-40 ${
        primary ? "bg-redline-500 text-white hover:bg-redline-400" : "border border-[var(--frame)] text-chalk-100 hover:border-[var(--frame-hover)]"
      }`}
    >
      {children}
    </button>
  );
}
