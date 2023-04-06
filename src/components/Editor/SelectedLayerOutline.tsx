import { Box, Button } from "@chakra-ui/react";
import { animated } from "@react-spring/web";
import { memo, useCallback } from "react";
import { useLayers } from "../../store/layersStore";

export const SelectedLayerOutline = memo(() => {
  const selectedLayer = useLayers(
    useCallback((state) => state.getSelectedLayer(), [])
  );
  if (!selectedLayer) return null;

  return (
    <Box
      as={animated.div}
      pointerEvents="none"
      pos="absolute"
      zIndex={1}
      border="1px"
      borderStyle="dashed"
      borderColor="gray.500"
      // @ts-ignore
      style={selectedLayer}
    />
  );
});
