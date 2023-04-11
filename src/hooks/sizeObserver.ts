import { useEffect, useLayoutEffect, useRef } from "react";

type Callback = () => void;

export const useOnResize = (
  targetRef: React.MutableRefObject<HTMLElement | null>,
  callback: Callback
) => {
  const observerRef = useRef<ResizeObserver | null>(null);

  useLayoutEffect(() => {
    if (!targetRef.current || !window.ResizeObserver) {
      return;
    }

    const observer = new window.ResizeObserver(() => {
      callback();
    });

    observer.observe(targetRef.current);
    observerRef.current = observer;

    return () => {
      observerRef.current?.disconnect();
    };
  }, [callback, targetRef]);

  return observerRef;
};
