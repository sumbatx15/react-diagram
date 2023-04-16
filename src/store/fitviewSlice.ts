import { StoreSlice } from ".";
import { Vector } from "./utils";

export type FitViewSlice = {
  fitView: () => void;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createFitViewSlice: StoreSlice<FitViewSlice> = (set, get) => ({
  fitView: (padding: Vector = { x: 100, y: 100 }) => {
    const nodePositions = get().nodePositions;
    const nodeUnscaledRects = get().nodeUnscaledRects;
    const viewport = get().viewport;

    const nodes = Object.entries(nodePositions).map(([id, position]) => {
      const rect = nodeUnscaledRects[id];
      return {
        x: position.x,
        y: position.y,
        width: rect.width,
        height: rect.height,
      };
    });

    const { minX, minY, maxX, maxY } = findBoundingBox(nodes);

    // Add padding to the bounding box dimensions
    const bboxWidth = maxX - minX + padding.x;
    const bboxHeight = maxY - minY + padding.y;

    // Calculate the center of the bounding box
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Calculate the scale factor
    const scaleX = viewport.width / bboxWidth;
    const scaleY = viewport.height / bboxHeight;
    const scale = Math.min(scaleX, scaleY);

    // Calculate the offset of the viewport
    const offsetX = -centerX * scale + viewport.width / 2;
    const offsetY = -centerY * scale + viewport.height / 2;

    set({
      viewport: {
        ...viewport,
        scale,
        position: { x: offsetX, y: offsetY },
      },
    });
  },
});
function findBoundingBox(
  nodes: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[]
) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const node of nodes) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  }

  return { minX, minY, maxX, maxY };
}
