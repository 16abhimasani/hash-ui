import { getSeasonNumFromTokenId } from '@hash/seasons';
import { useMemo } from 'react';
import useSWR from 'swr';
import { ROUTES } from '../constants/routes';
import { useTransactionsStore } from '../stores/transaction';
import { fetcher } from '../utils/fetcher';

export const useIsMigrated = (tokenId: string | undefined | null) => {
  const transactionMap = useTransactionsStore((s) => s.transactionMap);
  const { data } = useSWR(
    useMemo(
      () => (!!tokenId ? `${ROUTES.API.PROXY.MIGRATED}?&id=${tokenId}` : null),
      [tokenId, transactionMap],
    ),
    fetcher,
  );

  return useMemo(() => {
    if (!tokenId) {
      return undefined;
    }
    if ((getSeasonNumFromTokenId(tokenId) ?? 0) > 1) {
      return true;
    }
    if (!data) {
      return undefined;
    }
    if (data.isMigrated === undefined) {
      return undefined;
    }
    return data.isMigrated as boolean;
  }, [data, tokenId]);
};
