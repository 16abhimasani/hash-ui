import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

interface RefSize {
  width: number;
  height: number;
  left: number;
  top: number;
  parent: Element | null;
}

export const useRefSize = (ref: React.RefObject<HTMLElement>): RefSize => {
  const getSize = (el: HTMLElement | null) => {
    return {
      width: el?.offsetWidth || 0,
      height: el?.offsetHeight || 0,
      left: el?.offsetLeft || 0,
      top: el?.offsetTop || 0,
      parent: el?.offsetParent || null,
    };
  };
  const isClient = typeof window === 'object';
  const [RefSize, setRefSize] = useState(getSize(ref ? ref.current : null));
  const useIsomorphicLayoutEffect = isClient ? useLayoutEffect : useEffect;

  const handleResize = useCallback(() => {
    if (ref.current) {
      setRefSize(getSize(ref.current));
    }
  }, [ref]);

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;
    if (!isClient) return;
    handleResize();
    const ResizeObserver = window?.ResizeObserver;
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, [ref.current]);

  return RefSize;
};
