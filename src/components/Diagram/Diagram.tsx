import { Box } from "@chakra-ui/react";
import { animated, update, useSpring, config } from "@react-spring/web";
import { useDrag, useGesture, useWheel } from "@use-gesture/react";
import { FC, ReactNode, useRef } from "react";
import {
  createNode,
  DiagramNode,
  Edge as IEdge,
  useDiagram,
} from "../../store/diagramStore";
import { FullscreenBtn } from "../Editor/FullscreenBtn";
import { DiagramNodeFC } from "./DiagramNode";
import { Edge, EdgeContainer, UserEdge } from "./edge";
import { createNodesAndEdges } from "./utils";
export const Diagram: FC = () => {
  const updateScale = useDiagram((state) => state.viewport.updateScale);
  // const viewport = useDiagram((state) => state.viewport);
  const updatePosition = useDiagram((state) => state.viewport.updatePosition);
  const nodeIds = useDiagram((state) => state.nodeIds);
  const addNode = useDiagram((state) => state.addNode);
  const addNodes = useDiagram((state) => state.addNodes);
  const addEdges = useDiagram((state) => state.addEdges);

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
  };
  const handleAdd = () => {
    addNode(createNode());
  };

  const addMore = () => {
    const { edges, nodes } = createNodesAndEdges(10, 20);
    addNodes(nodes);
    addEdges(edges);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const [styles, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: useDiagram.getState().viewport.scale,
  }));

  useDiagram((state) => {
    if (state.viewport.scale !== styles.scale.get()) {
      api.start({
        scale: state.viewport.scale,
        config: {
          ...config.wobbly,
          duration: 100,
        },
      });
    }
  });

  useGesture(
    {
      onDoubleClickCapture: ({ event }) => {
        const newScale = Math.exp(100 * -0.00125) * styles.scale.get();
        api.start({
          scale: newScale,
        });
        updateScale(styles.scale.get() * 1.1);
      },
      onDrag: ({ offset: [x, y], event, delta, cancel, canceled }) => {
        if (canceled) return;
        if (
          (event.target as HTMLElement).classList.contains("layer") ||
          (event.target as HTMLElement).classList.contains("handle")
        )
          return cancel();
        const newX = styles.x.get() + delta[0];
        const newY = styles.y.get() + delta[1];
        api.set({
          x: newX,
          y: newY,
        });
        updatePosition({ x: newX, y: newY });
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
        updateScale(newScale);
        updatePosition({ x: newX, y: newY });
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
      onDoubleClickCapture={(e) => {
        const scale = styles.scale.get();
        const x = styles.x.get();
        const y = styles.y.get();

        const xs = (e.clientX - x) / scale;
        const ys = (e.clientY - y) / scale;

        const newScale = Math.exp(300 * 0.00125) * styles.scale.get();
        const newX = e.clientX - xs * newScale;
        const newY = e.clientY - ys * newScale;
        api.start({
          scale: newScale,
          x: newX,
          y: newY,
          immediate: true,
        });
        updateScale(newScale);
        updatePosition({ x: newX, y: newY });
      }}
    >
      <Box zIndex={100} pos="absolute">
        <button onClick={handleAdd}>addnode</button>
        <button onClick={addMore}>add more</button>
        <button onClick={() => randomizePositions()}>randomize</button>
        <FullscreenBtn target={containerRef} />
      </Box>
      <animated.div
        ref={paneRef}
        style={{
          ...styles,
          // position: "absolute",
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
        <EdgeContainer />
        {nodeIds.map((id) => (
          <DiagramNodeFC nodeId={id} key={id} />
        ))}
      </animated.div>
    </Box>
  );
};
