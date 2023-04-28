import { animated as a, useSpring } from "@react-spring/web";
import { memo, useLayoutEffect, useRef } from "react";
import { createEdgePosition } from "../../store/utils";
import { EdgeFC } from "../../types";
import { intersectionObserver } from "../../utils/intersectionObserver";
import { getCubicBezierPathData } from "../Diagram/edge";
import { getBezierPath } from "../Diagram/utils";
import { useGetDiagramStore } from "../Diagram/WrappedDiagram";

export const DefaultEdge: EdgeFC = memo((edge) => {
  const ref = useRef<SVGGElement>(null);
  const useDiagram = useGetDiagramStore();

  // useLayoutEffect(() => {
  //   console.log('ref.current:', ref.current)
  //   intersectionObserver.observe(ref.current!);
  //   return () => {
  //     intersectionObserver.unobserve(ref.current!);
  //   };
  // }, []);

  const { source, sourceHandle, target, targetHandle, animated } = edge;
  const { start, end } = createEdgePosition(useDiagram.getState(), edge);
  const [styles, api] = useSpring(() => ({
    start: [start.x, start.y],
    end: [end.x, end.y],
    d: getCubicBezierPathData(start, end),
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
    <g ref={ref}>
      <a.path
        style={{
          zIndex: 100,
          cursor: "pointer",
          pointerEvents: "auto",
          touchAction: "none",
          opacity: 0,
          display: styles.visible.to((v) => (v ? "initial" : "none")),
        }}
        d={styles.d}
        stroke="black"
        strokeWidth="16"
        strokeLinecap="round"
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
    </g>
  );
});
