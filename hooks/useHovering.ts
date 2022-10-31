import { useCallback, useState } from 'react';

export const useHovering = () => {
  const [hovering, setHovering] = useState(false);
  const mouseEnter = useCallback(() => {
    setHovering(true);
  }, []);
  const mouseLeave = useCallback(() => {
    setHovering(false);
  }, []);
  const linkWhenHovering = useCallback(
    (href: string) => {
      return hovering ? `javascript:void(0)` : `${href}`;
    },
    [hovering],
  );
  const callWhenNotHovering = useCallback(
    (func: () => any) => {
      if (!hovering) {
        func();
      }
    },
    [hovering],
  );
  return {
    hovering,
    mouseEnter,
    mouseLeave,
    linkWhenHovering,
    callWhenNotHovering,
  };
};
