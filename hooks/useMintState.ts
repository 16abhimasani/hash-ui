import { useMemo } from 'react';
import { useTokenId } from './useTokenId';

export type MintState = 'mintable' | 'owned' | 'no-more-editions';

export const useMintState = (hash: string | undefined): MintState => {
  const tokenId = useTokenId(hash);

  return useMintStateByTokenId(tokenId ?? undefined);
};

export const useMintStateByTokenId = (
  tokenId: string | undefined,
): MintState => {
  return useMemo(() => {
    if (!!tokenId) {
      return 'owned';
    }
    // if (
    //   maxIndexMap.personal < MAX_MINTING_SUPPLY.personal ||
    //   maxIndexMap.historic < MAX_MINTING_SUPPLY.historic
    // ) {
    //   return 'mintable';
    // }
    return 'no-more-editions';
  }, [tokenId]);
};
