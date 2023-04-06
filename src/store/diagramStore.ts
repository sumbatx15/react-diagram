import {
  Vector,
  NodeState,
  DiagramNode,
  EdgePosition,
  updateEdgePositionOnNodeMove,
} from "./utils";
import { create, StoreApi, UseBoundStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import uniqid from "uniqid";
import { shallow } from "zustand/shallow";
import { createDiagramStore } from ".";
import { createHandleElementId } from "../utils";

const createVector = (
  x: number = Math.random() * 500,
  y: number = Math.random() * 500
): Vector => ({ x, y });
const createNodeState = (): NodeState => ({
  selected: false,
  dragging: false,
  disabled: false,
});
const createNodeData = (): any => ({});

export const createNode = () => ({
  id: uniqid(),
  position: createVector(),
  data: createNodeData(),
  state: createNodeState(),
});

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  data: unknown;
}

export type { EdgePosition };
export type { DiagramNode };

export interface DiagramState {
  position: Vector;
  scale: number;
  updatePosition: (position: Vector) => void;
  updateScale: (scale: number) => void;

  elements: Record<
    string,
    {
      element: Element;
      size: DOMRectReadOnly;
    }
  >;

  updateElement: (id: string, element: Element, size: DOMRectReadOnly) => void;

  edges: Edge[];
  edgePositions: Record<string, EdgePosition>;
  updateEdgePosition: (id: string, position: EdgePosition) => void;
  addEdge: (edge: Omit<Edge, "id"> & Partial<Pick<Edge, "id">>) => void;
  addEdges: (edges: Edge[]) => void;

  userEdge: EdgePosition;
  isActiveEdge: boolean;
  setIsActiveEdge: (isActive: boolean) => void;

  updateEdge: (edge: Partial<EdgePosition>) => void;
  nodeIds: string[];
  nodePositions: Record<string, Vector>;
  nodeDatas: Record<string, unknown>;
  nodeStates: Record<string, NodeState>;

  nodeSizes: Record<string, DOMRectReadOnly>;
  updateNodeSize: (id: string, rect: DOMRectReadOnly) => void;

  addNode: (node?: DiagramNode) => void;
  addNodes: (nodes: DiagramNode[]) => void;

  updateNodePosition: (id: string, position: Vector) => void;
  nodes: () => DiagramNode[];
  getNode: (id: string) => DiagramNode | undefined;
}

export const createDiagramState = () =>
  create<DiagramState>((set, get) => ({
    position: createVector(),
    scale: 1,
    nodeIds: [],
    nodePositions: {},
    nodeDatas: {},
    nodeStates: {},
    nodes: () => {
      const { nodeIds, nodePositions, nodeDatas, nodeStates } = get();
      return nodeIds.map((id) => ({
        id,
        position: nodePositions[id],
        data: nodeDatas[id],
        state: nodeStates[id],
      }));
    },
    nodeSizes: {},
    elements: {},
    updateElement: (id, element, size) => {
      set((prev) => ({
        elements: {
          ...prev.elements,
          [id]: { element, size },
        },
      }));
    },
    updateNodeSize: (id, rect) => {
      set((prev) => ({
        nodeSizes: {
          ...prev.nodeSizes,
          [id]: rect,
        },
      }));
    },
    getNode: (id) => {
      return get()
        .nodes()
        .find((node) => node.id === id);
    },
    addNode: (node = createNode()) => {
      set((prev) => ({
        nodeIds: [...prev.nodeIds, node.id],
        nodePositions: {
          ...prev.nodePositions,
          [node.id]: node.position,
        },
        nodeDatas: {
          ...prev.nodeDatas,
          [node.id]: node.data,
        },
        nodeStates: {
          ...prev.nodeStates,
          [node.id]: node.state,
        },
      }));
    },
    addNodes: (nodes) => {
      set((prev) => {
        const nodeIds = nodes.map((node) => node.id);
        const nodePositions = nodes.reduce((acc, node) => {
          acc[node.id] = node.position;
          return acc;
        }, {} as Record<string, Vector>);
        const nodeDatas = nodes.reduce((acc, node) => {
          acc[node.id] = node.data;
          return acc;
        }, {} as Record<string, unknown>);
        const nodeStates = nodes.reduce((acc, node) => {
          acc[node.id] = node.state;
          return acc;
        }, {} as Record<string, NodeState>);
        return {
          nodeIds: [...prev.nodeIds, ...nodeIds],
          nodePositions: { ...prev.nodePositions, ...nodePositions },
          nodeDatas: { ...prev.nodeDatas, ...nodeDatas },
          nodeStates: { ...prev.nodeStates, ...nodeStates },
        };
      });
    },
    updateNodePosition: (id, position) => {
      set((prev) => ({
        nodePositions: {
          ...prev.nodePositions,
          [id]: position,
        },
      }));
    },
    userEdge: {
      start: createVector(),
      end: createVector(),
    },
    edges: [],
    edgePositions: {},
    updateEdgePosition: (id, position) => {
      set((prev) => ({
        edgePositions: {
          ...prev.edgePositions,
          [id]: {
            ...prev.edgePositions[id],
            ...position,
          },
        },
      }));
    },
    addEdge: (edge) => {
      set((prev) => ({
        edges: [
          ...prev.edges,
          {
            id: uniqid(),
            ...edge,
          },
        ],
      }));
    },
    addEdges: (edges) => {
      set((prev) => ({
        edges: [...prev.edges, ...edges],
      }));
    },
    isActiveEdge: false,
    setIsActiveEdge: (isActive) => {
      set((prev) => ({
        isActiveEdge: isActive,
      }));
    },
    updateEdge: (edge) => {
      set((prev) => ({
        userEdge: {
          ...prev.userEdge,
          ...edge,
        },
      }));
    },
    updatePosition: (position) => {
      set((prev) => ({
        position: position,
      }));
    },
    updateScale: (scale) => {
      set((prev) => ({
        scale: scale,
      }));
    },
  }));
export const useDiagram = createDiagramStore();

// @ts-ignore
window.useDiagram = useDiagram;

useDiagram.subscribe((state, prev) => {
  state.edges.forEach((edge) => {
    updateEdgePositionOnNodeMove(state, prev, edge);
  });
});

interface DiagramStates {
  diagram: Record<string, UseBoundStore<StoreApi<DiagramState>>>;
  createDiagram: (id: string) => void;
  getDiagram: (id: string) => UseBoundStore<StoreApi<DiagramState>> | undefined;
}

export const useDiagrams = create<DiagramStates, [["zustand/immer", never]]>(
  immer((set, get) => ({
    diagram: {},
    createDiagram: (id) => {
      set((state) => {
        state.diagram[id] = createDiagramState();
      });
    },
    getDiagram: (id) => {
      return get().diagram[id];
    },
  }))
);

export const getInDiagramPosition = ({ x, y }: Vector) => {
  const { position, scale } = useDiagram.getState().viewport;
  return {
    x: (x - position.x) / scale,
    y: (y - position.y) / scale,
  };
};

export const getCenterFromRect = (rect: DOMRect) => {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
};
