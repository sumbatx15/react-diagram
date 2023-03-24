import { Icon, IconButton, IconButtonProps } from "@chakra-ui/react";
import { FC } from "react";
import { MdFullscreenExit, MdFullscreen } from "react-icons/md";
import { useFullscreen, useToggle } from "react-use";

interface FullscreenBtnProps extends Omit<IconButtonProps, "aria-label"> {
  target: React.RefObject<Element>;
}

export const FullscreenBtn: FC<FullscreenBtnProps> = ({ target, ...props }) => {
  const [show, toggle] = useToggle(false);
  const isFullscreen = useFullscreen(target, show, {
    onClose: () => toggle(false),
  });
  return (
    <IconButton
      size="lg"
      aria-label="fullscreen"
      icon={<Icon as={isFullscreen ? MdFullscreenExit : MdFullscreen} />}
      onClick={() => toggle(!show)}
      {...props}
    />
  );
};
