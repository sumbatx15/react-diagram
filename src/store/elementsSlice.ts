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
} from "./utils";
import {
  createDebouncedUpdater,
  DebouncedUpdater,
} from "../utils/debouncedUpdater";

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

  nodesDebouncedUpdater: DebouncedUpdater<[id: string, element: HTMLElement]>;
  handlesDebouncedUpdater: DebouncedUpdater<
    [id: string, handleId: string, element: HTMLElement]
  >;

  // elementsDebounceUpdater: ElementsUpdater;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createElementsSlice: StoreSlice<ElementsSlice> = (set, get) => {
  return {
    nodeElements: {},
    nodeUnscaledRects: {},
    handleElements: {},
    handleUnscaledRects: {},
    handleDimensions: {},

    setNodeElement2: (id, element, rect) => {
      console.log("rect:", rect);
      get().nodesDebouncedUpdater.update(id, element);
    },

    setHandleElement2: (nodeId, handleId, element) => {
      get().handlesDebouncedUpdater.update(nodeId, handleId, element);
    },

    getHandleCenter: (nodeId, handleId) => {
      const handleDimensions = get().handleDimensions[nodeId]?.[handleId];
      const position = get().getNodePosition(nodeId) || createZeroVector();
      if (!handleDimensions || !position) return createZeroVector();

      return getHandleCenter({
        nodePosition: position,
        handleRelativeCenterOffset: handleDimensions.relativeCenterOffset,
      });
    },
    nodesDebouncedUpdater: createDebouncedUpdater({
      create: () => ({
        nodeElements: {},
        nodeUnscaledRects: {},
      }),
      update: async (state, id, element) => {
        return merge(state, {
          nodeElements: { [id]: element },
          nodeUnscaledRects: {
            [id]: getUnscaledDOMRect(
              await getBoundingClientRect(element),
              get().viewport.scale
            ),
          },
        });
      },
      onUpdate: async ({ nodeElements, nodeUnscaledRects }) => {
        const { handleDimensions, handleUnscaledRects } =
          await generateHandleDimensions({
            nodeUnscaledRects: nodeUnscaledRects,
            handleElements: get().handleElements,
            scale: get().viewport.scale,
          });

        return set((state) => ({
          nodeElements: merge({}, state.nodeElements, nodeElements),
          nodeUnscaledRects: merge(
            {},
            state.nodeUnscaledRects,
            nodeUnscaledRects
          ),
          handleDimensions: merge({}, state.handleDimensions, handleDimensions),
          handleUnscaledRects: merge(
            {},
            state.handleUnscaledRects,
            handleUnscaledRects
          ),
        }));
      },
      timeout: 0,
    }),

    handlesDebouncedUpdater: createDebouncedUpdater({
      create: () => ({
        handleElements: {},
      }),
      update: async (state, nodeId, handleId, element) => {
        return merge(state, {
          handleElements: { [nodeId]: { [handleId]: element } },
          handleUnscaledRects: {
            [nodeId]: {
              [handleId]: getUnscaledDOMRect(
                await getBoundingClientRect(element),
                get().viewport.scale
              ),
            },
          },
        });
      },
      onUpdate: async ({ handleElements }) => {
        const { handleDimensions, handleUnscaledRects } =
          await generateHandleDimensions({
            nodeUnscaledRects: get().nodeUnscaledRects,
            handleElements,
            scale: get().viewport.scale,
          });

        console.log("handles changed");
        return set((state) => {
          console.log("updating state from handlesDebouncedUpdater");
          return {
            handleElements: merge({}, state.handleElements, handleElements),

            handleUnscaledRects: merge(
              {},
              state.handleUnscaledRects,
              handleUnscaledRects
            ),

            handleDimensions: merge(
              {},
              state.handleDimensions,
              handleDimensions
            ),
          };
        });
      },
      timeout: 0,
    }),
  };
};
