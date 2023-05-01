import { Box, HStack } from "@chakra-ui/react";
import useResizeObserver from "@react-hook/resize-observer";
import { animated, useSpring } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { clamp } from "lodash-es";
import { FC, useRef, useState } from "react";
import { createNode, getInDiagramPosition } from "../../store/diagramStore";
import { getNodesInsideRect } from "../../store/utils";
import { EdgeTypes, NodeTypes } from "../../types";
import { FullscreenBtn } from "../Editor/FullscreenBtn";
import { SelectionBox } from "../Selection/Selection";
import { DraggedEdge, EdgeContainer } from "./edge";
import { createNodesAndEdges } from "./utils";
import { DefaultNode } from "../Node/DefaultNode";
import { WrappedNode } from "./WrappedNode";
import { EdgeRenderer } from "../EdgeRenderer/EdgeRenderer";
import { DiagramView, useGetDiagramStore } from "./WrappedDiagram";
import { Background } from "../background";
import { ElevatedEdgeRenderer } from "../EdgeRenderer/ElevatedEdgeRenderer";
import { mockProject } from "../../mock/project";
import { CustomNode } from "../Node/CustomNode";
import { useKey } from "react-use";
import { NodeRenderer } from "../NodeRenderer/NodeRenderer";
import { useHotkeys } from "react-hotkeys-hook";
import { mergeRefs } from "../../utils";
export interface DiagramProps extends React.HTMLAttributes<HTMLDivElement> {
  nodeTypes?: NodeTypes;
  edgeTypes?: EdgeTypes;
  minZoom?: number;
  maxZoom?: number;
  id: string;
}
export const Diagram: FC<DiagramProps> = ({
  nodeTypes = {},
  edgeTypes = {},
  minZoom = 0.1,
  maxZoom = 5,
  id,
  children,
  ...props
}) => {
  const useDiagram = useGetDiagramStore();
  const updateScale = useDiagram((state) => state.viewport.updateScale);
  const fitView = useDiagram((state) => state.fitView);
  const nodeIds = useDiagram((state) => state.nodeIds);
  const addNode = useDiagram((state) => state.addNode);
  const setNodes = useDiagram((state) => state.setNodes);
  const setEdges = useDiagram((state) => state.setEdges);

  const randomizePositions = () => {
    if (!useDiagram.getState().nodeIds.length) return;
    const positions = Object.entries(
      useDiagram.getState().nodePositions
    ).reduce((acc, [id, pos]) => {
      const x = Math.random() * 2000;
      const y = Math.random() * 1000;
      acc[id] = { x, y };
      return acc;
    }, {} as Record<string, { x: number; y: number }>);
    useDiagram.setState({ nodePositions: positions });
    fitView();
  };
  const handleAdd = () => {
    addNode({
      ...createNode(),
      type: Math.random() > 0.5 ? "default" : "custom",
    });
  };

  const addMore = () => {
    const { edges, nodes } = createNodesAndEdges(10, 10);
    setNodes(nodes);
    setEdges(edges);
    setTimeout(() => {
      fitView();
    }, 500);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);

  const [styles, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: useDiagram.getState().viewport.scale,
  }));

  useResizeObserver(containerRef, (entry) => {
    useDiagram
      .getState()
      .viewport.updateSize(
        entry.contentRect.width,
        entry.contentRect.height,
        (entry.target as HTMLElement).offsetTop,
        (entry.target as HTMLElement).offsetLeft
      );
  });

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
          console.log("event.target:");
          useDiagram.getState().selectNodes([]);
          useDiagram.getState().setSelectedEdges([]);
        }
        if (useDiagram.getState().viewport.showSelectionBox) {
          const nodeIds = getNodesInsideRect(useDiagram.getState());
          useDiagram.getState().selectNodes(nodeIds);
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
  });

  return (
    <div
      className="diagram-container"
      style={{
        touchAction: "none",
        width: "100%",
        height: "100%",
        userSelect: "none",
        outline: "none",
        background: "black",
        overflow: "hidden",
        color: "white",
      }}
      tabIndex={0}
      ref={mergeRefs(containerRef, ref)}
      {...props}
    >
      {/* <Background color="gray" id={id} /> */}
      {children}
      <HStack zIndex={100} pos="absolute">
        <button onClick={handleAdd}>addnode</button>
        <button onClick={addMore}>add more</button>
        <button onClick={() => randomizePositions()}>randomize</button>
        <button onClick={() => fitView()}>fitView</button>

        <FullscreenBtn target={containerRef} />
      </HStack>
      <animated.div
        ref={paneRef}
        className="diagram-pane"
        style={{
          ...styles,
          width: "100%",
          height: "100%",
          touchAction: "none",
          transformOrigin: "top left",
        }}
      >
        <SelectionBox />
        <EdgeRenderer edgeTypes={edgeTypes} />
        <NodeRenderer nodeTypes={nodeTypes} />
        <ElevatedEdgeRenderer edgeTypes={edgeTypes} style={{ zIndex: 1 }} />
      </animated.div>
    </div>
  );
};
