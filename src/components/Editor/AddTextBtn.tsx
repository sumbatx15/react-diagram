import {
  Icon,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@chakra-ui/react";
import { FC, useState } from "react";
import { BsTextareaT } from "react-icons/bs";
import { useDebounce } from "react-use";
import { usePotrace } from "../../queries/potrace";
import {
  createLayer,
  defaultPotraceOptions,
  useLayers,
} from "../../store/layers";

export const AddTextBtn: FC = () => {
  const layer = useLayers((state) => state.getSelectedLayer());
  const addText = () => {
    useLayers.getState().addLayer(
      createLayer({
        type: "text",
        content: "Text",
        src: "",
      })
    );
  };

  return (
    <IconButton
      size="lg"
      aria-label="contrast"
      icon={<Icon as={BsTextareaT} />}
      onClick={addText}
    />
  );
};
