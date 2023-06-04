import { merge, set } from "lodash-es";
import { useDiagrams } from "../store";
import { ElementsSlice } from "../store/elementsSlice";
import {
  DOMRectLike,
  getHandleDimension,
  getHandlesDetails,
  getUnscaledNodeRect,
} from "../store/utils";
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
      target.getAttribute("data-renderer-id") ||
      target.getAttribute("data-node-id") ||
      target.getAttribute("data-id") ||
      "";

    const rect = getUnscaledNodeRect(nodeId, scale);

    if (rect) {
      acc[nodeId] = rect;
    }
    return acc;
  }, {} as Record<string, DOMRectLike>);

  const { handleDimensions, nodeUnscaledRects, handleRenderers } =
    Object.entries(nodeRects).reduce(
      (acc, [rendererId, nodeRect]) => {
        set(acc, ["nodeUnscaledRects", rendererId], nodeRect);

        const { handleRects, handleRenderers } = getHandlesDetails(
          rendererId,
          scale
        );
        acc.handleRenderers = merge(acc.handleRenderers, handleRenderers);
        handleRects.forEach((handle) => {
          console.log("handle:", handle);
          const dimensions = getHandleDimension(nodeRect, handle.rect);
          set(
            acc,
            ["handleDimensions", handle.nodeId, handle.handleId],
            dimensions
          );
        });

        return acc;
      },
      {} as {
        nodeUnscaledRects: ElementsSlice["nodeUnscaledRects"];
        handleDimensions: ElementsSlice["handleDimensions"];
        handleRenderers: ElementsSlice["handleRenderers"];
      }
    );
  useDiagram.setState((state) => ({
    handleDimensions: merge(state.handleDimensions, handleDimensions),
    nodeUnscaledRects: merge(state.nodeUnscaledRects, nodeUnscaledRects),
    handleRenderers: merge(state.handleRenderers, handleRenderers),
  }));

  console.log({
    handleDimensions: useDiagram.getState().handleDimensions,
    nodeUnscaledRects: useDiagram.getState().nodeUnscaledRects,
    handleRenderers: useDiagram.getState().handleRenderers,
  });
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
