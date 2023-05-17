import { set as _set, omit } from "lodash-es";
import { StoreSlice } from ".";
import { Placement } from "../components/Diagram/utils";
import {
  DOMRectLike,
  HandleDimensions,
  Vector,
  getHandleCenter
} from "./utils";

export type ElementsSlice = {
  nodeUnscaledRects: Record<string, DOMRectLike>;
  handleUnscaledRects: Record<string, Record<string, DOMRectLike>>;
  handleDimensions: Record<string, Record<string, HandleDimensions>>;
  handlePlacements: Record<string, Record<string, Placement>>;

  getHandleDimensions: (nodeId: string, handleId: string) => HandleDimensions;

  setHandlePlacement: (
    nodeId: string,
    handleId: string,
    placement: Placement
  ) => void;

  getHandlePlacement: (
    nodeId: string,
    handleId: string
  ) => Placement | undefined;

  getHandleCenter: (nodeId: string, handleId: string) => Vector | undefined;
  clearHandleDimensions: (nodeId: string, handleId: string) => void;
  isHandleVisible: (nodeId: string, handleId: string) => boolean;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createElementsSlice: StoreSlice<ElementsSlice> = (set, get) => {
  return {
    nodeUnscaledRects: {},
    handleUnscaledRects: {},
    handleDimensions: {},
    handlePlacements: {},

    setHandlePlacement: (nodeId, handleId, placement) => {
      set((state) => ({
        handlePlacements: _set(
          state.handlePlacements,
          [nodeId, handleId],
          placement
        ),
      }));
    },

    getHandlePlacement: (nodeId, handleId) => {
      return get().handlePlacements[nodeId]?.[handleId];
    },

    getHandleDimensions: (nodeId, handleId) => {
      return get().handleDimensions[nodeId]?.[handleId];
    },

    getHandleCenter: (nodeId, handleId) => {
      const handleDimensions = get().handleDimensions[nodeId]?.[handleId];
      const position = get().getNodePosition(nodeId);
      const { offsetLeft, offsetTop } = get().viewport;
      if (!handleDimensions || !position) return;

      return getHandleCenter({
        nodePosition: position,
        handleRelativeCenterOffset: handleDimensions.relativeCenterOffset,
        offsetLeft,
        offsetTop,
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
