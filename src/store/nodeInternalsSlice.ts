import { debounce, merge } from "lodash-es";
import { StoreSlice } from ".";
import { CustomHTMLElement } from "../utils/CustomHTMLElement";
import { singletonIntersectionObserver } from "../utils/SingletonIntersectionObserver";
import {
  createZeroVector,
  DOMRectLike,
  getHandleCenter,
  getRelativePosition,
  getUnscaledDOMRect,
  Vector,
} from "./utils";

export interface HandleDimension {
  unscaledRect: DOMRectLike;
  relativePosition: Vector;
  relativeCenterOffset: Vector;
}

export interface NodeInternals {
  position: Vector;
  nodeElement: Element;
  unscaledNodeRect: DOMRectLike;
  handlesElement: Record<string, Element>;
  handlesDimensions: Record<string, HandleDimension>;
}

export type NodeInternalsSlice = {
  nodeInternals: Record<string, NodeInternals>;
  setNodeElement: (nodeId: string, element: Element) => void;

  _debouncedUpdater: DebouncedUpdater;

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

  getNodeInternals: (nodeId: string) => NodeInternals;
  getHandleCenter: (nodeId: string, handleId: string) => Vector;
};

class DebouncedUpdater<
  TUpdater extends (internals: NodeInternalsSlice["nodeInternals"]) => void = (
    internals: NodeInternalsSlice["nodeInternals"]
  ) => void
> {
  private internals: NodeInternalsSlice["nodeInternals"] = {};
  private processInternals: () => void;

  constructor(private updater: TUpdater) {
    this.processInternals = debounce(() => {
      this.updater(this.internals);
      this.internals = {};
    }, 100);
  }

  async setNodeElement(nodeId: string, element: Element, scale: number) {
    const boundingClientRect = await singletonIntersectionObserver.observe(
      element as CustomHTMLElement
    );

    const unscaledNodeRect = getUnscaledDOMRect(boundingClientRect, scale);

    this.internals = {
      ...this.internals,
      [nodeId]: {
        ...this.internals[nodeId],
        nodeElement: element,
        unscaledNodeRect,
      },
    };

    this.processInternals();
  }

  async setHandleElement(
    nodeId: string,
    handleId: string,
    element: Element,
    scale: number
  ) {
    const boundingClientRect = await singletonIntersectionObserver.observe(
      element as CustomHTMLElement
    );

    const unscaledRect = getUnscaledDOMRect(boundingClientRect, scale);

    this.internals = {
      ...this.internals,
      [nodeId]: {
        ...this.internals[nodeId],
        handlesElement: {
          ...this.internals[nodeId]?.handlesElement,
          [handleId]: element,
        },
        handlesDimensions: {
          ...this.internals[nodeId]?.handlesDimensions,
          [handleId]: {
            unscaledRect,
            relativePosition: createZeroVector(),
            relativeCenterOffset: createZeroVector(),
          },
        },
      },
    };

    this.processInternals();
  }
}

const calcDimension = (
  nodeInternals: NodeInternalsSlice["nodeInternals"],
  nodeId: string,
  handleId: string,
  scale: number
) => {
  const element = nodeInternals[nodeId].handlesElement[handleId];
  const unscaledHandleRect =
    nodeInternals[nodeId].handlesDimensions[handleId].unscaledRect;
  const unscaledNodeRect = nodeInternals[nodeId].unscaledNodeRect;
  if (!element || !unscaledNodeRect) return;

  const relativePosition = getRelativePosition({
    containerRect: unscaledNodeRect,
    elementRect: unscaledHandleRect,
  });

  return {
    unscaledRect: unscaledHandleRect,
    relativePosition: relativePosition,
    relativeCenterOffset: {
      x: relativePosition.x + unscaledHandleRect.width / 2,
      y: relativePosition.y + unscaledHandleRect.height / 2,
    },
  };
};

const buildHandleDimension = (
  internals: NodeInternalsSlice["nodeInternals"],
  scale: number
): NodeInternalsSlice["nodeInternals"] => {
  const result: NodeInternalsSlice["nodeInternals"] = {};
  for (const node in internals) {
    const nodeInternals = internals[node];
    const handleDimensions: Record<string, HandleDimension> = {};
    for (const handleId in nodeInternals.handlesElement) {
      const dimension = calcDimension(internals, node, handleId, scale);
      if (dimension) handleDimensions[handleId] = dimension;
    }
    result[node] = {
      ...nodeInternals,
      handlesDimensions: handleDimensions,
    };
  }
  return result;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createNodeInternalsSlice: StoreSlice<NodeInternalsSlice> = (
  set,
  get
) => ({
  nodeInternals: {},
  _debouncedUpdater: new DebouncedUpdater(async (internals) => {
    const result = buildHandleDimension(internals, get().viewport.scale);
    set({ nodeInternals: merge({}, get().nodeInternals, result) });
  }),

  getHandleCenter: (nodeId, handleId) => {
    const node = get().getNodeInternals(nodeId);
    const position = get().getNodePosition(nodeId) || createZeroVector();
    if (!node || !node.handlesDimensions || !node.handlesDimensions[handleId])
      return createZeroVector();

    return getHandleCenter({
      nodePosition: position,
      handleRelativeCenterOffset:
        node.handlesDimensions[handleId].relativeCenterOffset,
    });
  },
  getNodeInternals: (nodeId) => get().nodeInternals[nodeId],
  setNodeElement: (nodeId, element) => {
    get()._debouncedUpdater.setNodeElement(
      nodeId,
      element,
      get().viewport.scale
    );
    // const unscaledNodeRect = getUnscaledDOMRect(
    //   element.getBoundingClientRect(),
    //   get().viewport.scale
    // );
    // set({
    //   nodeInternals: merge({}, get().nodeInternals, {
    //     [nodeId]: {
    //       nodeElement: element,
    //       unscaledNodeRect: unscaledNodeRect,
    //     },
    //   }),
    // });
    // Object.keys(get().nodeInternals[nodeId].handlesElement).forEach(
    //   (handleId) => get()._updateHandleDimension(nodeId, handleId)
    // );
  },
  setHandleElement: (nodeId, handleId, element) => {
    get()._debouncedUpdater.setHandleElement(
      nodeId,
      handleId,
      element,
      get().viewport.scale
    );
    // set({
    //   nodeInternals: merge({}, get().nodeInternals, {
    //     [nodeId]: {
    //       handlesElement: {
    //         [handleId]: element,
    //       },
    //     },
    //   }),
    // });

    // get()._updateHandleDimension(nodeId, handleId);
  },
  _setHandleDimension: (nodeId, handleId, unscaledRect) => {
    set({
      nodeInternals: merge({}, get().nodeInternals, {
        [nodeId]: {
          handlesDimensions: {
            [handleId]: unscaledRect,
          },
        },
      }),
    });
  },
  _updateHandleDimension: (nodeId, handleId) => {
    const element = get().nodeInternals[nodeId].handlesElement[handleId];
    const unscaledNodeRect = get().nodeInternals[nodeId].unscaledNodeRect;
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
      relativeCenterOffset: {
        x: relativePosition.x + unscaledHandleRect.width / 2,
        y: relativePosition.y + unscaledHandleRect.height / 2,
      },
    });
  },
});
