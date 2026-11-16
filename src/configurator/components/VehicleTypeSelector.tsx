import { VEHICLES, VEHICLE_ORDER } from "../data/vehicles";
import { useConfigurator } from "../state";

/** Segmented control of body styles; the icon is each vehicle's own side silhouette. */
export function VehicleTypeSelector() {
  const { vehicleType, setVehicle } = useConfigurator();
  return (
    <div className="frame flex flex-wrap gap-1 p-1" role="radiogroup" aria-label="Vehicle type">
      {VEHICLE_ORDER.map((type) => {
        const v = VEHICLES[type];
        const active = type === vehicleType;
        const side = v.views.side;
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setVehicle(type)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              active
                ? "bg-chalk-50 text-ink-900"
                : "text-chalk-300 hover:bg-ink-700 hover:text-chalk-50"
            }`}
          >
            {side.art && (
              <svg viewBox={`0 0 ${side.viewBox.width} ${side.viewBox.height}`} className="h-4 w-9" aria-hidden="true">
                <path d={side.art.silhouette} fill="currentColor" />
              </svg>
            )}
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
