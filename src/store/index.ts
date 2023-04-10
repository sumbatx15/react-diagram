import { create, StateCreator } from "zustand";
import { createNodesSlice, NodesSlice } from "./nodesSlice";
import { createEdgesSlice, EdgesSlice } from "./edgesSlice";
import { createDraggedEdgeSlice, DraggedEdgeSlice } from "./draggedEdgeSlice";
import { createElementsSlice, ElementsSlice } from "./elementsSlice";
import { createViewportSlice, ViewportSlice } from "./viewportSlice";
import { subscribeWithSelector } from "zustand/middleware";
import {
  createNodeInternalsSlice,
  NodeInternalsSlice,
} from "./nodeInternalsSlice";

export type StoreState = NodesSlice &
  EdgesSlice &
  DraggedEdgeSlice &
  ElementsSlice &
  ViewportSlice &
  NodeInternalsSlice;
export type StoreSlice<T> = StateCreator<StoreState, [], [], T>;

export const createDiagramStore = () => {
  return create(
    subscribeWithSelector<StoreState>((set, get, store) => ({
      ...createNodesSlice(set, get, store),
      ...createEdgesSlice(set, get, store),
      ...createDraggedEdgeSlice(set, get, store),
      ...createElementsSlice(set, get, store),
      ...createViewportSlice(set, get, store),
      ...createNodeInternalsSlice(set, get, store),
    }))
  );
};
