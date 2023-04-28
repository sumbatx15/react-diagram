import { merge } from "lodash-es";
import { StoreSlice } from ".";
import { DiagramEdge } from "./diagramStore";
import {
  DiagramNode,
  StartEndPosition,
  NodeState,
  Vector,
  createZeroStartEndPosition,
  getNodesInsideRect,
} from "./utils";

export type ViewportSlice = {
  viewport: {
    scale: number;
    position: Vector;
    width: number;
    height: number;
    updateScale: (scale: number) => void;
    updatePosition: (position: Vector) => void;
    updateSize: (width: number, height: number) => void;

    showSelectionBox: boolean;
    selectionBoxPosition: StartEndPosition;
    updateSelectionBox: (position: Partial<StartEndPosition>) => void;
    getNodesInSelectionBox: () => string[];
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
    showSelectionBox: false,
    selectionBoxPosition: createZeroStartEndPosition(),
    updateSelectionBox: (position) => {
      set((state) => ({
        viewport: merge(state.viewport, {
          selectionBoxPosition: position,
        }),
      }));
    },
    getNodesInSelectionBox: () => {
      return getNodesInsideRect(get());
    },
  },
});
