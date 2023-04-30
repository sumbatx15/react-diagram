import uniqid from "uniqid";
import { useGetDiagramStore } from "../components/Diagram/WrappedDiagram";
import { DiagramNode, NodeState, StartEndPosition, Vector } from "./utils";
import { ViewportSlice } from "./viewportSlice";

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
  type: "default",
});

export interface IEdge {
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}
export interface DiagramEdge extends IEdge {
  id: string;
  type?: string;
  data: unknown;
  animated?: boolean;
}

export type { StartEndPosition as EdgePosition };
export type { DiagramNode };

export const getInDiagramPosition = (
  { x, y }: Vector,
  viewport: Pick<
    ViewportSlice["viewport"],
    "position" | "scale" | "offsetLeft" | "offsetTop"
  >
) => {
  const { position, scale, offsetLeft, offsetTop } = viewport;
  return {
    x: (x - position.x - offsetLeft) / scale,
    y: (y - position.y - offsetTop) / scale,
  };
};

export const getCenterFromRect = (rect: DOMRect) => {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
};
