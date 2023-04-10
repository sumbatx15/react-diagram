import { SpringValues } from "@react-spring/web";
import { MutableRefObject } from "react";
import { shallow } from "zustand/shallow";
import { StoreState } from ".";
import { createHandleElementId } from "../utils";
import {
  Edge,
  getCenterFromRect,
  getInDiagramPosition,
  useDiagram,
} from "./diagramStore";
import { ILayer } from "./layersStore";

export const isConstrainProportions = (type: ILayer["type"]) => {
  return ["image", "icon"].includes(type);
};
export const createEdge = (edge: Omit<Edge, "id">) => {
  return {
    id: `${edge.source}-${edge.sourceHandle}-${edge.target}-${edge.targetHandle}`,
    ...edge,
  };
};
export const getUpdatedLayer = (
  ref: MutableRefObject<HTMLDivElement | null>,
  values: SpringValues<{
    x: number;
    y: number;
    scale: number;
    rotate: number;
  }>
) => {
  return {
    width: ref.current?.offsetWidth || 0,
    height: ref.current?.offsetHeight || 0,
    rotate: values.rotate.get(),
    scale: values.scale.get(),
    x: values.x.get(),
    y: values.y.get(),
  };
};

export type Vector = {
  x: number;
  y: number;
};

export interface NodeState {
  selected: boolean;
  dragging: boolean;
  disabled: boolean;
}

export interface DiagramNode {
  id: string;
  type?: string;
  position: Vector;
  data: unknown;
  state: NodeState;
}

export interface EdgePosition {
  start: Vector;
  end: Vector;
}

export const createZeroEdgePosition = () => {
  return {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  };
};
export const getSourceHandleRect = (state: StoreState, edge: Edge) => {
  return state.elements[
    createHandleElementId(edge.source, edge.sourceHandle)
  ].getBoundingClientRect();
};

export const getTargetHandleRect = (state: StoreState, edge: Edge) => {
  return state.elements[
    createHandleElementId(edge.target, edge.targetHandle)
  ].getBoundingClientRect();
};

export const createEdgePosition = (state: StoreState, edge: Edge) => {
  const sourceHandleRect = getSourceHandleRect(state, edge);
  const targetHandleRect = getTargetHandleRect(state, edge);

  return createEdgePositionFromRects(sourceHandleRect, targetHandleRect);
};

export const createEdgePositionFromRects = (
  sourceHandleRect: DOMRect,
  targetHandleRect: DOMRect
) => {
  return {
    start: getInDiagramPosition(getCenterFromRect(sourceHandleRect)),
    end: getInDiagramPosition(getCenterFromRect(targetHandleRect)),
  };
};

const areAllElementsVisible = (state: StoreState, edge: Edge) => {
  return (
    state.elements[edge.source] &&
    state.elements[edge.target] &&
    state.elements[createHandleElementId(edge.source, edge.sourceHandle)] &&
    state.elements[createHandleElementId(edge.target, edge.targetHandle)]
  );
};

const hasChanges = (state: StoreState, prevState: StoreState, edge: Edge) => {
  return (
    !shallow(
      state.nodePositions[edge.source],
      prevState.nodePositions[edge.source]
    ) ||
    !shallow(
      state.nodePositions[edge.target],
      prevState.nodePositions[edge.target]
    ) ||
    !shallow(
      state.elementRects[edge.source],
      prevState.elementRects[edge.source]
    ) ||
    !shallow(
      state.elementRects[edge.target],
      prevState.elementRects[edge.target]
    ) ||
    !shallow(
      state.elementRects[createHandleElementId(edge.source, edge.sourceHandle)],
      prevState.elementRects[
        createHandleElementId(edge.source, edge.sourceHandle)
      ]
    ) ||
    !shallow(
      state.elementRects[createHandleElementId(edge.target, edge.targetHandle)],
      prevState.elementRects[
        createHandleElementId(edge.target, edge.targetHandle)
      ]
    )
  );
};

export const updateEdgePositionOnNodeMove = (state: StoreState, edge: Edge) => {
  if (!areAllElementsVisible(state, edge)) return;
  // const changed = hasChanges(state, prev, edge);
  // console.log("changed:", changed);
  // if (!hasChanges(state, prev, edge)) return;

  setTimeout(() => {
    useDiagram
      .getState()
      .updateEdgePosition(edge.id, createEdgePosition(state, edge));
  }, 10);
};

export type DOMRectLike = Pick<
  DOMRect,
  "x" | "y" | "width" | "height" | "top" | "left" | "bottom" | "right"
>;

export const getUnscaledDOMRect = (
  rect: DOMRectLike,
  scale: number
): DOMRectLike => {
  if (scale === 1) return rect;
  return {
    x: rect.x / scale,
    y: rect.y / scale,
    width: rect.width / scale,
    height: rect.height / scale,
    top: rect.top / scale,
    left: rect.left / scale,
    bottom: rect.bottom / scale,
    right: rect.right / scale,
  };
};

interface GetRelativePositionOptions {
  containerRect: DOMRectLike;
  elementRect: DOMRectLike;
}

export const getRelativePosition = ({
  containerRect,
  elementRect,
}: GetRelativePositionOptions) => {
  return {
    x: elementRect.x - containerRect.x,
    y: elementRect.y - containerRect.y,
  };
};

export const getUnscaledRelativePosition = ({
  containerRect,
  elementRect,
  scale,
}: GetRelativePositionOptions & { scale: number }) => {
  return getRelativePosition({
    containerRect: getUnscaledDOMRect(containerRect, scale),
    elementRect: getUnscaledDOMRect(elementRect, scale),
  });
};
