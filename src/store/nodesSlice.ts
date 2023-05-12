import {
  flatMap,
  keyBy,
  keys,
  map,
  mapValues,
  merge,
  omit,
  omitBy,
  pick,
  pickBy,
  without,
} from "lodash-es";
import { StoreSlice } from ".";
import { getNodeEdges } from "../utils/nodes";
import { DiagramNode, NodeState, Vector } from "./utils";

export type NodesSlice = {
  nodeIds: string[];
  nodePositions: Record<string, Vector>;
  nodeData: Record<string, any>;
  nodeStates: Record<string, NodeState>;
  nodeTypes: Record<string, string>;
  deleteSelectedNodes: () => void;
  updateNodeState: (id: string, state: NodeState) => void;
  updateNodeData: <T = any>(id: string, data: T) => void;
  updateNodePosition: (id: string, position: Vector) => void;
  updateSelectedNodesPositions: (delta: Vector) => void;
  selectNode: (id: string) => void;
  deselectNode: (id: string) => void;
  selectNodes: (ids: string[]) => void;
  deselectNodes: () => void;
  getSelectedNodeIds: () => string[];
  addNode: (node: DiagramNode) => void;
  addNodes: (nodes: DiagramNode[]) => void;
  setNodes: (nodes: DiagramNode[]) => void;
  getNode: (id: string) => DiagramNode | undefined;
  getNodePosition: (id: string) => Vector | undefined;
  getNodeState: (id: string) => NodeState | undefined;
  getNodeData: (id: string) => unknown | undefined;
  getNodes: () => DiagramNode[];
  deleteNode: (id: string) => void;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createNodesSlice: StoreSlice<NodesSlice> = (set, get) => ({
  nodeIds: [],
  nodePositions: {},
  nodeData: {},
  nodeStates: {},
  nodeTypes: {},
  deleteNode: (id) => {
    const state = get();
    const edges = getNodeEdges(id, state.edges);
    state.deleteEdges(edges.map((edge) => edge.id));

    set((state) => ({
      nodeIds: without(state.nodeIds, id),
      nodePositions: omit(state.nodePositions, id),
      nodeData: omit(state.nodeData, id),
      nodeStates: omit(state.nodeStates, id),
      nodeTypes: omit(state.nodeTypes, id),
    }));
  },
  deleteSelectedNodes: () => {
    const state = get();
    const selectedNodeIds = keys(pickBy(state.nodeStates, { selected: true }));

    const edgesToRemove = flatMap(selectedNodeIds, (id) =>
      getNodeEdges(id, state.edges)
    );

    state.deleteEdges(map(edgesToRemove, "id"));

    set((state) => ({
      nodeIds: without(state.nodeIds, ...selectedNodeIds),
      nodePositions: omit(state.nodePositions, selectedNodeIds),
      nodeData: omit(state.nodeData, selectedNodeIds),
      nodeStates: omit(state.nodeStates, selectedNodeIds),
      nodeTypes: omit(state.nodeTypes, selectedNodeIds),
    }));
  },

  updateNodeState: (id, nodeState) => {
    set((state) => ({
      nodeStates: merge({}, state.nodeStates, {
        [id]: nodeState,
      }),
    }));
  },

  updateNodeData: (id, data) => {
    set((state) => ({
      nodeData: {
        ...state.nodeData,
        [id]: data,
      },
    }));
  },

  selectNode: (id) => {
    set((state) => ({
      nodeStates: {
        ...state.nodeStates,
        [id]: {
          ...state.nodeStates[id],
          selected: true,
        },
      },
    }));
  },

  deselectNode: (id) => {
    set((state) => ({
      nodeStates: {
        ...state.nodeStates,
        [id]: {
          ...state.nodeStates[id],
          selected: false,
        },
      },
    }));
  },

  selectNodes: (ids) => {
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

  deselectNodes: () => {
    set((state) => ({
      nodeStates: {
        ...state.nodeStates,
        ...state.nodeIds.reduce(
          (acc, id) => ({
            ...acc,
            [id]: {
              ...state.nodeStates[id],
              selected: false,
            },
          }),
          {}
        ),
      },
    }));
  },
  getSelectedNodeIds: () => {
    const state = get();
    return state.nodeIds.filter(
      (id) => state.nodeStates[id]?.selected ?? false
    );
  },
  addNode: (node) => {
    set((state) => ({
      nodeIds: [...state.nodeIds, node.id],
      nodePositions: {
        ...state.nodePositions,
        [node.id]: node.position,
      },
      ...(node.type && {
        nodeTypes: {
          ...state.nodeTypes,
          [node.id]: node.type,
        },
      }),
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

    set({
      nodeIds: Object.keys(nodesById),
      nodePositions: mapValues(nodesById, (node) => node.position),
      nodeData: mapValues(nodesById, (node) => node.data),
      nodeStates: mapValues(nodesById, (node) => node.state),
      nodeTypes: mapValues(nodesById, (node) => node.type || "default"),
    });
  },

  updateNodePosition: (id, position) => {
    set((state) => ({
      nodePositions: {
        ...state.nodePositions,
        [id]: position,
      },
    }));
  },

  updateSelectedNodesPositions: (delta) => {
    set((state) => {
      const selectedNodes = pickBy(
        state.nodeStates,
        (nodeState) => nodeState.selected
      );

      const updatedPositions = mapValues(selectedNodes, (nodeState, id) => ({
        x: state.nodePositions[id].x + delta.x,
        y: state.nodePositions[id].y + delta.y,
      }));

      return {
        nodePositions: {
          ...state.nodePositions,
          ...updatedPositions,
        },
      };
    });
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
});
