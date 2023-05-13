import { memo, useRef } from "react";
import { shallow } from "zustand/shallow";

import { BackgroundProps, BackgroundVariant } from "./types";
import { DotPattern, LinePattern } from "./Patterns";
import { StoreState } from "../../store";
import { useGetDiagramStore } from "../Diagram/WrappedDiagram";

const defaultColor = {
  [BackgroundVariant.Dots]: "#91919a",
  [BackgroundVariant.Lines]: "#eee",
  [BackgroundVariant.Cross]: "#e2e2e2",
};

const defaultSize = {
  [BackgroundVariant.Dots]: 1,
  [BackgroundVariant.Lines]: 1,
  [BackgroundVariant.Cross]: 6,
};

const selector = (s: StoreState) => ({
  position: s.viewport.position,
  scale: s.viewport.scale,
});

function _Background({
  id,
  variant = BackgroundVariant.Dots,
  // only used for dots and cross
  gap = 20,
  // only used for lines and cross
  size,
  lineWidth = 1,
  offset = 2,
  color,
  style,
  className,
}: BackgroundProps) {
  const ref = useRef<SVGSVGElement>(null);
  const useDiagram = useGetDiagramStore();
  const patternId = "pattern8974987";
  const { position, scale } = useDiagram(selector, shallow);
  const patternColor = color || defaultColor[variant];
  const patternSize = size || defaultSize[variant];
  const isDots = variant === BackgroundVariant.Dots;
  const isCross = variant === BackgroundVariant.Cross;
  const gapXY: [number, number] = Array.isArray(gap) ? gap : [gap, gap];
  const scaledGap: [number, number] = [
    gapXY[0] * scale || 1,
    gapXY[1] * scale || 1,
  ];
  const scaledSize = patternSize * scale;

  const patternDimensions: [number, number] = isCross
    ? [scaledSize, scaledSize]
    : scaledGap;

  const patternOffset = isDots
    ? [scaledSize / offset, scaledSize / offset]
    : [patternDimensions[0] / offset, patternDimensions[1] / offset];

  return (
    <svg
      // className={cc(["react-flow__background", className])}
      style={{
        ...style,
        pointerEvents: "none",
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
      }}
      ref={ref}
      data-testid="rf__background"
    >
      <pattern
        id={patternId + id}
        x={position.x % scaledGap[0]}
        y={position.y % scaledGap[1]}
        width={scaledGap[0]}
        height={scaledGap[1]}
        patternUnits="userSpaceOnUse"
        patternTransform={`translate(-${patternOffset[0]},-${patternOffset[1]})`}
      >
        {isDots ? (
          <DotPattern color={patternColor} radius={scaledSize / offset} />
        ) : (
          <LinePattern
            dimensions={patternDimensions}
            color={patternColor}
            lineWidth={lineWidth}
          />
        )}
      </pattern>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill={`url(#${patternId + id})`}
      />
    </svg>
  );
}

_Background.displayName = "Background";

export const Background = memo(_Background);
