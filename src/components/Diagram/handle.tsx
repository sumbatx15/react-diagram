import { Circle } from "@chakra-ui/react";
import { useGesture } from "@use-gesture/react";
import { FC, useLayoutEffect, useRef } from "react";
import { createEdge } from "../../store/utils";
import { resizeObserver } from "../../utils/resizeObserver";
import { useNodeContext } from "./WrappedNode";
import { Placement } from "./utils";
import { useDiagramContext, useGetDiagramStore } from "./WrappedDiagram";

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
          const rect = (
            event.currentTarget as HTMLElement
          ).getBoundingClientRect();
          const xs =
            (rect.left - state.viewport.position.x) / state.viewport.scale;
          const ys =
            (rect.top - state.viewport.position.y) / state.viewport.scale;

          useDiagram.getState().updateDraggedEdgePosition({
            start: {
              x: xs + rect.width / 2 / state.viewport.scale,
              y: ys + rect.height / 2 / state.viewport.scale,
            },
          });
          useDiagram.getState().setDraggedEdgeVisible(true);
        }

        const xs = (xy[0] - state.viewport.position.x) / state.viewport.scale;
        const ys = (xy[1] - state.viewport.position.y) / state.viewport.scale;
        useDiagram.getState().updateDraggedEdgePosition({
          end: {
            x: xs,
            y: ys,
          },
        });

        const element = document.elementFromPoint(...xy);
        if (element && element.classList.contains("handle")) {
          const rect = element.getBoundingClientRect();
          const xs =
            (rect.left - state.viewport.position.x) / state.viewport.scale;
          const ys =
            (rect.top - state.viewport.position.y) / state.viewport.scale;
          const elementCenter = [
            xs + rect.width / 2 / state.viewport.scale,
            ys + rect.height / 2 / state.viewport.scale,
          ];
          useDiagram.getState().updateDraggedEdgePosition({
            end: {
              x: elementCenter[0],
              y: elementCenter[1],
            },
          });
        }
      },
      onDragEnd: ({ xy }) => {
        const element = document.elementFromPoint(...xy);

        const [from, to] = [ref.current, element] as HTMLElement[];
        if (
          from &&
          to &&
          to.classList.contains("handle") &&
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
      {/* <AbsoluteCenter data-id={id} data-node-id={nodeId} data-type={type}>
        <Circle
          data-id={id}
          data-node-id={nodeId}
          data-type={type}
          opacity="0"
          className="handle"
          size="42px"
          // border="1px dashed gray"
        />
      </AbsoluteCenter> */}
    </div>
  );
};
