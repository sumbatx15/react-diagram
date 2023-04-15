import { debounce, merge, mapValues, pickBy, transform } from "lodash-es";
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

  _debouncedUpdater: InternalsUpdater;

  setHandleElement: (
    nodeId: string,
    handleId: string,
    element: Element
  ) => void;

  getNodeInternals: (nodeId: string) => NodeInternals;
  // getHandleCenter: (nodeId: string, handleId: string) => Vector;
};

class InternalsUpdater<
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
    }, 0);
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
  return mapValues(internals, (nodeInternals, node) => {
    const handleDimensions = transform(
      nodeInternals.handlesElement,
      (result: Record<string, HandleDimension>, _, handleId) => {
        const dimension = calcDimension(internals, node, handleId, scale);
        if (dimension) result[handleId] = dimension;
      },
      {}
    );

    return {
      ...nodeInternals,
      handlesDimensions: pickBy(handleDimensions),
    };
  });
};
// eslint-disable-next-line react-func/max-lines-per-function
export const createNodeInternalsSlice: StoreSlice<NodeInternalsSlice> = (
  set,
  get
) => ({
  nodeInternals: {},
  _debouncedUpdater: new InternalsUpdater((internals) => {
    // get all values from nodeInternals by internals keys
    const originalInternals = pickBy(get().nodeInternals, (_, key) =>
      Object.keys(internals).includes(key)
    );
    console.log("originalInternals:", originalInternals);

    const result = buildHandleDimension(internals, get().viewport.scale);
    set({ nodeInternals: merge({}, get().nodeInternals, result) });
  }),

  // getHandleCenter: (nodeId, handleId) => {
  //   const node = get().getNodeInternals(nodeId);
  //   const position = get().getNodePosition(nodeId) || createZeroVector();
  //   if (!node || !node.handlesDimensions || !node.handlesDimensions[handleId])
  //     return createZeroVector();

  //   return getHandleCenter({
  //     nodePosition: position,
  //     handleRelativeCenterOffset:
  //       node.handlesDimensions[handleId].relativeCenterOffset,
  //   });
  // },
  getNodeInternals: (nodeId) => get().nodeInternals[nodeId],
  setNodeElement: (nodeId, element) => {
    get()._debouncedUpdater.setNodeElement(
      nodeId,
      element,
      get().viewport.scale
    );
  },
  setHandleElement: (nodeId, handleId, element) => {
    get()._debouncedUpdater.setHandleElement(
      nodeId,
      handleId,
      element,
      get().viewport.scale
    );
  },
});
