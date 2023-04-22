import { keyBy, mapValues } from "lodash-es";
import { StoreSlice } from ".";
import { DiagramNode, NodeState, Vector } from "./utils";

export type NodesSlice = {
  nodeIds: string[];
  nodePositions: Record<string, Vector>;
  nodeData: Record<string, unknown>;
  nodeStates: Record<string, NodeState>;
  updateNodePosition: (id: string, position: Vector) => void;
  setSelectedNodes: (ids: string[]) => void;
  addNode: (node: DiagramNode) => void;
  addNodes: (nodes: DiagramNode[]) => void;
  setNodes: (nodes: DiagramNode[]) => void;
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
  setSelectedNodes: (ids) => {
    set((state) => ({
      nodeStates: {
        ...state.nodeStates,
        ...state.nodeIds.reduce(
          (acc, id) => ({
            ...acc,
            [id]: {
              ...state.nodeStates[id],
              selected: ids.includes(id),
            },
          }),
          {}
        ),
      },
    }));
  },
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

  addNodes: (nodes) => {
    set((state) => ({
      nodeIds: [...state.nodeIds, ...nodes.map((node) => node.id)],
      nodePositions: {
        ...state.nodePositions,
        ...nodes.reduce(
          (acc, node) => ({
            ...acc,
            [node.id]: node.position,
          }),
          {}
        ),
      },
      nodeData: {
        ...state.nodeData,
        ...nodes.reduce(
          (acc, node) => ({
            ...acc,
            [node.id]: node.data,
          }),
          {}
        ),
      },
      nodeStates: {
        ...state.nodeStates,
        ...nodes.reduce(
          (acc, node) => ({
            ...acc,
            [node.id]: node.state,
          }),
          {}
        ),
      },
    }));
  },

  setNodes: (nodes) => {
    const nodesById = keyBy(nodes, "id");

    set(() => ({
      nodeIds: Object.keys(nodesById),
      nodePositions: mapValues(nodesById, (node) => node.position),
      nodeData: mapValues(nodesById, (node) => node.data),
      nodeStates: mapValues(nodesById, (node) => node.state),
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
