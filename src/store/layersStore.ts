import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { PosterizerOptions } from "potrace";
import uniqid from "uniqid";

export const defaultPotraceOptions: PosterizerOptions = {
  threshold: 100,
  steps: 4,
};

export interface ILayer {
  id: string;
  type: "image" | "text" | "icon";
  width?: number;
  height?: number;
  rotate?: number;
  scale?: number;
  x?: number;
  y?: number;
  zIndex?: number;
  inverted?: boolean;
  content?: any;
  src: string;
  options?: PosterizerOptions;
}

export interface ImageLayer extends ILayer {
  type: "image";
  src: string;
  options?: PosterizerOptions;
}

export interface TextLayer extends ILayer {
  type: "text";
  strokeWidth?: number;
  content?: string;
}

export interface IconLayer extends ILayer {
  type: "icon";
  name: string;
}

export type AnyLayer = ImageLayer | TextLayer | IconLayer;

interface LayersState {
  layers: ILayer[];
  selectedLayerId?: string;
  isSelected: (id: string) => boolean;
  getLayer: (id: string) => ILayer | undefined;
  selectLayer: (id: string) => void;
  getSelectedLayer: () => ILayer | undefined;
  addLayer: (layer: ILayer) => void;
  removeLayer: (id: string) => void;
  removeSelectedLayer: () => void;
  updateLayer: (id: string, layer: Partial<Omit<ILayer, "id">>) => void;
}

export const useLayers = create<LayersState, [["zustand/immer", never]]>(
  immer((set, get) => ({
    layers: [],
    selectedLayerId: undefined,
    getSelectedLayer: () => get().getLayer(get().selectedLayerId || ""),
    getLayer: (id) => get().layers.find((layer) => layer.id === id),
    selectLayer: (id) =>
      set((state) => {
        state.selectedLayerId = id;
      }),
    isSelected: (id) => id === get().selectedLayerId,
    addLayer: (layer) =>
      set((state) => {
        state.layers.push(layer);
      }),
    removeLayer: (id) =>
      set((state) => {
        state.layers = state.layers.filter((layer) => layer.id !== id);
      }),

    removeSelectedLayer: () => {
      get().removeLayer(get().selectedLayerId || "");
    },

    updateLayer: (id, layer) =>
      set((state) => {
        const layerIndex = state.layers.findIndex((l) => l.id === id);
        state.layers[layerIndex] = {
          ...state.layers[layerIndex],
          ...layer,
        };
      }),
  }))
);

export const createLayer = <L extends Omit<AnyLayer, "id">>(
  props: L
): ILayer => {
  return {
    id: uniqid(),
    ...props,
  };
};
