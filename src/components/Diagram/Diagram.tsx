import { Partial, animated, to, useSpring } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { clamp } from "lodash-es";
import React, { FC, memo, useLayoutEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { createNode, getInDiagramPosition } from "../../store/diagramStore";
import { DiagramNode, getNodesInsideRect } from "../../store/utils";
import { EdgeTypes, NodeTypes } from "../../types";
import { mergeRefs } from "../../utils";
import {
  containerResizeObserver,
  handleViewportChange,
} from "../../utils/resizeObserver";
import { EdgeRenderer } from "../EdgeRenderer/EdgeRenderer";
import { ElevatedEdgeRenderer } from "../EdgeRenderer/ElevatedEdgeRenderer";
import { FullscreenBtn } from "../Editor/FullscreenBtn";
import { NodeRenderer } from "../NodeRenderer/NodeRenderer";
import { SelectionBox } from "../Selection/Selection";
import { createNodesAndEdges } from "./utils";
import { useDiagramContext, useGetDiagramStore } from "./WrappedDiagram";
import { containerIntersectionObserver } from "../../utils/intersectionObserver";
import { useWindowScroll } from "react-use";
import { ConfigSlice } from "../../store/configSlice";
export interface DiagramProps<
  TNodeTypes extends NodeTypes = NodeTypes,
  TNodes extends DiagramNode[] = DiagramNode[]
> extends React.HTMLAttributes<HTMLDivElement>,
    Partial<ConfigSlice> {
  nodeTypes?: TNodeTypes;
  edgeTypes?: EdgeTypes;
  minZoom?: number;
  maxZoom?: number;
  nodes?: TNodes;
  nodeIds?: string[];
}
export const Diagram: FC<DiagramProps> = memo(
  ({
    nodeTypes,
    edgeTypes,
    minZoom = 0.1,
    maxZoom = 5,
    children,
    style,
    nodes,
    nodeIds: _nodeIds,
    onNodesDeleted,
    ...props
  }) => {
    const { diagramId } = useDiagramContext();
    const useDiagram = useGetDiagramStore();
    const fitView = useDiagram((state) => state.fitView);
    const nodeIds = useDiagram((state) => state.nodeIds);

    const _NodeRenderer = React.Children.toArray(children).find(
      (child) => React.isValidElement(child) && child.type === NodeRenderer
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const paneRef = useRef<HTMLDivElement>(null);

    const [styles, api] = useSpring(() => ({
      x: 0,
      y: 0,
      scale: useDiagram.getState().viewport.scale,
    }));

    useLayoutEffect(() => {
      useDiagram.setState({
        onNodesDeleted,
      });
      if (!containerRef.current) return;
      containerResizeObserver.observe(containerRef.current);
      containerIntersectionObserver.observe(containerRef.current);

      return () => {
        if (!containerRef.current) return;
        containerResizeObserver.unobserve(containerRef.current);
        containerIntersectionObserver.unobserve(containerRef.current);
      };
    }, []);

    useLayoutEffect(() => {
      // listen to document scroll
      const onScroll = () => {
        handleViewportChange(containerRef.current!);
      };
      document.addEventListener("scroll", onScroll);
      return () => {
        document.removeEventListener("scroll", onScroll);
      };
    }, []);

    useDiagram((state) => {
      if (
        state.viewport.scale !== styles.scale.get() ||
        state.viewport.position.x !== styles.x.get() ||
        state.viewport.position.y !== styles.y.get()
      ) {
        api.start({
          scale: state.viewport.scale,
          x: state.viewport.position.x,
          y: state.viewport.position.y,
          immediate: false,
        });
      }
    });

    useGesture(
      {
        onDrag: ({
          offset: [x, y],
          xy: [x2, y2],
          event,
          delta,
          cancel,
          canceled,
          ctrlKey,
          shiftKey,
          first,
          tap,
        }) => {
          if (canceled) return;
          if (
            (event.target as HTMLElement).classList.contains("layer") ||
            (event.target as HTMLElement).classList.contains("handle")
          )
            return cancel();
          const viewport = useDiagram.getState().viewport;
          if (ctrlKey || shiftKey || viewport.showSelectionBox) {
            if (first) {
              useDiagram.setState((state) => ({
                viewport: {
                  ...state.viewport,
                  showSelectionBox: true,
                },
              }));

              viewport.updateSelectionBox({
                start: getInDiagramPosition({ x: x2, y: y2 }, viewport),
                end: getInDiagramPosition({ x: x2, y: y2 }, viewport),
              });
            } else {
              viewport.updateSelectionBox({
                end: getInDiagramPosition({ x: x2, y: y2 }, viewport),
              });
            }
            return;
          }
          const newX = styles.x.get() + delta[0];
          const newY = styles.y.get() + delta[1];
          api.set({
            x: newX,
            y: newY,
          });
          viewport.updatePosition({ x: newX, y: newY });
        },
        onDragEnd: ({ memo, tap, event }) => {
          if (
            tap &&
            (event.target === paneRef.current ||
              (event.target as HTMLElement).classList.contains(
                "diagram-container"
              ))
          ) {
            useDiagram.getState().selectNodes([]);
            useDiagram.getState().setSelectedEdges([]);
          }
          if (useDiagram.getState().viewport.showSelectionBox) {
            
            const selectedNodeIds = getNodesInsideRect({
              ...useDiagram.getState(),
              nodeIds: _nodeIds || nodeIds,
            });

            useDiagram.getState().selectNodes(selectedNodeIds);
            useDiagram.setState((state) => ({
              viewport: {
                ...state.viewport,
                showSelectionBox: false,
                selectionBoxPosition: {
                  start: { x: 0, y: 0 },
                  end: { x: 0, y: 0 },
                },
              },
            }));
          }
        },
        onWheel: ({ event: e, delta: [, dy], pinching }) => {
          e.stopPropagation();
          if (pinching) return;
          const scale = styles.scale.get();
          const x = styles.x.get();
          const y = styles.y.get();

          const xs = (e.clientX - x) / scale;
          const ys = (e.clientY - y) / scale;

          const newScale = clamp(
            Math.exp(dy * -0.00125) * scale,
            minZoom,
            maxZoom
          );
          const newX = e.clientX - xs * newScale;
          const newY = e.clientY - ys * newScale;
          api.set({
            scale: newScale,
            x: newX,
            y: newY,
          });
          useDiagram.setState((state) => ({
            viewport: {
              ...state.viewport,
              scale: newScale,
              position: {
                x: newX,
                y: newY,
              },
            },
          }));
        },

        onPinch: ({
          offset: [newScale],
          origin: [ox, oy],
          event: e,
          delta: [d],
        }) => {
          const scale = styles.scale.get();
          const x = styles.x.get();
          const y = styles.y.get();

          const xs = (ox - x) / scale;
          const ys = (oy - y) / scale;

          const newX = ox - xs * newScale;
          const newY = oy - ys * newScale;
          api.set({
            scale: newScale,
            x: newX,
            y: newY,
          });
          useDiagram.setState((state) => ({
            viewport: {
              ...state.viewport,
              scale: newScale,
              position: {
                x: newX,
                y: newY,
              },
            },
          }));
        },
      },
      {
        target: containerRef,
        drag: {
          pointer: {
            buttons: [1, 4],
          },
        },
        pinch: {
          from: () => {
            return [styles.scale.get(), 0];
          },
        },
        eventOptions: {
          passive: false,
        },
      }
    );

    const ref = useHotkeys("delete", (ev) => {
      useDiagram.getState().deleteSelectedNodes();
      useDiagram.getState().deleteSelectedEdges();
    });

    const ref2 = useHotkeys("esc", (ev) => {
      useDiagram.getState().deselectNodes();
      useDiagram.getState().deselectEdges();
    });

    console.count("Diagram rendered");

    return (
      <div
        className="diagram-container"
        data-diagram-id={diagramId}
        style={{
          touchAction: "none",
          width: "100%",
          height: "100%",
          userSelect: "none",
          outline: "none",
          background: "gray",
          overflow: "hidden",
          color: "white",
          ...style,
        }}
        tabIndex={0}
        ref={mergeRefs(containerRef, ref, ref2)}
        {...props}
      >
        {children}
        <animated.div
          ref={paneRef}
          className="diagram-pane"
          style={{
            transform: to(
              [styles.x, styles.y, styles.scale],
              (x, y, scale) => `translate(${x}px, ${y}px) scale(${scale})`
            ),
            width: "100%",
            height: "100%",
            touchAction: "none",
            transformOrigin: "top left",
          }}
        >
          <SelectionBox />
          <EdgeRenderer edgeTypes={edgeTypes} />
          <NodeRenderer nodeTypes={nodeTypes} nodeIds={_nodeIds || nodeIds} />
          <ElevatedEdgeRenderer edgeTypes={edgeTypes} style={{ zIndex: 1 }} />
        </animated.div>
      </div>
    );
  }
);
