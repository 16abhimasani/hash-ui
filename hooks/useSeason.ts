import { CURRENT_SEASON, getSeasonFromTokenId } from '@hash/seasons';
import { useMemo } from 'react';
import { useTokenId } from './useTokenId';

export const useSeasonFromTokenId = (tokenId: string | undefined | null) => {
  return useMemo(() => {
    if (!tokenId) {
      return CURRENT_SEASON;
    }
    return getSeasonFromTokenId(tokenId);
  }, [tokenId]);
};

export const useSeasonFromHash = (hash: string | undefined) => {
  const tokenId = useTokenId(hash);
  return useMemo(() => {
    if (tokenId === undefined) {
      return undefined;
    }
    if (tokenId === null) {
      return CURRENT_SEASON;
    }
    return getSeasonFromTokenId(tokenId);
  }, [tokenId]);
};
