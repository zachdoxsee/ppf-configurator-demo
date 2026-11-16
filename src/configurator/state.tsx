import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { ConfiguratorPayload, PackageId, PanelId, VehicleType, ViewId } from "./types";
import { VEHICLES } from "./data/vehicles";
import { PACKAGES_BY_ID } from "./data/packages";
import { matchPackage, narrowToVehicle, resolvePackage, togglePanel, withPanel, withoutPanel } from "./lib/selection";
import { estimate, type Estimate } from "./lib/pricing";

export interface ConfiguratorState {
  vehicleType: VehicleType;
  selected: PanelId[];
  activeView: ViewId;
  hovered: PanelId | null;
}

type Action =
  | { type: "SET_VEHICLE"; vehicleType: VehicleType }
  | { type: "APPLY_PACKAGE"; packageId: PackageId }
  | { type: "TOGGLE_PANEL"; panelId: PanelId }
  | { type: "SELECT_PANEL"; panelId: PanelId }
  | { type: "DESELECT_PANEL"; panelId: PanelId }
  | { type: "CLEAR" }
  | { type: "SET_VIEW"; view: ViewId }
  | { type: "HOVER"; panelId: PanelId | null };

function reducer(state: ConfiguratorState, action: Action): ConfiguratorState {
  switch (action.type) {
    case "SET_VEHICLE": {
      if (action.vehicleType === state.vehicleType) return state;
      const vehicle = VEHICLES[action.vehicleType];
      // Preserve the intent: if a preset was active, re-apply it for the new
      // body style; otherwise keep whatever custom panels still exist.
      const matched = matchPackage(state.selected, VEHICLES[state.vehicleType]);
      const selected = matched
        ? resolvePackage(PACKAGES_BY_ID[matched], vehicle)
        : narrowToVehicle(state.selected, vehicle);
      return { ...state, vehicleType: action.vehicleType, selected, hovered: null };
    }
    case "APPLY_PACKAGE": {
      const vehicle = VEHICLES[state.vehicleType];
      return { ...state, selected: resolvePackage(PACKAGES_BY_ID[action.packageId], vehicle) };
    }
    case "TOGGLE_PANEL":
      return { ...state, selected: togglePanel(state.selected, action.panelId) };
    case "SELECT_PANEL":
      return { ...state, selected: withPanel(state.selected, action.panelId) };
    case "DESELECT_PANEL":
      return { ...state, selected: withoutPanel(state.selected, action.panelId) };
    case "CLEAR":
      return { ...state, selected: [] };
    case "SET_VIEW":
      return { ...state, activeView: action.view };
    case "HOVER":
      return state.hovered === action.panelId ? state : { ...state, hovered: action.panelId };
  }
}

export interface ConfiguratorApi extends ConfiguratorState {
  vehicle: (typeof VEHICLES)[VehicleType];
  matchedPackage: PackageId | null;
  estimate: Estimate;
  payload: ConfiguratorPayload;
  setVehicle: (vehicleType: VehicleType) => void;
  applyPackage: (packageId: PackageId) => void;
  toggle: (panelId: PanelId) => void;
  select: (panelId: PanelId) => void;
  deselect: (panelId: PanelId) => void;
  clear: () => void;
  setView: (view: ViewId) => void;
  hover: (panelId: PanelId | null) => void;
}

const Ctx = createContext<ConfiguratorApi | null>(null);

export interface ConfiguratorProviderProps {
  children: ReactNode;
  initialVehicle?: VehicleType;
  initialPackage?: PackageId;
  initialPanels?: PanelId[];
}

export function ConfiguratorProvider({
  children,
  initialVehicle = "sedan",
  initialPackage,
  initialPanels,
}: ConfiguratorProviderProps) {
  const [state, dispatch] = useReducer(reducer, undefined, (): ConfiguratorState => {
    const vehicle = VEHICLES[initialVehicle];
    const selected = initialPanels
      ? narrowToVehicle(initialPanels, vehicle)
      : initialPackage
        ? resolvePackage(PACKAGES_BY_ID[initialPackage], vehicle)
        : [];
    return { vehicleType: initialVehicle, selected, activeView: "side", hovered: null };
  });

  const api = useMemo<ConfiguratorApi>(() => {
    const vehicle = VEHICLES[state.vehicleType];
    const matchedPackage = matchPackage(state.selected, vehicle);
    const est = estimate(state.selected, vehicle, matchedPackage);
    const payload: ConfiguratorPayload = {
      vehicleType: state.vehicleType,
      packageId: matchedPackage,
      panels: state.selected,
      estimate: {
        subtotalCents: est.subtotalCents,
        discountCents: est.discountCents,
        totalCents: est.totalCents,
        currency: "USD",
      },
    };
    return {
      ...state,
      vehicle,
      matchedPackage,
      estimate: est,
      payload,
      setVehicle: (vehicleType) => dispatch({ type: "SET_VEHICLE", vehicleType }),
      applyPackage: (packageId) => dispatch({ type: "APPLY_PACKAGE", packageId }),
      toggle: (panelId) => dispatch({ type: "TOGGLE_PANEL", panelId }),
      select: (panelId) => dispatch({ type: "SELECT_PANEL", panelId }),
      deselect: (panelId) => dispatch({ type: "DESELECT_PANEL", panelId }),
      clear: () => dispatch({ type: "CLEAR" }),
      setView: (view) => dispatch({ type: "SET_VIEW", view }),
      hover: (panelId) => dispatch({ type: "HOVER", panelId }),
    };
  }, [state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useConfigurator(): ConfiguratorApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConfigurator must be used inside <ConfiguratorProvider>");
  return ctx;
}
