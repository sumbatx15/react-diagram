import { omit } from "lodash-es";
import { StoreSlice } from ".";
import {
  DOMRectLike,
  HandleDimensions,
  Vector,
  createZeroVector,
  getHandleCenter,
} from "./utils";

export type ElementsSlice = {
  nodeElements: Record<string, HTMLElement>;
  nodeUnscaledRects: Record<string, DOMRectLike>;

  handleElements: Record<string, Record<string, HTMLElement>>;
  handleUnscaledRects: Record<string, Record<string, DOMRectLike>>;
  handleDimensions: Record<string, Record<string, HandleDimensions>>;

  getHandleCenter: (nodeId: string, handleId: string) => Vector;
  clearHandleDimensions: (nodeId: string, handleId: string) => void;
  isHandleVisible: (nodeId: string, handleId: string) => boolean;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createElementsSlice: StoreSlice<ElementsSlice> = (set, get) => {
  return {
    nodeElements: {},
    nodeUnscaledRects: {},
    handleElements: {},
    handleUnscaledRects: {},
    handleDimensions: {},

    getHandleCenter: (nodeId, handleId) => {
      const handleDimensions = get().handleDimensions[nodeId]?.[handleId];
      const position = get().getNodePosition(nodeId) || createZeroVector();
      if (!handleDimensions || !position) return;

      return getHandleCenter({
        nodePosition: position,
        handleRelativeCenterOffset: handleDimensions.relativeCenterOffset,
      });
    },

    clearHandleDimensions: (nodeId, handleId) => {
      set((state) => ({
        handleDimensions: {
          ...state.handleDimensions,
          [nodeId]: omit(state.handleDimensions[nodeId], handleId),
        },
      }));
    },

    isHandleVisible: (nodeId, handleId) => {
      return !!get().handleDimensions[nodeId]?.[handleId];
    },
  };
};
