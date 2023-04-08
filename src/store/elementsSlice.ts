import { StoreSlice } from ".";
import { Edge } from "./diagramStore";
import { DiagramNode, EdgePosition, NodeState, Vector } from "./utils";

import { debounce } from "lodash-es";

class DebouncedUpdater<
  TItem extends any,
  TUpdater extends (items: TItem[]) => void = (items: TItem[]) => void
> {
  private queue: TItem[] = [];
  private processQueue = debounce((updater: TUpdater) => {
    updater(this.queue);
    this.queue = [];
  }, 0);

  constructor(private updater: TUpdater) {}

  addItem(item: TItem) {
    this.queue.push(item);
    this.processQueue(this.updater);
  }
}

export type ElementsSlice = {
  elements: Record<string, Element>;
  elementRects: Record<string, DOMRectReadOnly>;
  elementsDebounceUpdater: DebouncedUpdater<{
    id: string;
    element: Element;
    rect: DOMRectReadOnly;
  }>;
  setElement: (id: string, element: Element, rect: DOMRectReadOnly) => void;
  setElementRects: (rectsMap: ElementsSlice["elementRects"]) => void;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createElementsSlice: StoreSlice<ElementsSlice> = (set, get) => ({
  elements: {},
  elementRects: {},
  elementsDebounceUpdater: new DebouncedUpdater((items) => {
    console.log("debounced updater", items);
    const { elements, elementRects } = items.reduce(
      (acc, { id, element, rect }) => {
        acc.elements[id] = element;
        acc.elementRects[id] = rect;
        return acc;
      },
      { elements: {}, elementRects: {} } as {
        elements: ElementsSlice["elements"];
        elementRects: ElementsSlice["elementRects"];
      }
    );

    set((state) => ({
      elements: {
        ...state.elements,
        ...elements,
      },
      elementRects: {
        ...state.elementRects,
        ...elementRects,
      },
    }));
  }),
  setElement: (id, element, rect) => {
    get().elementsDebounceUpdater.addItem({ id, element, rect });
    // console.log("set element", id,);
    // set((state) => ({
    //   elements: {
    //     ...state.elements,
    //     [id]: element,
    //   },
    //   elementRects: {
    //     ...state.elementRects,
    //     [id]: rect,
    //   },
    // }));
  },

  setElementRects: (rects) => {
    set((state) => ({
      elementRects: {
        ...state.elementRects,
        ...rects,
      },
    }));
  },
});
