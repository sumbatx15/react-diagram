import { StoreSlice } from ".";
import { DiagramNode, NodeState, Vector } from "./utils";

export type NodesSlice = {
  nodeIds: string[];
  nodePositions: Record<string, Vector>;
  nodeData: Record<string, unknown>;
  nodeStates: Record<string, NodeState>;
  updateNodePosition: (id: string, position: Vector) => void;
  addNode: (node: DiagramNode) => void;
  getNode: (id: string) => DiagramNode | undefined;
  getNodePosition: (id: string) => Vector | undefined;
  getNodeState: (id: string) => NodeState | undefined;
  getNodeData: (id: string) => unknown | undefined;
  getNodes: () => DiagramNode[];

  nodeSizes: Record<string, DOMRectReadOnly>;
  updateNodeSize: (id: string, rect: DOMRectReadOnly) => void;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createNodesSlice: StoreSlice<NodesSlice> = (set, get) => ({
  nodeIds: [],
  nodePositions: {},
  nodeData: {},
  nodeStates: {},
  nodeSizes: {},

  addNode: (node) => {
    set((state) => ({
      nodeIds: [...state.nodeIds, node.id],
      nodePositions: {
        ...state.nodePositions,
        [node.id]: node.position,
      },
      nodeData: {
        ...state.nodeData,
        [node.id]: node.data,
      },
      nodeStates: {
        ...state.nodeStates,
        [node.id]: node.state,
      },
    }));
  },

  updateNodePosition: (id, position) => {
    set((state) => ({
      nodePositions: {
        ...state.nodePositions,
        [id]: position,
      },
    }));
  },

  getNode: (id) => {
    const state = get();
    return {
      id,
      position: state.nodePositions[id],
      state: state.nodeStates[id],
      data: state.nodeData[id],
    };
  },

  getNodes: () => {
    const state = get();
    return state.nodeIds.map((id) => ({
      id,
      position: state.nodePositions[id],
      state: state.nodeStates[id],
      data: state.nodeData[id],
    }));
  },

  getNodePosition: (id) => {
    const state = get();
    return state.nodePositions[id];
  },

  getNodeState: (id) => {
    const state = get();
    return state.nodeStates[id];
  },

  getNodeData: (id) => {
    const state = get();
    return state.nodeData[id];
  },

  updateNodeSize: (id, rect) => {
    set((state) => ({
      nodeSizes: {
        ...state.nodeSizes,
        [id]: rect,
      },
    }));
  },
});
