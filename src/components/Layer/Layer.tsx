import { useConst, useMergeRefs } from "@chakra-ui/react";
import { animated, useSpring } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { FC, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useDiagram } from "../../store/diagram";

export interface LayerProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  // gestureContainer: MutableRefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
}

export const Layer: FC<LayerProps> = ({
  id,
  /* gestureContainer, */ ...props
}) => {
  const targetRef = useRef<Element>(null);

  const [styles, api] = useSpring(() => ({
    x: Math.random() * 1000,
    y: Math.random() * 1000,
  }));

  useGesture(
    {
      onDrag: ({ delta: [x, y], event }) => {
        event.stopPropagation();
        const scale = useDiagram.getState().scale;
        api.set({
          x: styles.x.get() + x / scale,
          y: styles.y.get() + y / scale,
        });
      },
    },
    {
      target: targetRef,
      eventOptions: {
        passive: false,
      },
    }
  );

  return (
    <animated.div
      //@ts-ignore
      ref={targetRef}
      style={{
        width: "min-content",
        ...styles,
        touchAction: "none",
        userSelect: "none",
        position: "absolute",
      }}
      {...props}
    >
      {props.children}
    </animated.div>
  );
};
