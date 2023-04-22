import { SpringValues } from "@react-spring/web";
import { merge } from "lodash-es";
import { MutableRefObject } from "react";
import { createSelector } from "reselect";
import { shallow } from "zustand/shallow";
import { StoreState } from ".";
import { createHandleElementId } from "../utils";
import { singletonIntersectionObserver } from "../utils/SingletonIntersectionObserver";
import {
  Edge,
  getCenterFromRect,
  getInDiagramPosition,
  useDiagram,
} from "./diagramStore";
import { ElementsSlice } from "./elementsSlice";
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

export const createEdgePosition = (state: StoreState, edge: Edge) => {
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

export const getUnscaledClientBoundingRect = async (
  element: HTMLElement,
  viewportScale: number
) => {
  return getUnscaledDOMRect(
    await getBoundingClientRect(element),
    viewportScale
  );
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
interface GetHandleCenterOptions {
  nodePosition: Vector;
  handleRelativeCenterOffset: Vector;
}
export const getHandleCenter = ({
  nodePosition,
  handleRelativeCenterOffset,
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

export const getUnscaledRectsForHandles = async (
  handleElements: Record<string, HTMLElement>,
  scale: number
): Promise<Record<string, DOMRectLike>> => {
  const unscaledRects: Record<string, DOMRectLike> = {};

  for (const [handleId, el] of Object.entries(handleElements)) {
    const rect = getUnscaledDOMRect(await getBoundingClientRect(el), scale);
    unscaledRects[handleId] = rect;
  }

  return unscaledRects;
};

export const generateHandleDimensions = async ({
  nodeUnscaledRects,
  handleElements,
  scale,
}: Pick<ElementsSlice, "nodeUnscaledRects" | "handleElements"> & {
  scale: number;
}) => {
  const result: Pick<
    ElementsSlice,
    "handleUnscaledRects" | "handleDimensions"
  > = {
    handleUnscaledRects: {},
    handleDimensions: {},
  };

  const promises = [];

  for (const [nodeId, nodeRect] of Object.entries(nodeUnscaledRects)) {
    const nodeHandleElements = handleElements[nodeId];
    if (!nodeHandleElements) continue;

    promises.push(
      getUnscaledRectsForHandles(nodeHandleElements, scale).then(
        (handleUnscaledRects) => {
          result.handleUnscaledRects = merge(result.handleUnscaledRects, {
            [nodeId]: handleUnscaledRects,
          });

          result.handleDimensions = merge(result.handleDimensions, {
            [nodeId]: Object.entries(handleUnscaledRects).reduce(
              (acc, [handleId, handleRect]) => {
                return {
                  ...acc,
                  [handleId]: getHandleDimension(nodeRect, handleRect),
                };
              },
              {}
            ),
          });
        }
      )
    );
  }

  await Promise.all(promises);

  return result;
};
export const generateHandleDimensionsOnHandlesResize = ({
  nodeUnscaledRects,
  handleUnscaledRects,
}: Pick<ElementsSlice, "nodeUnscaledRects" | "handleUnscaledRects">): Record<
  string,
  Record<string, HandleDimensions>
> => {
  return Object.entries(nodeUnscaledRects).reduce((acc, [nodeId, nodeRect]) => {
    const nodeHandleRects = handleUnscaledRects[nodeId];
    if (!nodeHandleRects) return acc;
    return merge(acc, {
      [nodeId]: Object.entries(nodeHandleRects).reduce(
        (acc, [handleId, handleRect]) => {
          return merge(acc, {
            [handleId]: getHandleDimension(nodeRect, handleRect),
          });
        },
        {}
      ),
    });
  }, {});
};

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

interface NodeRectSelectorParams {
  handleElement: HTMLElement;
  scale: number;
}

const nodeRectSelector = createSelector(
  (state: NodeRectSelectorParams) => state.handleElement,
  (state: NodeRectSelectorParams) => state.scale,
  (handleElement, scale) => {
    const nodeElement = handleElement.closest(
      '[data-type="node"]'
    ) as HTMLElement;
    return getUnscaledClientBoundingRect(nodeElement, scale);
  }
);

export const getParentNodeElement = (handleElement: HTMLElement) => {
  return handleElement.closest('[data-type="node"]') as HTMLElement;
};

export const getHandlePositions = async (
  handleElement: HTMLElement,
  viewportScale: number
) => {
  const nodeElement = getParentNodeElement(handleElement);

  const [nodeRect, handleRect] = await Promise.all([
    getUnscaledClientBoundingRect(nodeElement, viewportScale),
    getUnscaledClientBoundingRect(handleElement, viewportScale),
  ]);

  return {
    nodeRect,
    handleRect,
    handleDimensions: getHandleDimension(nodeRect, handleRect),
  };
};
