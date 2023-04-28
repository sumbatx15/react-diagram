import { animated as a, useSpring } from "@react-spring/web";
import { memo } from "react";
import { EdgeFC } from "../../types";
import { getBezierPath } from "../Diagram/utils";
import { useGetDiagramStore } from "../Diagram/WrappedDiagram";

export const DefaultEdge: EdgeFC = memo(
  ({ source, sourceHandle, target, targetHandle, animated }) => {
    const useDiagram = useGetDiagramStore();

    const path = useDiagram((state) => {
      const sourceCenter = state.getHandleCenter(source, sourceHandle);
      const targetCenter = state.getHandleCenter(target, targetHandle);
      const sourcePlacement = state.getHandlePlacement(source, sourceHandle);
      const targetPlacement = state.getHandlePlacement(target, targetHandle);
      if (!sourceCenter || !targetCenter) return "";

      return getBezierPath({
        sourceX: sourceCenter.x,
        sourceY: sourceCenter.y,
        targetX: targetCenter.x,
        targetY: targetCenter.y,
        sourcePlacement,
        targetPlacement,
        curvature: 0.25,
      })[0];
    });

    return (
      <a.path
        style={{
          zIndex: 100,
          pointerEvents: "auto",
          touchAction: "none",
          display: path ? "initial" : "none",
        }}
        d={path}
        stroke="black"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray={animated ? "10 6" : ""}
        strokeDashoffset={animated ? "0" : ""}
        fill="none"
      >
        {animated && (
          <animate
            attributeName="stroke-dashoffset"
            attributeType="XML"
            from="0"
            to="-16"
            dur="0.45s"
            repeatCount="indefinite"
            begin="0s"
          />
        )}
      </a.path>
    );
  }
);
