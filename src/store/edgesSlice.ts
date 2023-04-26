import { StoreSlice } from ".";
import { DiagramEdge } from "./diagramStore";
import {
  createEdgePosition,
  createZeroStartEndPosition,
  StartEndPosition,
} from "./utils";

export type EdgesSlice = {
  edges: DiagramEdge[];
  edgePositions: Record<string, StartEndPosition>;
  updateEdgePosition: (id: string, position: StartEndPosition) => void;
  addEdge: (edge: DiagramEdge) => void;
  addEdges: (edges: DiagramEdge[]) => void;
  setEdges: (edges: DiagramEdge[]) => void;
  getEdge: (id: string) => DiagramEdge | undefined;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createEdgesSlice: StoreSlice<EdgesSlice> = (set, get) => ({
  edges: [],
  edgePositions: {},
  edgeData: {},

  updateEdgePosition: (id, position) => {
    set((state) => ({
      edgePositions: {
        ...state.edgePositions,
        [id]: position,
      },
    }));
  },

  addEdge: (edge) => {
    if (get().edges.find((e) => e.id === edge.id)) return;  
    set((state) => ({
      edges: [...state.edges, edge],
      edgePositions: {
        ...state.edgePositions,
        [edge.id]: createZeroStartEndPosition(),
      },
    }));
  },

  addEdges: (edges) => {
    set((state) => ({
      edges: [...state.edges, ...edges],
    }));
  },

  setEdges: (edges) => {
    set((state) => ({
      edges,
    }));
  },

  getEdge: (id) => {
    const state = get();
    return state.edges.find((edge) => edge.id === id);
  },
});
