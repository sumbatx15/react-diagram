import { merge, set } from "lodash-es";
import { useGetDiagramStore } from "../components/Diagram/WrappedDiagram";
import { useDiagrams } from "../store";
import { ElementsSlice } from "../store/elementsSlice";
import {
  DOMRectLike,
  getHandleDimension,
  getUnscaledDOMRect,
  getUnscaledHandlesRects,
  getUnscaledNodeRect,
} from "../store/utils";

export const resizeObserver = new ResizeObserver(async (entries) => {
  console.time("generating rects");
  console.log("start generating rects");
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
    acc[nodeId] ||= getUnscaledNodeRect(
      nodeId,
      scale
    ) /* getUnscaledDOMRect(target.getBoundingClientRect(), scale) */;
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
