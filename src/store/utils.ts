import { SpringValues } from "@react-spring/web";
import { MutableRefObject } from "react";
import { ILayer } from "./layersStore";

export const isConstrainProportions = (type: ILayer["type"]) => {
  return ["image", "icon"].includes(type);
};

export const getUpdatedLayer = (
  ref: MutableRefObject<HTMLDivElement | null>,
  values: SpringValues<{
    x: number;
    y: number;
    scale: number;
    rotate: number;
  }>
) => {
  return {
    width: ref.current?.offsetWidth || 0,
    height: ref.current?.offsetHeight || 0,
    rotate: values.rotate.get(),
    scale: values.scale.get(),
    x: values.x.get(),
    y: values.y.get(),
  };
};

export type Vector = {
  x: number;
  y: number;
};

export interface NodeState {
  selected: boolean;
  dragging: boolean;
  disabled: boolean;
}

export interface DiagramNode {
  id: string;
  type?: string;
  position: Vector;
  data: unknown;
  state: NodeState;
}

export interface EdgePosition {
  start: Vector;
  end: Vector;
}
