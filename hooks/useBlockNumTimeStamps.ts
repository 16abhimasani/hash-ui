import { useMemo } from 'react';
import useSWR from 'swr';
import { ROUTES } from '../constants/routes';
import { fetcher } from '../utils/fetcher';

export const useBlockNumTimeStamps = (blockNums: number[] | undefined) => {
  const { data } = useSWR(
    useMemo(
      () =>
        !!blockNums && blockNums.length !== 0
          ? `${ROUTES.API.PROXY.TIME_STAMP}?blockNums=${blockNums.join(',')}`
          : null,
      [blockNums],
    ),
    fetcher,
  );

  return useMemo(() => {
    if (!data) {
      return undefined;
    }
    if (!data.blockNumToTimeStamp) {
      return undefined;
    }
    return data.blockNumToTimeStamp as { [n: number]: number };
  }, [data, blockNums]);
};
