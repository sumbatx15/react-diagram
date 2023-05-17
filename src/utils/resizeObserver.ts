import { merge, set } from "lodash-es";
import { StoreState, useDiagrams } from "../store";
import { ElementsSlice } from "../store/elementsSlice";
import {
  DOMRectLike,
  getHandleDimension,
  getUnscaledHandlesRects,
  getUnscaledNodeRect,
} from "../store/utils";
import { ViewportSlice } from "../store/viewportSlice";
import { ViewportProps } from "../store/viewportSlice";

export const resizeObserver = new ResizeObserver(async (entries) => {
  const diagramId =
    entries
      .find((entry) => entry.target.hasAttribute("data-diagram-id"))
      ?.target.getAttribute("data-diagram-id") || "";
  const useDiagram = useDiagrams.getState().diagrams[diagramId];

  const state = useDiagram.getState();
  const scale = state.viewport.scale;

  const nodeRects = entries.reduce((acc, { target }) => {
    const nodeId =
      target.getAttribute("data-node-id") ||
      target.getAttribute("data-id") ||
      "";
    const rect = getUnscaledNodeRect(nodeId, scale);
    rect && (acc[nodeId] = rect);
    return acc;
  }, {} as Record<string, DOMRectLike>);

  const { handleDimensions, nodeUnscaledRects } = Object.entries(
    nodeRects
  ).reduce(
    (acc, [nodeId, nodeRect]) => {
      set(acc, ["nodeUnscaledRects", nodeId], nodeRect);

      const handleRects = getUnscaledHandlesRects(nodeId, scale);
      if (!handleRects) return acc;
      Object.entries(handleRects).forEach(([handleId, handleRect]) => {
        const dimensions = getHandleDimension(nodeRect, handleRect);
        set(acc, ["handleDimensions", nodeId, handleId], dimensions);
      });

      return acc;
    },
    {} as {
      nodeUnscaledRects: ElementsSlice["nodeUnscaledRects"];
      handleDimensions: ElementsSlice["handleDimensions"];
    }
  );

  useDiagram.setState((state) => ({
    handleDimensions: merge(state.handleDimensions, handleDimensions),
    nodeUnscaledRects: merge(state.nodeUnscaledRects, nodeUnscaledRects),
  }));
});

export const updateViewport = ({
  diagramId,
  height,
  offsetLeft,
  offsetTop,
  width,
}: { diagramId: string } & Pick<
  ViewportProps,
  "width" | "height" | "offsetLeft" | "offsetTop"
>) => {
  return useDiagrams
    .getState()
    .diagrams[diagramId]?.getState()
    .viewport.updateSize(width, height, offsetTop, offsetLeft);
};

export const getViewport = (element: HTMLElement) => {
  const diagramId =
    element.getAttribute("data-diagram-id") ||
    element.closest("[data-diagram-id]")?.getAttribute("data-diagram-id") ||
    "";

  const rect = element.getBoundingClientRect();
  return {
    diagramId,
    width: element.clientWidth,
    height: element.clientHeight,
    offsetLeft: rect.left,
    offsetTop: rect.top,
  };
};

export const handleViewportChange = (element: HTMLElement) => {
  const viewport = getViewport(element);
  updateViewport(viewport);
};

export const containerResizeObserver = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    handleViewportChange(entry.target as HTMLElement);
  });
});
