import { StoreSlice } from ".";
import { DiagramEdge, IEdge } from "./diagramStore";
import {
  createEdgePosition,
  createZeroStartEndPosition,
  StartEndPosition,
} from "./utils";

export type EventsSlice = {
  onConnection: ((edge: IEdge) => void) | null;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const createEventsSlice: StoreSlice<EventsSlice> = (set, get) => ({
  onConnection: null,
});
