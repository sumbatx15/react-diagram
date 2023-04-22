import { merge, set } from "lodash-es";
import { useDiagram } from "../store/diagramStore";
import { ElementsSlice } from "../store/elementsSlice";
import {
  DOMRectLike,
  getBoundingClientRect,
  getHandleDimension,
  getUnscaledDOMRect,
} from "../store/utils";
function time(label: string, block: () => void) {
  console.time(label);
  const rers = block();
  console.timeEnd(label);
  return rers;
}

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
        acc.node[id] = rect;
      } else {
        acc[elementType].push({
          elementType,
          id,
          rect,
          nodeId,
        });
      }
      return acc;
    },
    {
      node: {} as Record<string, DOMRectLike>,
      handle: [] as {
        elementType: "handle";
        id: string;
        rect: DOMRectLike;
        nodeId: string;
      }[],
    }
  );

  const handleDimensions = rects.handle.reduce((acc, h) => {
    const nodeRect = rects.node[h.nodeId] || state.nodeUnscaledRects[h.nodeId];
    const dimensions = getHandleDimension(nodeRect, h.rect);
    set(acc, [h.nodeId, h.id], dimensions);
    return acc;
  }, {} as ElementsSlice["handleDimensions"]);
  console.timeEnd("generating rects");

  useDiagram.setState((state) => ({
    handleDimensions: merge(state.handleDimensions, handleDimensions),
    nodeUnscaledRects: merge(state.nodeUnscaledRects, rects.node),
  }));

  console.log("resizeObserver", entries.length, rects);
});
