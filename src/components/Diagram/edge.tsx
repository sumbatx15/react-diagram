import {
  animated,
  AnimatedComponent,
  SpringValue,
  useSpring,
} from "@react-spring/web";
import { ComponentProps, FC, ReactNode } from "react";
import { Edge as EdgeType, useDiagram } from "../../store/diagramStore";
import { Vector } from "../../store/utils";

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

const getCubicBezierPathData = (start: Vector, end: Vector): string => {
  const midPoint = {
    x: (start.x + end.x) / 2,
    y: start.y,
  };
  return `M${start.x},${start.y} C${midPoint.x},${midPoint.y} ${midPoint.x},${end.y} ${end.x},${end.y}`;
};

export const EdgeContainer: FC<
  { children?: ReactNode } & React.SVGProps<SVGSVGElement>
> = ({ children, ...props }) => {
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
> = ({ d, animated: _animate = true, style, ...props }) => {
  return (
    <animated.path
      onClick={console.log}
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

export const StatefulEdge: FC<{ edge: EdgeType }> = ({ edge }) => {
  const { start, end } = useDiagram.getState().edgePositions[edge.id];
  console.log('start, end :', start, end )
  const [styles, api] = useSpring(() => ({
    start: [0, 0],
    end: [0, 0],
    d: getCubicBezierPathData(
      { x: start.x, y: start.y },
      { x: end.x, y: end.y }
    ),
  }));

  useDiagram((state) => {
    const edgePosition = state.edgePositions[edge.id];
    if (!state.edgePositions[edge.id]) return;
    const { start, end } = edgePosition;

    //Check if edge data is different from the spring values

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

  return <Edge d={styles.d} />;
};

export const UserEdge: FC = () => {
  const isVisible = useDiagram((state) => state.isDraggedEdgeVisible);

  const [styles, api] = useSpring(() => ({
    start: [0, 0],
    end: [0, 0],
    d: getCubicBezierPathData({ x: 0, y: 0 }, { x: 0, y: 0 }),
  }));

  useDiagram((state) => {
    if (!state.draggedEdge) return;
    const { start, end } = state.draggedEdge;

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
    <Edge style={{ pointerEvents: "none" }} animated={false} d={styles.d} />
  );
};
