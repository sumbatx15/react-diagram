import { merge } from "lodash-es";
import { StoreSlice } from ".";
import {
  DOMRectLike,
  getRelativePosition,
  getUnscaledDOMRect,
  Vector,
} from "./utils";

export interface HandleDimension {
  unscaledRect: DOMRectLike;
  relativePosition: Vector;
  relativeCenterOffsets: Vector;
}

export interface NodeInternals {
  nodeElement: Element;
  nodeUnscaledRect: DOMRectLike;
  handlesElement: Record<string, Element>;
  handlesDimension: Record<string, HandleDimension>;
}

export type NodeInternalsSlice = {
  nodeInternals: Record<string, NodeInternals>;
  setNodeElement: (nodeId: string, element: Element) => void;

  setHandleElement: (
    nodeId: string,
    handleId: string,
    element: Element
  ) => void;

  _setHandleDimension: (
    nodeId: string,
    handleId: string,
    details: HandleDimension
  ) => void;

  _updateHandleDimension: (nodeId: string, handleId: string) => void;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createNodeInternalsSlice: StoreSlice<NodeInternalsSlice> = (
  set,
  get
) => ({
  nodeInternals: {},
  setNodeElement: (nodeId, element) => {
    const unscaledNodeRect = getUnscaledDOMRect(
      element.getBoundingClientRect(),
      get().viewport.scale
    );

    set({
      nodeInternals: merge({}, get().nodeInternals, {
        [nodeId]: {
          nodeElement: element,
          nodeUnscaledRect: unscaledNodeRect,
        },
      }),
    });

    Object.keys(get().nodeInternals[nodeId].handlesElement).forEach(
      (handleId) => get()._updateHandleDimension(nodeId, handleId)
    );
  },
  setHandleElement: (nodeId, handleId, element) => {
    set({
      nodeInternals: merge({}, get().nodeInternals, {
        [nodeId]: {
          handlesElement: {
            [handleId]: element,
          },
        },
      }),
    });

    get()._updateHandleDimension(nodeId, handleId);
  },
  _setHandleDimension: (nodeId, handleId, unscaledRect) => {
    set({
      nodeInternals: merge({}, get().nodeInternals, {
        [nodeId]: {
          handlesDimension: {
            [handleId]: unscaledRect,
          },
        },
      }),
    });
  },
  _updateHandleDimension: (nodeId, handleId) => {
    const element = get().nodeInternals[nodeId].handlesElement[handleId];
    const unscaledNodeRect = get().nodeInternals[nodeId].nodeUnscaledRect;
    if (!element || !unscaledNodeRect) return;

    const unscaledHandleRect = getUnscaledDOMRect(
      element.getBoundingClientRect(),
      get().viewport.scale
    );

    const relativePosition = getRelativePosition({
      containerRect: unscaledNodeRect,
      elementRect: unscaledHandleRect,
    });

    get()._setHandleDimension(nodeId, handleId, {
      unscaledRect: unscaledHandleRect,
      relativePosition: relativePosition,
      relativeCenterOffsets: {
        x: relativePosition.x + unscaledHandleRect.width / 2,
        y: relativePosition.y + unscaledHandleRect.height / 2,
      },
    });
  },
});
