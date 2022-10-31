import { useMemo } from 'react';
import { getMintPrice } from '../utils/getMintPrice';

export const useMintPrice = (tokenId?: string) => {
  return useMemo(() => {
    if (!tokenId) {
      return undefined;
    }
    return getMintPrice(tokenId);
  }, [tokenId]);
};
