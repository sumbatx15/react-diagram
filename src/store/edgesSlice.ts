import { StoreSlice } from ".";
import { Edge } from "./diagramStore";
import {
  createEdgePosition,
  createZeroEdgePosition,
  EdgePosition,
} from "./utils";

export type EdgesSlice = {
  edges: Edge[];
  edgePositions: Record<string, EdgePosition>;
  updateEdgePosition: (id: string, position: EdgePosition) => void;
  addEdge: (edge: Edge) => void;
  addEdges: (edges: Edge[]) => void;
  getEdge: (id: string) => Edge | undefined;
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
    set((state) => ({
      edges: [...state.edges, edge],
      edgePositions: {
        ...state.edgePositions,
        [edge.id]: createZeroEdgePosition(),
      },
    }));
  },

  addEdges: (edges) => {
    set((state) => ({
      edges: [...state.edges, ...edges],
    }));
  },

  getEdge: (id) => {
    const state = get();
    return state.edges.find((edge) => edge.id === id);
  },
});
