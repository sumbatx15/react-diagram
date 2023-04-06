import { StoreSlice } from ".";
import { Edge } from "./diagramStore";
import { DiagramNode, EdgePosition, NodeState, Vector } from "./utils";

export type ElementsSlice = {
  elements: Record<string, Element>;
  elementSizes: Record<string, DOMRectReadOnly>;
  setElement: (id: string, element: Element, size: DOMRectReadOnly) => void;
  updateElementSize: (id: string, size: DOMRectReadOnly) => void;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createElementsSlice: StoreSlice<ElementsSlice> = (set, get) => ({
  elements: {},
  elementSizes: {},
  setElement: (id, element, size) => {
    set((state) => ({
      elements: {
        ...state.elements,
        [id]: element,
      },
      elementSizes: {
        ...state.elementSizes,
        [id]: size,
      },
    }));
  },
  updateElementSize: (id, size) => {
    set((state) => ({
      elementSizes: {
        ...state.elementSizes,
        [id]: size,
      },
    }));
  },
});
