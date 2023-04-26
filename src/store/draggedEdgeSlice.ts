import { StoreSlice } from ".";
import { DiagramEdge } from "./diagramStore";
import { DiagramNode, StartEndPosition, NodeState, Vector } from "./utils";

export type DraggedEdgeSlice = {
  draggedEdge: StartEndPosition;
  updateDraggedEdge: (position: Partial<StartEndPosition>) => void;
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
