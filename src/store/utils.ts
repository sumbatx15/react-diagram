import { SpringValues } from "@react-spring/web";
import { MutableRefObject } from "react";
import { StoreState } from ".";
import { useGetDiagramStore } from "../components/Diagram/WrappedDiagram";
import {
  calcBoxXY,
  calculateWidthAndHeight,
} from "../components/Selection/Selection";
import { DiagramEdge } from "./diagramStore";
import { ViewportProps } from "./viewportSlice";

export const createEdge = (edge: Omit<DiagramEdge, "id">) => {
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

export interface DiagramNode<T = any> {
  id: string;
  type?: string;
  position: Vector;
  data: T;
  state: NodeState;
}

export interface StartEndPosition {
  start: Vector;
  end: Vector;
}

export const createZeroStartEndPosition = () => {
  return {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  };
};

export const createZeroVector = () => {
  return { x: 0, y: 0 };
};

export const createEdgePosition = (state: StoreState, edge: DiagramEdge) => {
  const start =
    state.getHandleCenter(edge.source, edge.sourceHandle) || createZeroVector();
  const end =
    state.getHandleCenter(edge.target, edge.targetHandle) || createZeroVector();
  return {
    start,
    end,
  };
};

export type DOMRectLike = Pick<
  DOMRect,
  "x" | "y" | "width" | "height" | "top" | "left" | "bottom" | "right"
>;

export const getBoundingClientRect = (element: HTMLElement) => {
  // return singletonIntersectionObserver.observe(element);
  return new Promise((resolve) => {
    new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        resolve(entry.boundingClientRect);
      }
      observer.disconnect();
    }).observe(element);
  });
};

export const convertToDOMRectLike = (rect: DOMRectLike): DOMRectLike => {
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right,
  };
};

export const getUnscaledDOMRect = (
  rect: DOMRectLike,
  scale: number
): DOMRectLike => {
  if (scale === 1) return convertToDOMRectLike(rect);
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
interface GetHandleCenterOptions
  extends Pick<ViewportProps, "offsetLeft" | "offsetTop"> {
  nodePosition: Vector;
  handleRelativeCenterOffset: Vector;
}
export const getHandleCenter = ({
  nodePosition,
  handleRelativeCenterOffset,
  offsetLeft,
  offsetTop,
}: GetHandleCenterOptions) => {
  return {
    x: nodePosition.x + handleRelativeCenterOffset.x,
    y: nodePosition.y + handleRelativeCenterOffset.y,
  };
};

export interface HandleDimensions {
  relativePosition: Vector;
  relativeCenterOffset: Vector;
}

export const getHandleDimension = (
  unscaledNodeRect: DOMRectLike,
  unscaledHandleRect: DOMRectLike
) => {
  const relativePosition = getRelativePosition({
    containerRect: unscaledNodeRect,
    elementRect: unscaledHandleRect,
  });

  return {
    relativePosition: relativePosition,
    relativeCenterOffset: {
      x: relativePosition.x + unscaledHandleRect.width / 2,
      y: relativePosition.y + unscaledHandleRect.height / 2,
    },
  };
};

export const getParentNodeElement = (handleElement: HTMLElement) => {
  return handleElement.closest('[data-type="node"]') as HTMLElement;
};

export const getNodesInsideRect = (diagramState: StoreState) => {
  const { start, end } = diagramState.viewport.selectionBoxPosition;
  const { x, y } = calcBoxXY(start, end);
  const { width, height } = calculateWidthAndHeight(start, end);

  const selectionBox = {
    x,
    y,
    width,
    height,
  };

  const threshold = 0.2; // 20%

  return diagramState.nodeIds.filter((id) => {
    const position = diagramState.nodePositions[id];
    const rect = diagramState.nodeUnscaledRects[id];
    if (!position || !rect) return false;

    const nodeBox = {
      x: position.x,
      y: position.y,
      width: rect.width,
      height: rect.height,
    };

    const xOverlap = Math.max(
      0,
      Math.min(selectionBox.x + selectionBox.width, nodeBox.x + nodeBox.width) -
        Math.max(selectionBox.x, nodeBox.x)
    );
    const yOverlap = Math.max(
      0,
      Math.min(
        selectionBox.y + selectionBox.height,
        nodeBox.y + nodeBox.height
      ) - Math.max(selectionBox.y, nodeBox.y)
    );

    const overlapArea = xOverlap * yOverlap;
    const nodeArea = nodeBox.width * nodeBox.height;
    const overlapPercentage = overlapArea / nodeArea;

    return overlapPercentage >= threshold;
  });
};

export const getUnscaledNodeRect = (
  nodeId: string,
  scale: number
): DOMRectLike | null => {
  const element = document.querySelector(
    `[data-id="${nodeId}"][data-element-type="node"]`
  );
  if (!element) return null;
  return getUnscaledDOMRect(element.getBoundingClientRect(), scale);
};

export const getUnscaledHandlesRects = (
  nodeId: string,
  scale: number
): Record<string, DOMRectLike> => {
  const elements = Array.from(
    document.querySelectorAll(
      `[data-node-id="${nodeId}"][data-element-type="handle"]`
    )
  ) as HTMLElement[];
  if (!elements) return {};
  return elements.reduce((acc, element) => {
    return {
      ...acc,
      [element.dataset.id as string]: getUnscaledDOMRect(
        element.getBoundingClientRect(),
        scale
      ),
    };
  }, {});
};
