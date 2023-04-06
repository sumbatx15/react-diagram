import { Box, HStack, Img, Stack } from "@chakra-ui/react";
import { animated, useTrail, useTransition } from "@react-spring/web";
import { FC, useCallback, useRef } from "react";
import { useKeyPressEvent } from "react-use";
import img from "../../assets/0.svg";
import { ILayer, useLayers } from "../../store/layersStore";
import { ImageUploadButton } from "../ImageUploadButton";
import { ImageLayer } from "../Layer/IamgeLayer";
import { Layer } from "../Layer/Layer";
import { TextLayer } from "../Layer/TextLayer";
import { AddTextBtn } from "./AddTextBtn";
import { DeleteBtn } from "./DeleteBtn";
import { FullscreenBtn } from "./FullscreenBtn";
import { PotraceBtn } from "./PotraceBtn";
import { SelectedLayerOutline } from "./SelectedLayerOutline";

const LAYERS: Record<ILayer["type"], FC<any>> = {
  image: ImageLayer,
  text: TextLayer,
  icon: Layer,
};

export const Editor: FC = (props) => {
  const target = useRef<HTMLDivElement | null>(null);

  const selectLayer = useLayers(useCallback((state) => state.selectLayer, []));
  const layers = useLayers(useCallback((state) => state.layers, []));

  const handleContainerClick = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (["target", "box"].includes((ev.target as HTMLElement).id))
      selectLayer("");
  };

  useKeyPressEvent("Delete", () => {
    useLayers.getState().removeSelectedLayer();
  });

  const elements = [
    <ImageUploadButton onImageSelect={console.log} />,
    <FullscreenBtn target={target} />,
    <PotraceBtn />,
    <AddTextBtn />,
    <DeleteBtn />,
  ].filter(Boolean);

  const transitions = useTrail(elements.length, {
    from: { x: -50, scale: 0 },
    to: { x: 0, scale: 1 },
  });

  return (
    <Stack
      align="center"
      justify="center"
      ref={target}
      id="target"
      w="100vw"
      h="100vh"
      bg="#454D53"
      style={{ touchAction: "none" }}
      onClick={handleContainerClick}
    >
      <Box>
        <SelectedLayerOutline />
        <Box
          id="box"
          bgSize="cover"
          w="320px"
          h="520px"
          rounded="3xl"
          overflow="hidden"
          bgColor="white"
          bgBlendMode="lighten"
          shadow="dark-lg"
          pos="relative"
        >
          {layers.map((layer) => {
            const LayerCMP = LAYERS[layer.type];
            return (
              <LayerCMP
                gestureContainer={target}
                id={layer.id}
                key={layer.id}
                onMouseDownCapture={() => selectLayer(layer.id)}
                onTouchStartCapture={() => selectLayer(layer.id)}
              >
                {/* <Img
                  style={{ touchAction: "none", pointerEvents: "none" }}
                  src={img}
                /> */}
              </LayerCMP>
            );
          })}
        </Box>
      </Box>
      <HStack pos="sticky" bottom={0} zIndex={3} justify="center">
        {transitions.map((style, i) => (
          <animated.div style={style}>{elements[i]}</animated.div>
        ))}
      </HStack>
    </Stack>
  );
};
