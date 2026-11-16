import { useId, type KeyboardEvent } from "react";
import type { PanelId, ViewDefinition } from "../types";
import { PANELS_BY_ID } from "../data/panels";
import { useConfigurator } from "../state";
import { panelLabel } from "../lib/selection";

interface VehicleViewProps {
  view: ViewDefinition;
  /** Thumbnails render the selection but never take pointer input. */
  compact?: boolean;
  className?: string;
}

/**
 * Renders one vehicle view: an optional raster image (real photography) or the
 * generated placeholder art, with one clickable <path> per selectable panel.
 */
export function VehicleView({ view, compact = false, className = "" }: VehicleViewProps) {
  const { selected, hovered, vehicle, toggle, hover } = useConfigurator();
  const clipId = useId();
  const { width, height } = view.viewBox;
  const selectedSet = new Set(selected);

  // Within a variant group (hood full vs partial) only the chosen variant stays
  // clickable, so a second click on the hood deselects it instead of flipping
  // to the other variant. The list's Full/Partial switch handles changing it.
  const activeVariantByGroup = new Map<string, PanelId>();
  for (const id of selected) {
    const group = PANELS_BY_ID[id].variantGroup;
    if (group) activeVariantByGroup.set(group, id);
  }
  const isInert = (id: PanelId) => {
    const group = PANELS_BY_ID[id].variantGroup;
    if (!group) return false;
    const active = activeVariantByGroup.get(group);
    return !!active && active !== id;
  };

  const onKey = (e: KeyboardEvent<SVGPathElement>, id: PanelId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(id);
    }
  };

  const useClip = !!view.art;

  return (
    <div
      className={`relative w-full select-none ${compact ? "ppf-view-compact" : ""} ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {view.image && (
        <img
          src={view.image}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 h-full w-full"
        role={compact ? "img" : "group"}
        aria-label={`${vehicle.label} ${view.label.toLowerCase()} view`}
      >
        {useClip && (
          <defs>
            <clipPath id={clipId}>
              <path d={view.art!.silhouette} />
              {view.art!.clipExtras?.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </clipPath>
          </defs>
        )}
        {view.art && (
          <g aria-hidden="true">
            {view.art.layers.map((layer, i) => (
              <path
                key={i}
                d={layer.d}
                fill={layer.fill ?? "none"}
                stroke={layer.stroke}
                strokeWidth={layer.strokeWidth}
                opacity={layer.opacity}
                strokeLinejoin="round"
              />
            ))}
          </g>
        )}
        <g clipPath={useClip ? `url(#${clipId})` : undefined}>
          {view.panels.map((shape, i) => {
            const isSelected = selectedSet.has(shape.panelId);
            const isHovered = hovered === shape.panelId;
            const inert = isInert(shape.panelId);
            const label = panelLabel(shape.panelId, vehicle);
            const variant = PANELS_BY_ID[shape.panelId].variantLabel;
            return (
              <path
                key={`${shape.panelId}-${i}`}
                d={shape.d}
                className={`ppf-panel ${isSelected ? "is-selected" : ""} ${isHovered ? "is-hovered" : ""}`}
                data-panel={shape.panelId}
                data-interactive={!compact}
                data-inert={inert}
                role={compact ? undefined : "button"}
                tabIndex={compact || inert ? -1 : 0}
                aria-pressed={compact ? undefined : isSelected}
                aria-label={compact ? undefined : variant ? `${label} (${variant})` : label}
                onClick={compact ? undefined : () => toggle(shape.panelId)}
                onKeyDown={compact ? undefined : (e) => onKey(e, shape.panelId)}
                onMouseEnter={compact ? undefined : () => hover(shape.panelId)}
                onMouseLeave={compact ? undefined : () => hover(null)}
                onFocus={compact ? undefined : () => hover(shape.panelId)}
                onBlur={compact ? undefined : () => hover(null)}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
