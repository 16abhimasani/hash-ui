import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

export const useIsHeaderTransparent = () => {
  const [isAtTop, setIsAtTop] = useState(false);

  useEffect(() => {
    const onScroll = (_: any) => {
      if (window.pageYOffset === 0) {
        setIsAtTop(true);
      } else {
        setIsAtTop(false);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const router = useRouter();
  return useMemo(() => {
    return (
      // router.pathname.includes('collection') ||
      // router.pathname.includes('art') ||
      // router.pathname.includes('explore') ||
      // router.pathname.includes('zine') ||
      // router.pathname.includes('historians')
      false && isAtTop
    );
  }, [router.pathname, isAtTop]);
};
