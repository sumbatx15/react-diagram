import { FC } from "react";
import { useFullscreen, useToggle } from "react-use";

interface FullscreenBtnProps {
  target: React.RefObject<Element>;
}

export const FullscreenBtn: FC<FullscreenBtnProps> = ({ target, ...props }) => {
  const [show, toggle] = useToggle(false);
  const isFullscreen = useFullscreen(target, show, {
    onClose: () => toggle(false),
  });
  return (
    <button onClick={() => toggle(!show)} {...props}>
      Fullscreen
    </button>
  );
};
