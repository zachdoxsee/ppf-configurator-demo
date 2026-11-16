# PPF Per-Panel Configurator

Frontend for the Redline Labs booking portal: customers pick a body style, choose a
preset paint-protection-film package, then fine-tune coverage panel by panel on an
interactive vehicle mockup (side / front / rear / top).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production bundle
```

## What's here

| Path | Purpose |
| --- | --- |
| `src/configurator/` | The drop-in component. No app chrome, no routing. |
| `src/configurator/types.ts` | `VehicleType`, `PanelId`, `PackageId`, `ConfiguratorPayload` — the contract with the backend. |
| `src/configurator/data/panels.ts` | Canonical panel catalog (labels, zones, Full/Partial variant groups, placeholder prices). |
| `src/configurator/data/packages.ts` | Preset packages as plain panel-id lists. |
| `src/configurator/data/vehicles/` | Per-vehicle view definitions. Generated placeholder art today; traced photos later. |
| `src/configurator/state.tsx` | Reducer + context. `useConfigurator()` exposes state, derived values, and actions. |
| `src/dev/TraceTool.tsx` | Dev-only tracer for cutting panels out of real photos (`?trace`). |
| `src/dev/Gallery.tsx` | Dev-only geometry check for every vehicle × view (`?gallery`). |

## Using the component

```tsx
import { Configurator } from "./configurator";

<Configurator
  initialVehicle="truck"
  initialPackage="full-front"          // or initialPanels={[...]} to restore a saved build
  onSubmit={(payload) => fetch("/api/bookings/ppf", { method: "POST", body: JSON.stringify(payload) })}
/>
```

`onSubmit` receives:

```json
{
  "vehicleType": "truck",
  "packageId": "track",            // null when the selection doesn't match a preset
  "panels": ["hood-full", "front-fenders-full", "front-bumper", "..."],
  "estimate": { "subtotalCents": 261500, "discountCents": 26200, "totalCents": 235300, "currency": "USD" }
}
```

Prices are placeholders (`basePriceCents` × per-vehicle `priceMultiplier`) so the UI can
show a running estimate. The backend should treat `panels` as the source of truth and
price it itself.

### Dropping into the Next.js portal

The component is client-only (`"use client"` on the page that renders it) and uses the same
Tailwind v4 tokens as the portal (`ink-*`, `chalk-*`, `redline-*`). Copy `src/configurator/`
into the app, import `src/index.css`'s `.ppf-*` rules into `globals.css`, and add
`lucide-react` if it isn't already there.

## How panels work

- Every selectable region is a `PanelShape { panelId, d }` — an SVG path in the view's
  `viewBox` space. Selection is keyed by `panelId`, so highlighting syncs across all four
  views and the checklist automatically.
- Panels sharing a `variantGroup` (hood, front fenders, rear quarters) are mutually
  exclusive: Full vs Partial. The list shows them as one row with a switch.
- A vehicle's `availablePanels` is derived from the shapes it has, so a coupe simply
  never shows "Rear Doors" and a convertible never shows "Roof". Packages drop panels the
  vehicle lacks when applied.
- Labels can be overridden per vehicle (`trunk` → "Tailgate" on the truck).

## Replacing the placeholder art with real photos

1. Save the photo as `public/vehicles/<vehicle>/<view>.png` (e.g. `public/vehicles/truck/side.png`).
2. Run `npm run dev` and open `http://localhost:5173/?trace`.
3. Pick the vehicle and view, click **Load image…** and choose the same file.
4. Pick a panel from the dropdown and click around its outline. Click the first point or
   press **Enter** to close it. Points snap to existing vertices so neighbouring panels
   share clean edges. Repeat for every panel (the sidebar lists what's still missing).
   Add two shapes for paired parts like mirrors and headlights.
5. **Export** downloads `<vehicle>.<view>.json`. Save it to
   `src/configurator/data/vehicles/traced/` and register it in `traced/index.ts`:

   ```ts
   import truckSide from "./truck.side.json";
   export const TRACED = { truck: { side: truckSide as TracedView } };
   ```

That view now renders the photo with the traced overlays; every other view keeps the
generated art until it's traced too. Work in progress is kept in `localStorage`, so you
can trace a vehicle over several sessions (re-attach the image after a reload).

## Adding or renaming panels

Add the id to the `PanelId` union in `types.ts`, add an entry to `PANELS`, and give it a
shape in the views where it's visible. If it's part of a preset, add it to the package's
`panelIds`. Nothing else needs to change.
