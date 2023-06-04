import { set as _set, omit } from "lodash-es";
import { StoreSlice } from ".";
import { Placement } from "../components/Diagram/utils";
import {
  DOMRectLike,
  HandleDimensions,
  Vector,
  getHandleCenter,
} from "./utils";

type NodeId = string;
type HandleId = string;

export type ElementsSlice = {
  nodeUnscaledRects: Record<NodeId, DOMRectLike>;
  handleUnscaledRects: Record<NodeId, Record<HandleId, DOMRectLike>>;
  handleDimensions: Record<NodeId, Record<HandleId, HandleDimensions>>;
  handlePlacements: Record<NodeId, Record<HandleId, Placement>>;
  handleRenderers: Record<NodeId, Record<HandleId, string>>;

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
  clearHandleRenderer: (nodeId: string, handleId: string) => void;
  clearHandleRenderersByNodeId: (nodeId: string) => void;
  isHandleVisible: (nodeId: string, handleId: string) => boolean;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createElementsSlice: StoreSlice<ElementsSlice> = (set, get) => {
  return {
    nodeUnscaledRects: {},
    handleUnscaledRects: {},
    handleDimensions: {},
    handlePlacements: {},
    handleRenderers: {},

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
      const rendererId = get().handleRenderers[nodeId]?.[handleId];
      const position = get().getNodePosition(rendererId);
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
    clearHandleRenderer: (nodeId, handleId) => {
      set((state) => ({
        handleRenderers: {
          ...state.handleRenderers,
          [nodeId]: omit(state.handleRenderers[nodeId], handleId),
        },
      }));
    },
    clearHandleRenderersByNodeId: (nodeId) => {
      const renderers = omit(get().handleRenderers, nodeId);
      console.log('renderers:', renderers)
      set((state) => ({
        handleRenderers: renderers,
      }));
    },

    isHandleVisible: (nodeId, handleId) => {
      return !!get().handleDimensions[nodeId]?.[handleId];
    },
  };
};
