import { create, StoreApi, UseBoundStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { PosterizerOptions } from "potrace";
import uniqid from "uniqid";

interface DiagramState {
  position: [number, number];
  scale: number;
  updatePosition: (position: [number, number]) => void;
  updateScale: (scale: number) => void;
}

export const createDiagramState = () =>
  create<DiagramState, [["zustand/immer", never]]>(
    immer((set, get) => ({
      position: [0, 0],
      scale: 0.1,
      updatePosition: (position) => {
        set((state) => {
          state.position = position;
        });
      },
      updateScale: (scale) => {
        set((state) => {
          state.scale = scale;
        });
      },
    }))
  );
export const useDiagram = createDiagramState();

interface DiagramStates {
  diagram: Record<string, UseBoundStore<StoreApi<DiagramState>>>;
  createDiagram: (id: string) => void;
  getDiagram: (id: string) => UseBoundStore<StoreApi<DiagramState>> | undefined;
}

export const useDiagrams = create<DiagramStates, [["zustand/immer", never]]>(
  immer((set, get) => ({
    diagram: {},
    createDiagram: (id) => {
      set((state) => {
        state.diagram[id] = createDiagramState();
      });
    },
    getDiagram: (id) => {
      return get().diagram[id];
    },
  }))
);
