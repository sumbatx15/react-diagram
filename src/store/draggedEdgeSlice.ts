import { StoreSlice } from ".";
import { Edge } from "./diagramStore";
import { DiagramNode, EdgePosition, NodeState, Vector } from "./utils";

export type DraggedEdgeSlice = {
  draggedEdge: EdgePosition;
  updateDraggedEdge: (position: Partial<EdgePosition>) => void;
  isDraggedEdgeVisible: boolean;
  setDraggedEdgeVisible: (visible: boolean) => void;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createDraggedEdgeSlice: StoreSlice<DraggedEdgeSlice> = (
  set,
  get
) => ({
  draggedEdge: {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  },
  updateDraggedEdge: (position) => {
    set((state) => ({
      draggedEdge: {
        ...state.draggedEdge,
        ...position,
      },
    }));
  },
  isDraggedEdgeVisible: false,
  setDraggedEdgeVisible: (visible) => {
    set((state) => ({
      isDraggedEdgeVisible: visible,
    }));
  },
});
