import { Lookup, SpringValues } from "@react-spring/web";
import { MutableRefObject } from "react";
import { State } from "zustand";
import { ILayer } from "./layers";

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
