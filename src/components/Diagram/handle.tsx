import { AbsoluteCenter, Circle } from "@chakra-ui/react";
import { useGesture } from "@use-gesture/react";
import { FC, useLayoutEffect, useRef } from "react";
import { createEdge } from "../../store/utils";
import { resizeObserver } from "../../utils/resizeObserver";
import { useNodeContext } from "./WrappedNode";
import { Placement } from "./utils";
import { useDiagramContext, useGetDiagramStore } from "./WrappedDiagram";
import { useDraggedEdge } from "../../hooks/useDraggedEdge";
import { getInDiagramPosition } from "../../store/diagramStore";

interface HandleProps {
  id: string;
  type: "target" | "source";
  placement: Placement;
}



export const Handle: FC<HandleProps> = ({ id, type, placement }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { diagramId } = useDiagramContext();
  const { nodeId } = useNodeContext();
  const useDiagram = useGetDiagramStore();

  useLayoutEffect(() => {
    useDiagram.getState().setHandlePlacement(nodeId, id, placement);
  }, [placement]);

  useLayoutEffect(() => {
    resizeObserver.observe(ref.current!);

    return () => {
      resizeObserver.unobserve(ref.current!);
      useDiagram.getState().clearHandleDimensions(nodeId, id);
    };
  }, []);

  // useResizeObserver({
  //   ref,
  //   onResize: () => {
  //     useDiagram.getState().setHandleElement2(nodeId, id, ref.current!);
  //   },
  // });

  useGesture(
    {
      onDrag: ({ xy, event, first, canceled, pinching }) => {
        if (canceled || pinching) return;
        const state = useDiagram.getState();
        if (first) {
          const handleCenter = state.getHandleCenter(nodeId, id);

          useDiagram.getState().updateDraggedEdgePosition({
            start: handleCenter,
            end: handleCenter,
          });

          useDiagram.getState().setDraggedEdgeVisible(true);
          useDiagram.getState().setDraggedEdge({
            handleId: id,
            nodeId,
            handleType: type,
          });
        }

        useDiagram.getState().updateDraggedEdgePosition({
          end: getInDiagramPosition({ x: xy[0], y: xy[1] }, state.viewport),
        });

        const element = document.elementFromPoint(...xy) as HTMLElement | null;
        if (
          element &&
          element.dataset.elementType === "handle" &&
          element.dataset.type !== type &&
          element.dataset.id !== id
        ) {
          const handleCenter = state.getHandleCenter(
            element.dataset.nodeId as string,
            element.dataset.id as string
          );

          useDiagram.getState().updateDraggedEdgePosition({
            end: handleCenter,
          });
        }
      },
      onDragEnd: ({ xy }) => {
        const element = document.elementFromPoint(...xy);

        const [from, to] = [ref.current, element] as HTMLElement[];
        if (
          from &&
          to &&
          to.dataset.elementType === "handle" &&
          from.dataset.nodeId !== to.dataset.nodeId &&
          from.dataset.id !== to.dataset.id &&
          to.dataset.type !== type
        ) {
          const [source, target] = type === "source" ? [from, to] : [to, from];
          const onConnection = useDiagram.getState().onConnection;
          onConnection
            ? onConnection({
                source: source.dataset.nodeId as string,
                target: target.dataset.nodeId as string,
                sourceHandle: source.dataset.id as string,
                targetHandle: target.dataset.id as string,
              })
            : useDiagram.getState().addEdge(
                createEdge({
                  source: source.dataset.nodeId as string,
                  target: target.dataset.nodeId as string,
                  sourceHandle: source.dataset.id as string,
                  targetHandle: target.dataset.id as string,
                  data: "",
                  animated: true,
                })
              );
        }
        useDiagram.getState().clearDraggedEdge();
      },
    },
    {
      target: ref,
      eventOptions: {
        passive: false,
      },
    }
  );
  const draggedEdge = useDraggedEdge();
  if (draggedEdge?.handleType === type && draggedEdge?.nodeId !== nodeId)
    return null;
  return (
    <div
      ref={ref}
      className={`handle ${placement}`}
      data-diagram-id={diagramId}
      data-element-type="handle"
      data-id={id}
      data-node-id={nodeId}
      data-type={type}
    >
      {draggedEdge && (
        <Circle
          data-diagram-id={diagramId}
          data-element-type="handle"
          data-id={id}
          data-node-id={nodeId}
          data-type={type}
          opacity={0}
          className="handle-ghost"
          position="absolute"
          size="42px"
          border="1px dashed gray"
        />
      )}
    </div>
  );
};
