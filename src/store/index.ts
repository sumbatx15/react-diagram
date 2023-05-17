import { merge, omit, set } from "lodash-es";
import { create, StateCreator } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { ConfigSlice, createConfigSlice } from "./configSlice";
import { createDraggedEdgeSlice, DraggedEdgeSlice } from "./draggedEdgeSlice";
import { createEdgesSlice, EdgesSlice } from "./edgesSlice";
import { createElementsSlice, ElementsSlice } from "./elementsSlice";
import { createFitViewSlice, FitViewSlice } from "./fitviewSlice";
import { createIOSlice, IOSlice } from "./ioSlice";
import { createNodesSlice, NodesSlice } from "./nodesSlice";
import { createViewportSlice, ViewportSlice } from "./viewportSlice";

export type ExtendedSlice = Object;
export type StoreState = NodesSlice &
  EdgesSlice &
  DraggedEdgeSlice &
  ElementsSlice &
  ViewportSlice &
  FitViewSlice &
  ConfigSlice &
  IOSlice;

export type StoreSlice<T extends ExtendedSlice = ExtendedSlice> = StateCreator<
  StoreState,
  [],
  [],
  T
>;

export const createDiagramStore = <
  TSlice extends ExtendedSlice = ExtendedSlice
>(
  extend?: StoreSlice<TSlice>
) => {
  return create(
    subscribeWithSelector<StoreState & TSlice>((set, get, store) => ({
      ...createNodesSlice(set, get, store),
      ...createEdgesSlice(set, get, store),
      ...createDraggedEdgeSlice(set, get, store),
      ...createElementsSlice(set, get, store),
      ...createViewportSlice(set, get, store),
      ...createFitViewSlice(set, get, store),
      ...createConfigSlice(set, get, store),
      ...createIOSlice(set, get, store),
      ...(extend ? extend(set, get, store) : ({} as TSlice)),
    }))
  );
};

export type DiagramBoundStore<TExtender extends ExtendedSlice = ExtendedSlice> =
  ReturnType<typeof createDiagramStore<TExtender>>;

interface DiagramsStore {
  diagrams: Record<string, DiagramBoundStore>;
  createDiagram: (id: string, diagram?: DiagramBoundStore) => DiagramBoundStore;
  createDiagramOnce: (id: string) => DiagramBoundStore;
  clearDiagram: (id: string) => void;
  getDiagram: (id: string) => DiagramBoundStore;
}

export const useDiagrams = create<DiagramsStore>((set, get) => ({
  diagrams: {},
  createDiagram: (id, store) => {
    const diagram = store || createDiagramStore();
    set((state) => ({
      diagrams: merge(state.diagrams, {
        [id]: diagram,
      }),
    }));
    return diagram;
  },
  createDiagramOnce: (id) => {
    return get().diagrams[id] || get().createDiagram(id);
  },
  clearDiagram: (id) => {
    set((state) => ({
      diagrams: omit(state.diagrams, id),
    }));
  },
  getDiagram: (id) => {
    return get().createDiagramOnce(id);
  },
}));
