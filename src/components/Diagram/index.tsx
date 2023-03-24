import { Box } from "@chakra-ui/react";
import { animated, update, useSpring } from "@react-spring/web";
import { useDrag, useGesture, useWheel } from "@use-gesture/react";
import { FC, ReactNode, useRef } from "react";
import { useDiagram } from "../../store/diagram";

export const Diagram: FC<{ children: ReactNode }> = ({ children }) => {
  const updateScale = useDiagram((state) => state.updateScale);
  const containerRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const [styles, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: useDiagram.getState().scale,
  }));

  useGesture(
    {
      onDrag: ({ offset: [x, y], ...rest }) => {
        api.set({
          x: styles.x.get() + rest.delta[0],
          y: styles.y.get() + rest.delta[1],
        });
      },
      // now we need to create onWheel event the will zoom in and out on the point where the mouse is
      // the onWheel event is attached to the containerRef but we are going to scale the paneRef
      onWheel: ({ event: e, delta: [, dy] }) => {
        const scale = styles.scale.get();
        const x = styles.x.get();
        const y = styles.y.get();

        const xs = (e.clientX - x) / scale;
        const ys = (e.clientY - y) / scale;

        const newScale = Math.exp(dy * -0.001) * scale;
        updateScale(newScale);
        api.set({
          scale: newScale,
          x: e.clientX - xs * newScale,
          y: e.clientY - ys * newScale,
        });
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
    >
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
        {children}
      </animated.div>
    </Box>
  );
};
