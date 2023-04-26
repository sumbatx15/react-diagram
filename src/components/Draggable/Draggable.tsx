import { animated, useSpring } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { FC, useLayoutEffect, useRef } from "react";
import { useDiagram } from "../../store/diagramStore";
import { resizeObserver } from "../../utils/resizeObserver";

export interface LayerProps {
  id: string;
  children?: React.ReactNode;
}

export interface NodeCmpProps {
  id: string;
}

export const Draggable: FC<LayerProps> = ({ id, children }) => {
  const ref = useRef<HTMLElement>(null);
  console.log('Draggable id:', id)
  useLayoutEffect(() => {
    resizeObserver.observe(ref.current!);
    return () => {
      resizeObserver.unobserve(ref.current!);
    };
  }, []);

  const [styles, api] = useSpring(() => ({
    x: useDiagram.getState().getNode(id)?.position.x || 0,
    y: useDiagram.getState().getNode(id)?.position.y || 0,
    zIndex: 0,
    isSelected: false,
  }));

  useDiagram((state) => {
    const position = state.getNodePosition(id);
    if (!position) return;
    const isSelected =
      state.getNodeState(id)?.selected ||
      (state.viewport.showSelectionBox &&
        state.viewport.getNodesInSelectionBox().includes(id));

    if (
      position.x !== styles.x.get() ||
      position.y !== styles.y.get() ||
      isSelected !== styles.isSelected.get()
    ) {
      api.set({
        x: position.x,
        y: position.y,
        isSelected,
      });
    }
  });

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

        const newX = styles.x.get() + deltaX;
        const newY = styles.y.get() + deltaY;
        api.set({
          x: newX,
          y: newY,
        });
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
        outline: styles.isSelected.to((isSelected) =>
          isSelected ? "2px solid " : "none"
        ),
        zIndex: styles.isSelected.to((isSelected) => (isSelected ? 1 : 0)),
      }}
    >
      {children}
    </animated.div>
  );
};
