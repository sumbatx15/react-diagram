import { animated as a, useSpring } from "@react-spring/web";
import { memo, useRef } from "react";
import { createZeroVector } from "../../store/utils";
import { EdgeFC } from "../../types";
import { getBezierPath, getEdgeCenter } from "../Diagram/utils";
import { useGetDiagramStore } from "../Diagram/WrappedDiagram";

const foreignObjectSize = 32;
export const DefaultEdge: EdgeFC = memo((edge) => {
  const ref = useRef<SVGGElement>(null);
  const useDiagram = useGetDiagramStore();

  // useLayoutEffect(() => {
  //   intersectionObserver.observe(ref.current!);
  //   return () => {
  //     intersectionObserver.unobserve(ref.current!);
  //   };
  // }, []);
  const { source, sourceHandle, target, targetHandle } = edge;
  const state = useDiagram.getState();

  const sourceCenter =
    state.getHandleCenter(source, sourceHandle) || createZeroVector();
  const targetCenter =
    state.getHandleCenter(target, targetHandle) || createZeroVector();
  const sourcePlacement = state.getHandlePlacement(source, sourceHandle);
  const targetPlacement = state.getHandlePlacement(target, targetHandle);

  const [centerX, centerY] = getEdgeCenter({
    sourceX: sourceCenter.x,
    sourceY: sourceCenter.y,
    targetX: targetCenter.x,
    targetY: targetCenter.y,
  });

  const [styles, api] = useSpring(() => ({
    start: [sourceCenter.x, sourceCenter.y],
    end: [targetCenter.x, targetCenter.y],
    centerX: centerX - foreignObjectSize / 2,
    centerY: centerY - foreignObjectSize / 2,
    d: getBezierPath({
      sourceX: sourceCenter.x,
      sourceY: sourceCenter.y,
      targetX: targetCenter.x,
      targetY: targetCenter.y,
      sourcePlacement,
      targetPlacement,
      curvature: 0.25,
    })[0],
    visible: true,
    selected: state.selectedEdges.includes(edge.id),
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

    const isSelected = state.selectedEdges.includes(edge.id);

    if (
      sourceCenter.x !== styles.start.get()[0] ||
      sourceCenter.y !== styles.start.get()[1] ||
      targetCenter.x !== styles.end.get()[0] ||
      targetCenter.y !== styles.end.get()[1] ||
      !styles.visible.get() ||
      isSelected !== styles.selected.get()
    ) {
      const [centerX, centerY] = getEdgeCenter({
        sourceX: sourceCenter.x,
        sourceY: sourceCenter.y,
        targetX: targetCenter.x,
        targetY: targetCenter.y,
      });
      api.set({
        start: [sourceCenter.x, sourceCenter.y],
        end: [targetCenter.x, targetCenter.y],
        visible: true,
        centerX: centerX - foreignObjectSize / 2,
        centerY: centerY - foreignObjectSize / 2,
        selected: isSelected,
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
    <g
      ref={ref}
      style={{
        pointerEvents: "auto",
      }}
      onClick={() => useDiagram.getState().setSelectedEdges([edge.id])}
    >
      <a.path
        style={{
          cursor: "pointer",
          pointerEvents: "auto",
          touchAction: "none",
          opacity: 0,
          display: styles.visible.to((v) => (v ? "initial" : "none")),
        }}
        d={styles.d}
        strokeWidth="16"
        stroke="white"
      ></a.path>
      <a.path
        className={`edge ${edge.animated ? "animated" : ""}`}
        style={{
          display: styles.visible.to((v) => (v ? "initial" : "none")),
        }}
        d={styles.d}
      ></a.path>

      <a.foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={styles.centerX}
        y={styles.centerY}
        style={{
          background: "transparent",
          pointerEvents: "auto",
          display: styles.visible.to((v) => (v ? "initial" : "none")),
        }}
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <a.div
          onClick={(ev) => {
            ev.stopPropagation();
            return useDiagram.getState().deleteEdge(edge.id);
          }}
          style={{
            width: 32,
            height: 32,
            background: "white",
            borderRadius: "50%",
            display: styles.selected.to((v) => (v ? "block" : "none")),
          }}
        ></a.div>
      </a.foreignObject>
    </g>
  );
});
