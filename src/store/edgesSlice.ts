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

  selectedEdges: string[];
  setSelectedEdges: (edges: string[]) => void;
  getEdgesByElevation: () => { elevated: DiagramEdge[]; normal: DiagramEdge[] };

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
  selectedEdges: [],
  setSelectedEdges: (edges) => {
    // find connected nodes and add them to the selection
    const state = get();
    const selectedNodes = edges.reduce((acc, edgeId) => {
      const edge = state.edges.find((e) => e.id === edgeId);
      if (!edge) return acc;
      if (!acc.includes(edge.source)) {
        acc.push(edge.source);
      }
      if (!acc.includes(edge.target)) {
        acc.push(edge.target);
      }
      return acc;
    }, [] as string[]);

    get().setSelectedNodes(selectedNodes);
    set(() => ({
      selectedEdges: edges,
    }));
  },

  getEdgesByElevation: () => {
    const state = get();
    return state.edges.reduce(
      (acc, edge) => {
        if (state.selectedEdges.includes(edge.id)) {
          acc.elevated.push(edge);
        } else {
          acc.normal.push(edge);
        }
        return acc;
      },
      { elevated: [], normal: [] } as {
        elevated: DiagramEdge[];
        normal: DiagramEdge[];
      }
    );
  },

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
