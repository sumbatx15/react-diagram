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

export type ViewportProps = {
  scale: number;
  position: Vector;
  width: number;
  height: number;
  offsetLeft: number;
  offsetTop: number;
  showSelectionBox: boolean;
  selectionBoxPosition: StartEndPosition;
};

export type ViewportActions = {
  updateScale: (scale: number) => void;
  updatePosition: (position: Vector) => void;
  updateSize: (
    width: number,
    height: number,
    offsetLeft: number,
    offsetTop: number
  ) => void;
  updateSelectionBox: (position: Partial<StartEndPosition>) => void;
  getNodesInSelectionBox: () => string[];
  updateViewport: (viewport: Partial<ViewportProps>) => void;
};

export type ViewportSlice = {
  viewport: ViewportProps & ViewportActions;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createViewportSlice: StoreSlice<ViewportSlice> = (set, get) => ({
  viewport: {
    scale: 1,
    position: { x: 0, y: 0 },
    width: 0,
    height: 0,
    offsetLeft: 0,
    offsetTop: 0,
    updateSize: (width, height, offsetTop, offsetLeft) => {
      set((state) =>
        merge(state, { viewport: { width, height, offsetTop, offsetLeft } })
      );
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
    updateViewport: (viewport) => {
      set((state) => ({
        viewport: merge({}, state.viewport, viewport),
      }));
    },
  },
});
