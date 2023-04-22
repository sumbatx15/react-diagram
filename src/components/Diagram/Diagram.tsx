import { Box, HStack } from "@chakra-ui/react";
import useResizeObserver from "@react-hook/resize-observer";
import { animated, update, useSpring, config } from "@react-spring/web";
import { useDrag, useGesture, useWheel } from "@use-gesture/react";
import { FC, ReactNode, useRef } from "react";
import { useEvent } from "react-use";
import {
  createNode,
  DiagramNode,
  Edge as IEdge,
  getInDiagramPosition,
  useDiagram,
} from "../../store/diagramStore";
import { getNodesInsideRect } from "../../store/utils";
import { FullscreenBtn } from "../Editor/FullscreenBtn";
import {
  calcBoxXY,
  calculateWidthAndHeight,
  SelectionBox,
} from "../Selection/Selection";
import { DiagramNodeFC } from "./DiagramNode";
import { Edge, EdgeContainer, UserEdge } from "./edge";
import { createNodesAndEdges } from "./utils";
export const Diagram: FC = () => {
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
    addNode(createNode());
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
              start: getInDiagramPosition({ x: x2, y: y2 }),
              end: getInDiagramPosition({ x: x2, y: y2 }),
            });
          } else {
            useDiagram.getState().viewport.updateSelectionBox({
              end: getInDiagramPosition({ x: x2, y: y2 }),
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
      onDragEnd: () => {
        const nodeIds = getNodesInsideRect();
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
      },
      // now we need to create onWheel event the will zoom in and out on the point where the mouse is
      // the onWheel event is attached to the containerRef but we are going to scale the paneRef
      onWheel: ({ event: e, delta: [, dy] }) => {
        const scale = styles.scale.get();
        const x = styles.x.get();
        const y = styles.y.get();

        const xs = (e.clientX - x) / scale;
        const ys = (e.clientY - y) / scale;

        const newScale = Math.exp(dy * -0.00125) * scale;
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
      onPinch: ({ offset: [d, a], origin: [ox, oy], da: [, da] }) => {
        updateScale(d);
        api.set({
          scale: d,
        });
      },
    },
    {
      target: containerRef,
      drag: {
        pointer: {
          buttons: [1, 4],
        },
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
      bg="gray.400"
      userSelect="none"
      overflow="hidden"
      style={{ touchAction: "none" }}
      ref={containerRef}
      // onDoubleClickCapture={(e) => {
      //   const scale = styles.scale.get();
      //   const x = styles.x.get();
      //   const y = styles.y.get();

      //   const xs = (e.clientX - x) / scale;
      //   const ys = (e.clientY - y) / scale;

      //   const newScale = Math.exp(300 * 0.00125) * styles.scale.get();
      //   const newX = e.clientX - xs * newScale;
      //   const newY = e.clientY - ys * newScale;
      //   api.start({
      //     scale: newScale,
      //     x: newX,
      //     y: newY,
      //     immediate: true,
      //   });
      //   updateScale(newScale);
      //   updatePosition({ x: newX, y: newY });
      // }}
    >
      <HStack zIndex={100} pos="absolute">
        <button onClick={handleAdd}>addnode</button>
        <button onClick={addMore}>add more</button>
        <button onClick={() => randomizePositions()}>randomize</button>
        <button onClick={() => fitView()}>fitView</button>
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
          <UserEdge />
        </EdgeContainer>
        <SelectionBox />
        <EdgeContainer />
        {nodeIds.map((id) => (
          <DiagramNodeFC nodeId={id} key={id} />
        ))}
      </animated.div>
    </Box>
  );
};
