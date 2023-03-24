import { Text } from "@chakra-ui/react";
import { FC } from "react";
import { useLayers } from "../../store/layers";
import { Layer, LayerProps } from "./Layer";

export const TextLayer: FC<LayerProps> = (props) => {
  const updateLayer = useLayers((state) =>
    state.updateLayer.bind(null, props.id)
  );

  const layer = useLayers((state) => state.getLayer(props.id));
  const updateText = (ev: React.FormEvent<HTMLDivElement>) => {
    updateLayer({ content: (ev.target as HTMLInputElement).value });
  };

  return (
    <Layer {...props}>
      <Text
        spellCheck={false}
        color="black"
        contentEditable
        onInput={updateText}
        fontWeight="bold"
      >
        {layer?.content}
      </Text>
    </Layer>
  );
};
