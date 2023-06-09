import {
  animated,
  AnimatedComponent,
  SpringValue,
  useSpring,
} from "@react-spring/web";
import { ComponentProps, FC, memo, ReactNode } from "react";
import { DiagramEdge as EdgeType } from "../../store/diagramStore";
import { createEdgePosition, Vector } from "../../store/utils";
import { getBezierPath, PlacementEnum } from "./utils";
import { useGetDiagramStore } from "./WrappedDiagram";

// create type that takes a type and returns the same type but the values are union of the same type and SpringValue
type Primitive = string | number | boolean | null | undefined;
type WithSpringValue<T> = {
  [P in keyof T]: T[P] extends Primitive
    ? T[P] | SpringValue<T[P]>
    : WithSpringValue<T[P]>;
};

interface EdgeProps {
  d: SpringValue<string>;
  animated?: boolean;
}

export const getCubicBezierPathData = (start: Vector, end: Vector): string => {
  const midPoint = {
    x: (start.x + end.x) / 2,
    y: start.y,
  };
  return `M${start.x},${start.y} C${midPoint.x},${midPoint.y} ${midPoint.x},${end.y} ${end.x},${end.y}`;
};

export const EdgeContainer: FC<
  { children?: ReactNode } & React.SVGProps<SVGSVGElement>
> = ({ children, ...props }) => {
  const useDiagram = useGetDiagramStore();
  const edges = useDiagram((state) => state.edges);

  return (
    <svg
      {...props}
      style={{
        position: "absolute",
        pointerEvents: "none",
        touchAction: "none",
        width: "100%",
        height: "100%",
        overflow: "visible",
        ...props.style,
      }}
    >
      {children ?? edges.map((edge, i) => <StatefulEdge key={i} edge={edge} />)}
    </svg>
  );
};

export const Edge: FC<
  EdgeProps & Partial<ComponentProps<AnimatedComponent<"path">>>
> = ({ d, animated: _animate = false, style, ...props }) => {
  return (
    <animated.path
      style={{
        zIndex: 100,
        pointerEvents: "auto",
        touchAction: "none",
        ...style,
      }}
      // d={`M${edge.start[0]},${edge.start[1]} L${edge.end[0]},${edge.end[1]}`}
      // d={`M${edge.start[0]},${edge.start[1]} Q${
      //   (edge.start[0] + edge.end[0]) / 2
      // },${edge.start[1]} ${edge.end[0]},${edge.end[1]}`}

      d={d}
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      {...(_animate && {
        strokeDasharray: "10 6",
        strokeDashoffset: "0",
      })}
      fill="none"
      {...props}
    >
      {_animate && (
        <animate
          attributeName="stroke-dashoffset"
          attributeType="XML"
          from="0"
          to="-16"
          dur="0.45s"
          repeatCount="indefinite"
          begin="0s"
        />
      )}
    </animated.path>
  );
};

export const StatefulEdge: FC<{ edge: EdgeType }> = memo(({ edge }) => {
  const useDiagram = useGetDiagramStore();

  const { start, end } = createEdgePosition(useDiagram.getState(), edge);
  const [styles, api] = useSpring(() => ({
    start: [start.x, start.y],
    end: [end.x, end.y],
    d: getCubicBezierPathData(start, end),
    visible: true,
  }));

  useDiagram((state) => {
    const source = state.getHandleCenter(edge.source, edge.sourceHandle);
    const target = state.getHandleCenter(edge.target, edge.targetHandle);

    const sourcePlacement = state.getHandlePlacement(
      edge.source,
      edge.sourceHandle
    );

    const targetPlacement = state.getHandlePlacement(
      edge.target,
      edge.targetHandle
    );

    if (!source || !target) {
      if (!styles.visible.get()) return;
      return api.set({ visible: false });
    }

    if (
      source.x !== styles.start.get()[0] ||
      source.y !== styles.start.get()[1] ||
      target.x !== styles.end.get()[0] ||
      target.y !== styles.end.get()[1] ||
      !styles.visible.get()
    ) {
      api.set({
        start: [source.x, source.y],
        end: [target.x, target.y],
        visible: true,
        d: getBezierPath({
          sourceX: source.x,
          sourceY: source.y,
          targetX: target.x,
          targetY: target.y,
          sourcePlacement,
          targetPlacement,
          curvature: 0.25,
        })[0],
      });
    }
  });

  return (
    <animated.path
      style={{
        zIndex: 100,
        pointerEvents: "auto",
        touchAction: "none",
        display: styles.visible.to((v) => (v ? "initial" : "none")),
      }}
      d={styles.d}
      stroke="black"
      strokeWidth="1"
      strokeLinecap="round"
      // strokeDasharray="10 6"
      // strokeDashoffset="0"
      fill="none"
    >
      {/* <animate
        attributeName="stroke-dashoffset"
        attributeType="XML"
        from="0"
        to="-16"
        dur="0.45s"
        repeatCount="indefinite"
        begin="0s"
      /> */}
    </animated.path>
  );
});

export const DraggedEdge: FC = () => {
  const useDiagram = useGetDiagramStore();
  const isVisible = useDiagram((state) => state.isDraggedEdgeVisible);

  const [styles, api] = useSpring(() => ({
    start: [0, 0],
    end: [0, 0],
    d: getCubicBezierPathData({ x: 0, y: 0 }, { x: 0, y: 0 }),
  }));

  useDiagram((state) => {
    if (!state.draggedEdgePosition) return;
    const { start, end } = state.draggedEdgePosition;

    if (
      start.x !== styles.start.get()[0] ||
      start.y !== styles.start.get()[1] ||
      end.x !== styles.end.get()[0] ||
      end.y !== styles.end.get()[1]
    ) {
      api.set({
        start: [start.x, start.y],
        end: [end.x, end.y],
        d: getCubicBezierPathData(start, end),
      });
    }
  });
  if (!isVisible) return null;
  return (
    <Edge
      style={{ pointerEvents: "none" }}
      stroke="white"
      animated={false}
      d={styles.d}
    />
  );
};
