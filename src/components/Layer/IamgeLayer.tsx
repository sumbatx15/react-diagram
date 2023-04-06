import { Box, Text } from "@chakra-ui/react";
import { FC } from "react";
import { useLayers } from "../../store/layersStore";
import { Layer, LayerProps } from "./Layer";

export const ImageLayer: FC<LayerProps> = (props) => {
  const updateLayer = useLayers((state) =>
    state.updateLayer.bind(null, props.id)
  );

  const layer = useLayers((state) => state.getLayer(props.id));

  return (
    <Layer {...props}>
      <Box dangerouslySetInnerHTML={{ __html: layer?.content }} />
    </Layer>
  );
};
