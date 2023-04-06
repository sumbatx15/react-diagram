import { AbsoluteCenter, Circle } from "@chakra-ui/react";
import useResizeObserver from "@react-hook/resize-observer";
import { useGesture } from "@use-gesture/react";
import { useRef, FC } from "react";
import { useDiagram } from "../../store/diagramStore";
import { createHandleOuterId } from "../../utils";
import { useNode, useNodeContext } from "./DiagramNode";

interface HandleProps {
  id: string;
  type: "target" | "source";
}

export const Handle: FC<HandleProps> = ({ id, type }) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const isActive = useDiagram((state) => {
    return state.isActiveEdge;
  });

  const { nodeId } = useNodeContext();

  useResizeObserver(targetRef, (entry) => {
    useDiagram
      .getState()
      .updateElement(
        createHandleOuterId(nodeId, id),
        entry.target,
        entry.contentRect
      );
  });

  useGesture(
    {
      onDrag: ({ xy, event, first, canceled }) => {
        const state = useDiagram.getState();
        if (first) {
          const rect = (
            event.currentTarget as HTMLElement
          ).getBoundingClientRect();
          const xs = (rect.left - state.position.x) / state.scale;
          const ys = (rect.top - state.position.y) / state.scale;

          useDiagram.getState().updateEdge({
            start: {
              x: xs + rect.width / 2 / state.scale,
              y: ys + rect.height / 2 / state.scale,
            },
          });
        }

        useDiagram.getState().setIsActiveEdge(true);
        const xs = (xy[0] - state.position.x) / state.scale;
        const ys = (xy[1] - state.position.y) / state.scale;
        useDiagram.getState().updateEdge({
          end: {
            x: xs,
            y: ys,
          },
        });

        const element = document.elementFromPoint(...xy);
        if (element && element.classList.contains("handle")) {
          const rect = element.getBoundingClientRect();
          const xs = (rect.left - state.position.x) / state.scale;
          const ys = (rect.top - state.position.y) / state.scale;
          const elementCenter = [
            xs + rect.width / 2 / state.scale,
            ys + rect.height / 2 / state.scale,
          ];
          useDiagram.getState().updateEdge({
            end: {
              x: elementCenter[0],
              y: elementCenter[1],
            },
          });
        }
      },
      onDragEnd: ({ xy }) => {
        const element = document.elementFromPoint(...xy);

        const [source, target] = [targetRef.current, element] as HTMLElement[];
        if (
          source &&
          target &&
          target.classList.contains("handle") &&
          source.dataset.nodeId !== target.dataset.nodeId &&
          source.dataset.id !== target.dataset.id
        ) {
          console.log("target:", target);
          console.log("source:", source);
          useDiagram.getState().addEdge({
            source: source.dataset.nodeId as string,
            target: target.dataset.nodeId as string,
            sourceHandle: source.dataset.id as string,
            targetHandle: target.dataset.id as string,
            data: "",
          });
        }
        useDiagram.getState().setIsActiveEdge(false);
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
    <Circle
      cursor="crosshair"
      className="handle"
      ref={targetRef}
      zIndex="100"
      size="16px"
      bg="white"
      pos="relative"
      data-id={id}
      data-node-id={nodeId}
      data-type={type}
      style={{
        touchAction: "none",
      }}
    >
      <AbsoluteCenter data-id={id} data-node-id={nodeId} data-type={type}>
        <Circle
          data-id={id}
          data-node-id={nodeId}
          data-type={type}
          opacity="0"
          className="handle"
          size="42px"
          // border="1px dashed gray"
        />
      </AbsoluteCenter>
    </Circle>
  );
};
