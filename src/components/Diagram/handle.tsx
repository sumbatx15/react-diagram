import { useGesture } from "@use-gesture/react";
import { FC, memo, useLayoutEffect, useRef } from "react";
import { useDraggedEdge } from "../../hooks/useDraggedEdge";
import { getInDiagramPosition } from "../../store/diagramStore";
import { createEdge } from "../../store/utils";
import { resizeObserver } from "../../utils/resizeObserver";
import { Placement } from "./utils";
import { useDiagramContext, useGetDiagramStore } from "./WrappedDiagram";
import { useNodeContext } from "./WrappedNode";

interface HandleProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  type: "target" | "source";
  placement: Placement;
  children?: React.ReactNode;
  ghostSize?: number;
}

export const Handle: FC<HandleProps> = memo(
  ({ id, type, placement, children, ghostSize, ...props }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { diagramId } = useDiagramContext();
    const { nodeId } = useNodeContext();
    const useDiagram = useGetDiagramStore();

    useLayoutEffect(() => {
      useDiagram.getState().setHandlePlacement(nodeId, id, placement);
    }, [placement]);

    useLayoutEffect(() => {
      ref.current && resizeObserver.observe(ref.current);
      return () => {
        ref.current && resizeObserver.unobserve(ref.current);
        useDiagram.getState().clearHandleDimensions(nodeId, id);
      };
    }, []);

    useGesture(
      {
        onDrag: ({ xy, event, first, canceled, pinching, tap }) => {
          if (canceled || pinching) return;
          const state = useDiagram.getState();
          if (first) {
            const handleCenter = state.getHandleCenter(nodeId, id);

            state.updateDraggedEdgePosition({
              start: handleCenter,
              end: handleCenter,
            });

            state.setDraggedEdgeVisible(true);
            state.setDraggedEdge({
              handleId: id,
              nodeId,
              handleType: type,
            });
          }

          state.updateDraggedEdgePosition({
            end: getInDiagramPosition({ x: xy[0], y: xy[1] }, state.viewport),
          });

          const element = document.elementFromPoint(
            ...xy
          ) as HTMLElement | null;
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
            const [source, target] =
              type === "source" ? [from, to] : [to, from];
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
        className={`handle ${children ? "" : "circle"} ${placement} `}
        data-diagram-id={diagramId}
        data-element-type="handle"
        data-id={id}
        data-node-id={nodeId}
        data-type={type}
        {...props}
      >
        <div style={{ pointerEvents: "none" }}>{children}</div>
        {draggedEdge && (
          <div
            data-diagram-id={diagramId}
            data-element-type="handle"
            data-id={id}
            data-node-id={nodeId}
            data-type={type}
            style={{
              width: ghostSize,
              height: ghostSize,
            }}
            className="handle handle-ghost"
          />
        )}
      </div>
    );
  }
);
