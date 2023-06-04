import { StoreSlice } from ".";
import { DiagramEdge, Connection } from "./diagramStore";
import {
  createEdgePosition,
  createZeroStartEndPosition,
  StartEndPosition,
} from "./utils";

export type ConfigSlice = {
  onConnect: ((edge: Connection) => void) | null;
  onNodesDeleted?: ((nodes: string[]) => void) | null;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createConfigSlice: StoreSlice<ConfigSlice> = (set, get) => ({
  onConnect: null,
  elevateEdgeOnSelection: true,
  onNodesDeleted: null,
});
