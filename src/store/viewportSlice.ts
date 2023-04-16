import { merge } from "lodash-es";
import { StoreSlice } from ".";
import { Edge } from "./diagramStore";
import { DiagramNode, EdgePosition, NodeState, Vector } from "./utils";

export type ViewportSlice = {
  viewport: {
    scale: number;
    position: Vector;
    width: number;
    height: number;
    updateScale: (scale: number) => void;
    updatePosition: (position: Vector) => void;
    updateSize: (width: number, height: number) => void;
  };
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createViewportSlice: StoreSlice<ViewportSlice> = (set, get) => ({
  viewport: {
    scale: 1,
    position: { x: 0, y: 0 },
    width: 0,
    height: 0,
    updateSize: (width: number, height: number) => {
      set((state) => merge(state, { viewport: { width, height } }));
    },
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
