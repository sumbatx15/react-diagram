import { animated as a, useSpring } from "@react-spring/web";
import { memo } from "react";
import { useDiagram } from "../../store/diagramStore";
import { EdgeFC } from "../../types";
import { getBezierPath } from "../Diagram/utils";

export const DefaultEdge: EdgeFC = memo(
  ({ source, sourceHandle, target, targetHandle, animated }) => {
    const [styles, api] = useSpring(() => ({
      start: [0, 0],
      end: [0, 0],
      d: "",
      visible: true,
    }));

    useDiagram((state) => {
      const sourceCenter = state.getHandleCenter(source, sourceHandle);
      const targetCenter = state.getHandleCenter(target, targetHandle);
      const sourcePlacement = state.getHandlePlacement(source, sourceHandle);
      const targetPlacement = state.getHandlePlacement(target, targetHandle);

      if (!sourceCenter || !targetCenter) {
        if (!styles.visible.get()) return;
        return api.set({ visible: false });
      }

      if (
        sourceCenter.x !== styles.start.get()[0] ||
        sourceCenter.y !== styles.start.get()[1] ||
        targetCenter.x !== styles.end.get()[0] ||
        targetCenter.y !== styles.end.get()[1] ||
        !styles.visible.get()
      ) {
        api.set({
          start: [sourceCenter.x, sourceCenter.y],
          end: [targetCenter.x, targetCenter.y],
          visible: true,
          d: getBezierPath({
            sourceX: sourceCenter.x,
            sourceY: sourceCenter.y,
            targetX: targetCenter.x,
            targetY: targetCenter.y,
            sourcePlacement,
            targetPlacement,
            curvature: 0.25,
          })[0],
        });
      }
    });

    return (
      <a.path
        style={{
          zIndex: 100,
          pointerEvents: "auto",
          touchAction: "none",
          display: styles.visible.to((v) => (v ? "initial" : "none")),
        }}
        d={styles.d}
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
