import { animated, useSpring } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { FC, useLayoutEffect, useRef } from "react";
import { useDiagram } from "../../store/diagramStore";
import { useNode } from "../Diagram/DiagramNode";
import useResizeObserver from "@react-hook/resize-observer";
import { useOnResize } from "../../hooks/sizeObserver";
import { resizeObserver } from "../../utils/resizeObserver";

export interface LayerProps {
  id: string;
  children?: React.ReactNode;
}

export const Layer: FC<LayerProps> = ({ id, children }) => {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    resizeObserver.observe(ref.current!);
    return () => {
      resizeObserver.unobserve(ref.current!);
    };
  }, []);

  // useResizeObserver(ref, (entry, re) => {
  //   useDiagram.getState().setNodeElement2(id, ref.current!, entry.contentRect);
  // });

  const [styles, api] = useSpring(() => ({
    x: useDiagram.getState().getNode(id)?.position.x || 0,
    y: useDiagram.getState().getNode(id)?.position.y || 0,
    zIndex: 0,
  }));

  useDiagram((state) => {
    const position = state.getNodePosition(id);
    if (!position) return;
    if (position.x !== styles.x.get() || position.y !== styles.y.get()) {
      api.set({
        x: position.x,
        y: position.y,
      });
    }
  });

  useGesture(
    {
      onDrag: ({ delta: [x, y], event, canceled, first, cancel, pinching }) => {
        if (canceled || pinching) return;
        if (
          event.target instanceof HTMLInputElement ||
          (event.target as HTMLElement).classList.contains("handle")
        )
          return cancel();

        event.stopPropagation();
        event.stopImmediatePropagation();
        const scale = useDiagram.getState().viewport.scale;
        const newX = styles.x.get() + x / scale;
        const newY = styles.y.get() + y / scale;
        api.set({
          x: newX,
          y: newY,
          zIndex: 1,
        });
        useDiagram.getState().updateNodePosition(id, { x: newX, y: newY });
      },
      onDragEnd: () => {
        api.set({
          zIndex: 0,
        });
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
      data-element-type="node"
      data-id={id}
      style={{
        width: "",
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
