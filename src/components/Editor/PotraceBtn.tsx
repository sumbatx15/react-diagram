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
import { RiContrast2Line } from "react-icons/ri";
import { useDebounce } from "react-use";
import { usePotrace } from "../../queries/potrace";
import { defaultPotraceOptions, useLayers } from "../../store/layersStore";

export const PotraceBtn: FC = () => {
  const layer = useLayers((state) => state.getSelectedLayer());
  const [threshold, setThreshold] = useState(layer?.options?.threshold || 0);
  const potrace = usePotrace();

  useDebounce(
    () => {
      if (!layer) return;
      potrace.mutate(
        {
          buffer: layer.src,
          options: layer.options!,
        },
        {
          onSuccess: (svg) => {
            console.log("svg:", svg);
            useLayers.getState().updateLayer(layer.id, {
              ...layer,
              content: svg,
              options: {
                ...layer?.options,
                threshold: threshold,
              },
            });
          },
        }
      );
    },
    0,
    [threshold]
  );

  return (
    <Popover placement="top">
      <PopoverTrigger>
        <IconButton
          isDisabled={!layer}
          isLoading={potrace.isLoading}
          size="lg"
          aria-label="contrast"
          icon={<Icon as={RiContrast2Line} />}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody>
          <Slider
            aria-label="slider-ex-1 "
            min={0}
            max={255}
            value={layer?.options?.threshold || 0}
            onChange={(value) => {
              if (!layer) return;
              useLayers.getState().updateLayer(layer.id, {
                ...layer,
                options: {
                  ...layer?.options,
                  threshold: value,
                },
              });
              setThreshold(value);
            }}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
