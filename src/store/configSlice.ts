import { StoreSlice } from ".";
import { DiagramEdge, IEdge } from "./diagramStore";
import {
  createEdgePosition,
  createZeroStartEndPosition,
  StartEndPosition,
} from "./utils";

export type ConfigSlice = {
  onConnection: ((edge: IEdge) => void) | null;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createConfigSlice: StoreSlice<ConfigSlice> = (set, get) => ({
  onConnection: null,
  elevateEdgeOnSelection: true,
});
