import { shallow } from "zustand/shallow";
import { getBezierPath } from "../components/Diagram/utils";
import { useGetDiagramStore } from "../components/Diagram/WrappedDiagram";
import { createZeroVector } from "../store/utils";

export const useEdge = (edgeId: string) => {
  const useDiagram = useGetDiagramStore();
  const edge = useDiagram((state) => state.getEdge(edgeId))!;

  return useDiagram((state) => {
    const { x: sourceX, y: sourceY } =
      state.getHandleCenter(edge.source, edge.sourceHandle) ||
      createZeroVector();
    const { x: targetX, y: targetY } =
      state.getHandleCenter(edge.target, edge.targetHandle) ||
      createZeroVector();
    const sourcePlacement =
      state.getHandlePlacement(edge.source, edge.sourceHandle) || "right";
    const targetPlacement =
      state.getHandlePlacement(edge.target, edge.targetHandle) || "left";

    const bezier = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePlacement,
      targetPlacement,
      curvature: 0.25,
    });

    const selected = state.selectedEdges.includes(edgeId);

    return {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePlacement,
      targetPlacement,
      bezier,
      edge,
      selected,
    };
  }, shallow);
};
