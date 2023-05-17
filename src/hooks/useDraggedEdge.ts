import { useGetDiagramStore } from "../components/Diagram/WrappedDiagram";
import { StoreState } from "../store";

const draggedEdgeSelector = (state: StoreState) => state.draggedEdge;

export const useDraggedEdge = () => {
  const useDiagram = useGetDiagramStore();
  return useDiagram(draggedEdgeSelector);
};
