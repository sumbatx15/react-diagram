import { create, StateCreator, StoreApi, UseBoundStore } from "zustand";
import { createNodesSlice, NodesSlice } from "./nodesSlice";
import { createEdgesSlice, EdgesSlice } from "./edgesSlice";
import { createDraggedEdgeSlice, DraggedEdgeSlice } from "./draggedEdgeSlice";
import { createElementsSlice, ElementsSlice } from "./elementsSlice";
import { createViewportSlice, ViewportSlice } from "./viewportSlice";
import { subscribeWithSelector } from "zustand/middleware";
import { createFitViewSlice, FitViewSlice } from "./fitviewSlice";
import { createConfigSlice, ConfigSlice } from "./configSlice";
import { merge, omit } from "lodash-es";
import { createIOSlice, IOSlice } from "./ioSlice";

export type StoreState = NodesSlice &
  EdgesSlice &
  DraggedEdgeSlice &
  ElementsSlice &
  ViewportSlice &
  FitViewSlice &
  ConfigSlice &
  IOSlice;

export type StoreSlice<T> = StateCreator<StoreState, [], [], T>;

export const createDiagramStore = () => {
  return create(
    subscribeWithSelector<StoreState>((set, get, store) => ({
      ...createNodesSlice(set, get, store),
      ...createEdgesSlice(set, get, store),
      ...createDraggedEdgeSlice(set, get, store),
      ...createElementsSlice(set, get, store),
      ...createViewportSlice(set, get, store),
      ...createFitViewSlice(set, get, store),
      ...createConfigSlice(set, get, store),
      ...createIOSlice(set, get, store),
    }))
  );
};

export type DiagramStoreHook = ReturnType<typeof createDiagramStore>;
interface DiagramsStore {
  diagrams: Record<string, DiagramStoreHook>;
  createDiagram: (id: string) => DiagramStoreHook;
  createDiagramOnce: (id: string) => DiagramStoreHook;
  clearDiagram: (id: string) => void;
}

export const useDiagrams = create<DiagramsStore>((set, get) => ({
  diagrams: {},
  createDiagram: (id) => {
    const diagram = createDiagramStore();
    set((state) => ({
      diagrams: merge(state.diagrams, { [id]: diagram }),
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
}));
