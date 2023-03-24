import { Icon, IconButton, IconButtonProps } from "@chakra-ui/react";
import { animated, useSpring } from "@react-spring/web";
import { FC } from "react";
import { TbTrashXFilled } from "react-icons/tb";
import { useFullscreen, useToggle } from "react-use";
import { useLayers } from "../../store/layers";
animated;
export const DeleteBtn: FC = () => {
  const layer = useLayers((state) => state.getSelectedLayer());
  const props = useSpring({
    from: {
      width: layer ? 0 : 50,
      opacity: layer ? 0 : 1,
      x: layer ? 50 : 0,
      scale: layer ? 0.5 : 1,
    },
    to: {
      width: layer ? 50 : 0,
      opacity: layer ? 1 : 0,
      x: layer ? 0 : 50,
      scale: layer ? 1 : 0.5,
    },
  });

  return (
    <animated.div style={props}>
      <IconButton
        isDisabled={!layer}
        size="lg"
        aria-label="fullscreen"
        icon={<Icon as={TbTrashXFilled} color="red.500" />}
        onClick={() => useLayers.getState().removeLayer(layer!.id)}
      />
    </animated.div>
  );
};
