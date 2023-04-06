import { StoreSlice } from ".";
import { Edge } from "./diagramStore";
import { DiagramNode, EdgePosition, NodeState, Vector } from "./utils";

export type ViewportSlice = {
  viewport: {
    scale: number;
    position: Vector;
    updateScale: (scale: number) => void;
    updatePosition: (position: Vector) => void;
  };
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createViewportSlice: StoreSlice<ViewportSlice> = (set, get) => ({
  viewport: {
    scale: 1,
    position: { x: 0, y: 0 },
    updateScale: (scale) => {
      set((state) => ({
        viewport: {
          ...state.viewport,
          scale,
        },
      }));
    },
    updatePosition: (position) => {
      set((state) => ({
        viewport: {
          ...state.viewport,
          position,
        },
      }));
    },
  },
});
