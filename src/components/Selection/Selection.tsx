import { animated, useSpring } from "@react-spring/web";
import { useDiagram } from "../../store/diagramStore";
import { Vector } from "../../store/utils";

interface SelectionBoxProps {}

export const calcBoxXY = (start: Vector, end: Vector) => {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);

  return { x, y };
};

export const calculateWidthAndHeight = (start: Vector, end: Vector) => {
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  return { width, height };
};

export const SelectionBox: React.FC<SelectionBoxProps> = () => {
  const [styles, api] = useSpring(() => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    opacity: 0,
  }));

  useDiagram((state) => {
    if (!state.viewport.showSelectionBox) {
      return api.set({
        opacity: 0,
        width: 0,
        height: 0,
      });
    }

    const { start, end } = state.viewport.selectionBoxPosition;
    const { x, y } = calcBoxXY(start, end);
    const { width, height } = calculateWidthAndHeight(start, end);

    api.set({
      x,
      y,
      width,
      height,
      opacity: 1,
    });
  });

  return (
    <animated.div
      style={{
        position: "absolute",
        zIndex: 100,
        pointerEvents: "none",
        border: "1px dashed #555",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        ...styles,
      }}
    />
  );
};
