import { differenceBy, omit, reject, groupBy, find } from "lodash-es";
import { StoreSlice } from ".";
import { DiagramEdge } from "./diagramStore";
import {
  createEdgePosition,
  createZeroStartEndPosition,
  StartEndPosition,
} from "./utils";

export type EdgesSlice = {
  edges: DiagramEdge[];

  selectedEdges: string[];
  setSelectedEdges: (edges: string[]) => void;
  deleteSelectedEdges: () => void;
  deselectEdges: () => void;
  getEdgesByElevation: () => { elevated: DiagramEdge[]; normal: DiagramEdge[] };
  addEdge: (edge: DiagramEdge) => void;
  addEdges: (edges: DiagramEdge[]) => void;
  setEdges: (edges: DiagramEdge[]) => void;
  getEdge: (id: string) => DiagramEdge | undefined;
  deleteEdge: (id: string) => void;
  deleteEdges: (ids: string[]) => void;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createEdgesSlice: StoreSlice<EdgesSlice> = (set, get) => ({
  edges: [],
  edgeData: {},
  selectedEdges: [],

  deselectEdges: () => {
    set(() => ({ selectedEdges: [] }));
  },

  deleteSelectedEdges: () => {
    set((state) => ({
      edges: differenceBy(state.edges, state.selectedEdges, "id"),
    }));
  },

  deleteEdges: (ids) => {
    set((state) => ({
      edges: differenceBy(state.edges, ids, "id"),
    }));
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: reject(state.edges, { id }),
    }));
  },

  setSelectedEdges: (edges) => {
    set(() => ({ selectedEdges: edges }));
  },

  getEdgesByElevation: () => {
    const state = get();
    const { elevated, normal } = groupBy(state.edges, (edge) =>
      state.selectedEdges.includes(edge.id) ? "elevated" : "normal"
    );
    return { elevated: elevated || [], normal: normal || [] };
  },

  addEdge: (edge) => {
    if (find(get().edges, { id: edge.id })) return;
    set((state) => ({
      edges: [...state.edges, edge],
    }));
  },

  addEdges: (edges) => {
    set((state) => ({
      edges: [...state.edges, ...edges],
    }));
  },

  setEdges: (edges) => {
    set(() => ({ edges }));
  },

  getEdge: (id) => {
    const state = get();
    return find(state.edges, { id });
  },
});
