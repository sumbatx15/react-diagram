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
import { useGetDiagramStore } from "./WrappedDiagram";
export interface DiagramProps {
  nodeTypes?: NodeTypes;
  edgeTypes?: EdgeTypes;
  minZoom?: number;
  maxZoom?: number;
}
export const Diagram: FC<DiagramProps> = ({
  nodeTypes = {},
  edgeTypes = {},
  minZoom = 0.1,
  maxZoom = 5,
}) => {
  const useDiagram = useGetDiagramStore();
  const updateScale = useDiagram((state) => state.viewport.updateScale);
  const fitView = useDiagram((state) => state.fitView);
  const updatePosition = useDiagram((state) => state.viewport.updatePosition);
  const nodeIds = useDiagram((state) => state.nodeIds);
  const addNode = useDiagram((state) => state.addNode);
  const setNodes = useDiagram((state) => state.setNodes);
  const setEdges = useDiagram((state) => state.setEdges);

  const randomizePositions = () => {
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
    console.log("nodes:", nodes);
    setNodes(nodes);
    setEdges(edges);
    setTimeout(() => {
      fitView();
    }, 500);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  console.log("useDiagram:", useDiagram);
  const [styles, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: useDiagram.getState().viewport.scale,
  }));

  useResizeObserver(containerRef, (entry) => {
    useDiagram
      .getState()
      .viewport.updateSize(entry.contentRect.width, entry.contentRect.height);
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

  const [d, setD] = useState(0);
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
        if (
          ctrlKey ||
          shiftKey ||
          useDiagram.getState().viewport.showSelectionBox
        ) {
          if (first) {
            useDiagram.setState((state) => ({
              viewport: {
                ...state.viewport,
                showSelectionBox: true,
              },
            }));

            useDiagram.getState().viewport.updateSelectionBox({
              start: getInDiagramPosition(
                { x: x2, y: y2 },
                useDiagram.getState().viewport
              ),
              end: getInDiagramPosition(
                { x: x2, y: y2 },
                useDiagram.getState().viewport
              ),
            });
          } else {
            useDiagram.getState().viewport.updateSelectionBox({
              end: getInDiagramPosition(
                { x: x2, y: y2 },
                useDiagram.getState().viewport
              ),
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
        updatePosition({ x: newX, y: newY });
      },
      onDragEnd: ({ memo, tap }) => {
        if (tap) {
          useDiagram.getState().setSelectedNodes([]);
        }
        if (useDiagram.getState().viewport.showSelectionBox) {
          const nodeIds = getNodesInsideRect(useDiagram.getState());
          useDiagram.getState().setSelectedNodes(nodeIds);
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
      // now we need to create onWheel event the will zoom in and out on the point where the mouse is
      // the onWheel event is attached to the containerRef but we are going to scale the paneRef
      onWheel: ({ event: e, delta: [, dy] }) => {
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
        offset: [d],
        origin: [ox, oy],
        da: [, da],
        delta: [d1, a1],
      }) => {
        const viewport = useDiagram.getState().viewport;
        const prevScale = styles.scale.get();
        const newScale = clamp(prevScale + d1, 0.1, 5);

        // Calculate the offset of the viewport
        const offsetX = -ox / d1 + styles.x.get();
        const offsetY = -oy / d1 + styles.y.get();
        const oox = ox * prevScale;
        const ooy = oy * prevScale;

        const newX = oox - ((oox - styles.x.get()) * newScale) / prevScale;
        const newY = ooy - ((ooy - styles.y.get()) * newScale) / prevScale;

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
      onPinchEnd: ({ cancel }) => {
        cancel();
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
        pinchOnWheel: false,
      },
      eventOptions: {
        passive: false,
      },
    }
  );

  console.count("Diagram");

  return (
    <Box
      w="100vw"
      h="100vh"
      bg="gray.900"
      userSelect="none"
      overflow="hidden"
      style={{ touchAction: "none" }}
      ref={containerRef}
    >
      <HStack zIndex={100} pos="absolute">
        <button onClick={handleAdd}>addnode</button>
        <button onClick={addMore}>add more</button>
        <button onClick={() => randomizePositions()}>randomize</button>
        <button onClick={() => fitView()}>fitView</button>
        <button>{d}</button>
        <FullscreenBtn target={containerRef} />
      </HStack>
      <animated.div
        ref={paneRef}
        style={{
          ...styles,
          // position: "absolute",
          // border: "1px solid red",
          width: "100%",
          height: "100%",
          touchAction: "none",
          transformOrigin: "top left",
          // transformOrigin: styles.origin.to((x, y) => `${x}px ${y}px`),
        }}
      >
        <EdgeContainer style={{ zIndex: 100 }}>
          <DraggedEdge />
        </EdgeContainer>
        <SelectionBox />
        <EdgeRenderer edgeTypes={edgeTypes} />
        {nodeIds.map((id) => {
          const Component =
            nodeTypes[useDiagram.getState().nodeTypes[id]] ||
            nodeTypes["default"] ||
            DefaultNode;
          return <WrappedNode nodeId={id} key={id} Component={Component} />;
        })}
      </animated.div>
    </Box>
  );
};
