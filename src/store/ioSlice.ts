import { StoreSlice } from ".";
import { createStoreNodes } from "../utils/nodes";
import { DiagramEdge } from "./diagramStore";
import {
  createEdgePosition,
  createZeroStartEndPosition,
  DiagramNode,
  StartEndPosition,
} from "./utils";
import { ViewportSlice } from "./viewportSlice";

interface Project {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewport: Pick<ViewportSlice["viewport"], "scale" | "position">;
}
export type IOSlice = {
  export: () => Project;
  import: (project: Project) => void;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createIOSlice: StoreSlice<IOSlice> = (set, get) => ({
  export: () => {
    const state = get();
    return {
      nodes: state.getNodes(),
      edges: state.edges,
      viewport: {
        scale: state.viewport.scale,
        position: state.viewport.position,
      },
    };
  },
  import: (project) => {
    set(() => ({
      ...createStoreNodes(project.nodes),
      edges: project.edges,
    }));
  },
});
