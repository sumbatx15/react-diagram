import { animated, useSpring } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { FC, useLayoutEffect, useRef } from "react";
import { resizeObserver } from "../../utils/resizeObserver";
import { useGetDiagramStore } from "../Diagram/WrappedDiagram";

import { useNodePosition, useNodeState } from "../Diagram/WrappedNode";

export interface LayerProps {
  id: string;
  children?: React.ReactNode;
}

export interface NodeCmpProps {
  id: string;
}

export const Draggable: FC<LayerProps> = ({ id, children }) => {
  const ref = useRef<HTMLElement>(null);
  const [position] = useNodePosition();
  const [state] = useNodeState();
  const useDiagram = useGetDiagramStore();


  useLayoutEffect(() => {
    resizeObserver.observe(ref.current!);
    return () => {
      resizeObserver.unobserve(ref.current!);
    };
  }, []);

  useGesture(
    {
      onDrag: ({
        delta: [x, y],
        event,
        canceled,
        first,
        cancel,
        pinching,
        ctrlKey,
        shiftKey,
        tap,
      }) => {
        if (canceled || pinching || ctrlKey || shiftKey) return;
        if (
          event.target instanceof HTMLInputElement ||
          (event.target as HTMLElement).classList.contains("handle")
        ) {
          event.stopPropagation();
          return cancel();
        }

        event.stopPropagation();
        event.stopImmediatePropagation();

        const scale = useDiagram.getState().viewport.scale;
        const deltaX = x / scale;
        const deltaY = y / scale;

        const newX = position.x + deltaX;
        const newY = position.y + deltaY;
        const hasSelectedNodes =
          useDiagram.getState().getSelectedNodeIds().length > 0;
        if (
          hasSelectedNodes &&
          useDiagram.getState().getSelectedNodeIds().includes(id)
        ) {
          useDiagram
            .getState()
            .updateSelectedNodesPositions({ x: deltaX, y: deltaY });
        } else {
          useDiagram.getState().setSelectedNodes([id]);
          useDiagram.getState().updateNodePosition(id, { x: newX, y: newY });
        }
      },
      onDragEnd: ({ tap }) => {},
    },
    {
      target: ref,
      eventOptions: {
        passive: false,
      },
    }
  );

  return (
    <div
      //@ts-ignore
      ref={ref}
      className="layer"
      data-element-type="node"
      data-id={id}
      style={{
        width: "",
        touchAction: "none",
        userSelect: "none",
        position: "absolute",
        willChange: "transform",
        outline: state.selected ? "2px solid " : "none",
        zIndex: state.selected ? 1 : 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {children}
    </div>
  );
};
