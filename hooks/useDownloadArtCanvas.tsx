import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { ROUTES } from '../constants/routes';
import { fetcher } from '../utils/fetcher';
import { useSeasonFromTokenId } from './useSeason';
import { useTokenId } from './useTokenId';

export const useDownloadArtCanvas = (seed: string | undefined) => {
  const tokenId = useTokenId(seed);
  const season = useSeasonFromTokenId(tokenId ?? undefined);
  const [canvasData, setCanvasData] = useState('');

  const { data: prerender } = useSWR(
    `${ROUTES.API.PRERENDER}/${season}?hash=${seed}`,
    fetcher,
  );
  const CanvasPayload = useMemo(() => {
    return {
      ...prerender,
      tokenId,
      multiplier: 1,
    };
  }, [prerender, tokenId]);

  const Canvas = useMemo(
    () => (
      <>
        {/* <CanvasWrapper
          dimensions={DIMENSIONS[season ?? DEFAULT_SEASON]}
        >
          {prerender && <SeasonCanvas prerenderPayload={CanvasPayload} />}
        </CanvasWrapper> */}
      </>
    ),
    [CanvasPayload, prerender, season],
  );

  useEffect(() => {
    if (process.browser) {
      const canvas = document?.getElementsByTagName('canvas')[
        0!
      ] as HTMLCanvasElement;
      setCanvasData(canvas?.toDataURL('image/png'));
    }
  }, [prerender, Canvas, process.browser]);

  return {
    Canvas,
    canvasData,
  };
};
