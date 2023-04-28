import { useEffect } from "react";
import { shallow } from "zustand/shallow";
import { useGetDiagramStore } from "../components/Diagram/WrappedDiagram";
import { DiagramEdge } from "../store/diagramStore";

export const useOnEdgePositionChange = (edge: DiagramEdge) => {
  const useDiagram = useGetDiagramStore();

  useEffect(() => {
    const unsubscribe = useDiagram.subscribe(
      (state) => ({
        source: state.handleDimensions[edge.source]?.[edge.sourceHandle],
        target: state.handleDimensions[edge.target]?.[edge.targetHandle],
        sourcePos: state.nodeUnscaledRects[edge.source],
      }),
      (state) => {},
      {
        equalityFn: shallow,
      }
    );
    return unsubscribe;
  });
};
