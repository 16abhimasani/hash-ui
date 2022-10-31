import { useMemo } from 'react';
import useSWR from 'swr';
import { NULL_ADDRESS } from '../constants';
import { ROUTES } from '../constants/routes';
import { useTransactionsStore } from '../stores/transaction';
import { fetcher } from '../utils/fetcher';
import { useTokenId } from './useTokenId';

export const useOwnerByTokenId = (tokenId: string | undefined) => {
  const transactionMap = useTransactionsStore((s) => s.transactionMap);
  // const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const { data } = useSWR(
    useMemo(
      () =>
        !!tokenId ? `${ROUTES.API.PROXY.OWNERS}?&tokenIds=${tokenId}` : null,
      [tokenId, transactionMap],
    ),
    fetcher,
  );

  return useMemo(() => {
    if (!data || !tokenId) {
      return undefined;
    }
    if (!data.owners) {
      return undefined;
    }
    if (data.owners[tokenId] === NULL_ADDRESS) {
      return null;
    }
    return data.owners[tokenId] as string;
  }, [data, tokenId]);
};

export const useOwnerByHash = (hash: string | undefined) => {
  const tokenId = useTokenId(hash);
  return useOwnerByTokenId(tokenId ?? undefined);
};

export const useIsOwnerOfHash = (
  account: string | null | undefined,
  hash: string,
) => {
  const hashOwner = useOwnerByHash(hash);
  return useMemo(() => {
    if (!account || !hash || !hashOwner) {
      return false;
    }
    return account.toLowerCase() === hashOwner.toLowerCase();
  }, [account, hash, hashOwner]);
};
