import { merge, set } from "lodash-es";
import { useDiagram } from "../store/diagramStore";
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
  const state = useDiagram.getState();
  const scale = state.viewport.scale;

  const rects = entries.reduce(
    (acc, entry) => {
      const elementType = entry.target.getAttribute("data-element-type") as
        | "node"
        | "handle";
      const id = entry.target.getAttribute("data-id") as string;
      const nodeId = entry.target.getAttribute("data-node-id") as string;
      const rect = getUnscaledDOMRect(
        entry.target.getBoundingClientRect(),
        scale
      );

      if (elementType === "node") {
        set(acc, id, { rect });
      } else {
        set(acc, [nodeId, "handles", id], rect);
      }
      return acc;
    },
    {} as Record<
      string,
      {
        rect?: DOMRectLike;
        handles?: Record<string, DOMRectLike>;
      }
    >
  );

  const { handleDimensions, nodeUnscaledRects } = Object.entries(rects).reduce(
    (acc, [nodeId, { rect, handles }]) => {
      const nodeRect = rect || getUnscaledNodeRect(nodeId, scale);
      if (!nodeRect) return acc;
      const handleRects = handles || getUnscaledHandlesRects(nodeId, scale);
      if (!handleRects) return acc;

      set(acc, ["nodeUnscaledRects", nodeId], nodeRect);
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
  console.timeEnd("generating rects");

  useDiagram.setState((state) => ({
    handleDimensions: merge(state.handleDimensions, handleDimensions),
    nodeUnscaledRects: merge(state.nodeUnscaledRects, nodeUnscaledRects),
  }));
});
