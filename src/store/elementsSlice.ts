import { StoreSlice } from ".";
import { debounce, merge, pick } from "lodash-es";
import {
  DOMRectLike,
  getBoundingClientRect,
  generateHandleDimensionsOnHandlesResize,
  HandleDimensions,
  Vector,
  createZeroVector,
  getHandleCenter,
  getUnscaledDOMRect,
  generateHandleDimensions,
  getHandleDimension,
  getHandlePositions,
} from "./utils";
import {
  createDebouncedUpdater,
  DebouncedUpdater,
} from "../utils/debouncedUpdater";
import { createSelector } from "reselect";

interface NodeRectSelectorParams {
  handleElement: HTMLElement;
  scale: number;
}

const nodeRectSelector = createSelector(
  (state: NodeRectSelectorParams) => state.handleElement,
  (state: NodeRectSelectorParams) => state.scale,
  async (handleElement, scale) => {
    const nodeElement = handleElement.closest(
      '[data-type="node"]'
    ) as HTMLElement;
    return getUnscaledDOMRect(await getBoundingClientRect(nodeElement), scale);
  }
);

class ElementsUpdater {
  private elements: Pick<
    ElementsSlice,
    | "nodeElements"
    | "handleElements"
    | "nodeUnscaledRects"
    | "handleUnscaledRects"
  > = {
    nodeElements: {},
    nodeUnscaledRects: {},
    handleElements: {},
    handleUnscaledRects: {},
  };

  private process: () => void;

  constructor(
    private updater: (
      elements: Pick<
        ElementsSlice,
        | "nodeElements"
        | "handleElements"
        | "nodeUnscaledRects"
        | "handleUnscaledRects"
      >
    ) => void
  ) {
    this.process = debounce(() => {
      this.updater(this.elements);
      this.elements = {
        nodeElements: {},
        handleElements: {},
        nodeUnscaledRects: {},
        handleUnscaledRects: {},
      };
    }, 0);
  }

  async setNodeElement2(nodeId: string, element: HTMLElement) {
    this.elements = merge(this.elements, {
      nodeElements: {
        [nodeId]: element,
      },
      nodeUnscaledRects: {
        [nodeId]: await getBoundingClientRect(element),
      },
    });

    this.process();
  }

  async setHandleElement2(
    nodeId: string,
    handleId: string,
    element: HTMLElement
  ) {
    const unscaledRect = await getBoundingClientRect(element);
    const nodeElement = element.closest('[data-type="node"]');
    console.log("nodeElement:", nodeElement);
    this.elements = merge(this.elements, {
      handleElements: {
        [nodeId]: {
          [handleId]: element,
        },
      },
      handleUnscaledRects: {
        [nodeId]: {
          [handleId]: unscaledRect,
        },
      },
    });

    this.process();
  }
}

export type ElementsSlice = {
  nodeElements: Record<string, HTMLElement>;
  nodeUnscaledRects: Record<string, DOMRectLike>;

  handleElements: Record<string, Record<string, HTMLElement>>;
  handleUnscaledRects: Record<string, Record<string, DOMRectLike>>;
  handleDimensions: Record<string, Record<string, HandleDimensions>>;

  setNodeElement2: (id: string, element: HTMLElement, rect?: any) => void;
  setHandleElement2: (
    id: string,
    handleId: string,
    element: HTMLElement
  ) => void;

  getHandleCenter: (nodeId: string, handleId: string) => Vector;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createElementsSlice: StoreSlice<ElementsSlice> = (set, get) => {
  return {
    nodeElements: {},
    nodeUnscaledRects: {},
    handleElements: {},
    handleUnscaledRects: {},
    handleDimensions: {},

    setNodeElement2: (id, element, rect) => {},

    setHandleElement2: (nodeId, handleId, element) => {},

    getHandleCenter: (nodeId, handleId) => {
      const handleDimensions = get().handleDimensions[nodeId]?.[handleId];
      const position = get().getNodePosition(nodeId) || createZeroVector();
      if (!handleDimensions || !position) return createZeroVector();

      return getHandleCenter({
        nodePosition: position,
        handleRelativeCenterOffset: handleDimensions.relativeCenterOffset,
      });
    },
  };
};
