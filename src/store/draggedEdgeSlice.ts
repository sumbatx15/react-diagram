import { StoreSlice } from ".";
import { DiagramEdge } from "./diagramStore";
import { DiagramNode, StartEndPosition, NodeState, Vector } from "./utils";

export type DraggedEdgeSlice = {
  draggedEdge: {
    handleType: "source" | "target";
    handleId: string;
    nodeId: string;
  } | null;
  setDraggedEdge: (
    edge: {
      handleType: "source" | "target";
      handleId: string;
      nodeId: string;
    } | null
  ) => void;
  draggedEdgePosition: StartEndPosition;
  updateDraggedEdgePosition: (position: Partial<StartEndPosition>) => void;
  isDraggedEdgeVisible: boolean;
  setDraggedEdgeVisible: (visible: boolean) => void;
  clearDraggedEdge: () => void;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createDraggedEdgeSlice: StoreSlice<DraggedEdgeSlice> = (
  set,
  get
) => ({
  draggedEdge: null,
  draggedEdgePosition: {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  },
  setDraggedEdge: (edge) => {
    set(() => ({
      draggedEdge: edge,
    }));
  },
  updateDraggedEdgePosition: (position) => {
    set((state) => ({
      draggedEdgePosition: {
        ...state.draggedEdgePosition,
        ...position,
      },
    }));
  },
  isDraggedEdgeVisible: false,
  setDraggedEdgeVisible: (visible) => {
    set(() => ({
      isDraggedEdgeVisible: visible,
    }));
  },
  clearDraggedEdge: () => {
    set(() => ({
      draggedEdge: null,
      isDraggedEdgeVisible: false,
    }));
  },
});
