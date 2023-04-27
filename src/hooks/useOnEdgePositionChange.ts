import { useEffect } from "react";
import { DiagramEdge, useDiagram } from "../store/diagramStore";
import { shallow } from "zustand/shallow";

export const useOnEdgePositionChange = (edge: DiagramEdge) => {
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
