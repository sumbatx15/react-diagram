import { create, StateCreator } from "zustand";
import { createNodesSlice, NodesSlice } from "./nodesSlice";
import { createEdgesSlice, EdgesSlice } from "./edgesSlice";
import { createDraggedEdgeSlice, DraggedEdgeSlice } from "./draggedEdgeSlice";
import { createElementsSlice, ElementsSlice } from "./elementsSlice";

export type StoreState = NodesSlice &
  EdgesSlice &
  DraggedEdgeSlice &
  ElementsSlice;
export type StoreSlice<T> = StateCreator<StoreState, [], [], T>;

export const createFCTStore = () => {
  return create<StoreState>((set, get, store) => ({
    ...createNodesSlice(set, get, store),
    ...createEdgesSlice(set, get, store),
    ...createDraggedEdgeSlice(set, get, store),
    ...createElementsSlice(set, get, store),
  }));
};
