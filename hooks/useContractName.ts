import { useMemo } from 'react';
import useSWR from 'swr';
import { ROUTES } from '../constants/routes';
import { fetcher } from '../utils/fetcher';

export const useContractName = (address?: string) => {
  const key = useMemo(
    () =>
      !!address ? `${ROUTES.API.PROXY.ADDRESS_NAME}?address=${address}` : null,
    [address],
  );
  const { data, error } = useSWR(key, fetcher, {});
  return useMemo(() => {
    if (!address || !data) {
      return undefined;
    }
    if (data.name === '') {
      return undefined;
    }
    return data.name as string | undefined;
  }, [data, address]);
};
