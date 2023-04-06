import { animated, useSpring } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { FC, useRef } from "react";
import { useDiagram } from "../../store/diagramStore";
import { useNode } from "../Diagram/DiagramNode";
import useResizeObserver from "@react-hook/resize-observer";

export interface LayerProps {
  id: string;
  children?: React.ReactNode;
}

export const Layer: FC<LayerProps> = ({ id, children }) => {
  const ref = useRef<HTMLElement>(null);

  useResizeObserver(ref, (entry) => {
    useDiagram.getState().updateElement(id, entry.target, entry.contentRect);
  });

  const [styles, api] = useSpring(() => ({
    x: useDiagram.getState().getNode(id)?.position.x || 0,
    y: useDiagram.getState().getNode(id)?.position.y || 0,
  }));

  useNode((node) => {
    if (
      node.position.x !== styles.x.get() ||
      node.position.y !== styles.y.get()
    ) {
      api.start({
        x: node.position.x,
        y: node.position.y,
      });
    }
  });

  useGesture(
    {
      onDrag: ({ delta: [x, y], event, canceled, cancel }) => {
        if (canceled) return;
        if (
          event.target instanceof HTMLInputElement ||
          (event.target as HTMLElement).classList.contains("handle")
        )
          return cancel();

        event.stopPropagation();
        const scale = useDiagram.getState().scale;
        const newX = styles.x.get() + x / scale;
        const newY = styles.y.get() + y / scale;
        api.set({
          x: newX,
          y: newY,
        });
        useDiagram.getState().updateNodePosition(id, { x: newX, y: newY });
      },
    },
    {
      target: ref,
      eventOptions: {
        passive: false,
      },
    }
  );

  return (
    <animated.div
      //@ts-ignore
      ref={ref}
      className="layer"
      data-id={id}
      style={{
        width: "min-content",
        ...styles,
        touchAction: "none",
        userSelect: "none",
        position: "absolute",
      }}
    >
      {children}
    </animated.div>
  );
};
