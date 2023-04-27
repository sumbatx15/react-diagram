import uniqid from "uniqid";
import { StoreApi, UseBoundStore } from "zustand";
import { createDiagramStore } from ".";
import { DiagramNode, StartEndPosition, NodeState, Vector } from "./utils";

const createVector = (
  x: number = Math.random() * 500,
  y: number = Math.random() * 500
): Vector => ({ x, y });

const createNodeState = (): NodeState => ({
  selected: false,
  dragging: false,
  disabled: false,
});
const createNodeData = (): any => "";

export const createNode = (): DiagramNode => ({
  id: uniqid(),
  position: createVector(),
  data: createNodeData(),
  state: createNodeState(),
  type: "custom",
});

export interface DiagramEdge {
  id: string;
  type?: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  data: unknown;
  animated?: boolean;
}

export type { StartEndPosition as EdgePosition };
export type { DiagramNode };

export const useDiagram = createDiagramStore();
// useDiagram.subscribe(
//   (state) => {},
//   (state, prev) => {},
//   { equalityFn(a, b) {

//   } }
// );

// @ts-ignore
window.useDiagram = useDiagram;

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
