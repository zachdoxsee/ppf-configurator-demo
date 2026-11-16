import type { ConfiguratorPayload, PackageId, PanelId, VehicleType } from "../types";
import { ConfiguratorProvider } from "../state";
import { VehicleTypeSelector } from "./VehicleTypeSelector";
import { VehicleStage } from "./VehicleStage";
import { PackagePicker } from "./PackagePicker";
import { PanelList } from "./PanelList";
import { Summary } from "./Summary";

export interface ConfiguratorProps {
  /** Called with the booking payload when the customer continues. */
  onSubmit?: (payload: ConfiguratorPayload) => void;
  submitLabel?: string;
  initialVehicle?: VehicleType;
  initialPackage?: PackageId;
  /** Restore a saved build (takes precedence over `initialPackage`). */
  initialPanels?: PanelId[];
}

/**
 * Drop-in PPF configurator. Self-contained: bring your own page chrome, pass
 * `onSubmit` to receive the payload for the booking backend.
 */
export function Configurator({ onSubmit, submitLabel, initialVehicle, initialPackage, initialPanels }: ConfiguratorProps) {
  return (
    <ConfiguratorProvider initialVehicle={initialVehicle} initialPackage={initialPackage} initialPanels={initialPanels}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Vehicle</p>
            <p className="text-sm text-chalk-300">Pick the body style closest to your vehicle.</p>
          </div>
          <VehicleTypeSelector />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="min-w-0">
            <VehicleStage />
            <Legend />
          </div>
          <aside className="flex min-w-0 flex-col gap-6">
            <PackagePicker />
            <PanelList />
            <Summary onSubmit={onSubmit} submitLabel={submitLabel} />
          </aside>
        </div>
      </div>
    </ConfiguratorProvider>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-chalk-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-4 rounded-sm border border-[#b81219] bg-[rgba(225,29,38,0.46)]" aria-hidden="true" />
        Selected for PPF
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-4 rounded-sm border border-[#2563eb] bg-[rgba(59,130,246,0.3)]" aria-hidden="true" />
        Hovering
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-4 rounded-sm border border-[rgba(40,46,54,0.5)] bg-[#e9ecef]" aria-hidden="true" />
        Available panel
      </span>
    </div>
  );
}
