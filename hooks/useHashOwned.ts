import { useMemo } from 'react';
import useSWR from 'swr';
import { ROUTES } from '../constants/routes';
import { AlchemyNftResponseData } from '../types/alchemy';
import { fetcher } from '../utils/fetcher';

export const useHashOwned = (owner: string): string[] | undefined => {
  const { data } = useSWR(
    useMemo(
      () => (!!owner ? `${ROUTES.API.NFT.HASH_OWNED}?owner=${owner}` : null),
      [owner],
    ),
    fetcher,
    {},
  );

  return useMemo(() => {
    if (!data) {
      return undefined;
    }
    const ownedNfts = data.ownedNfts;
    const flatHashTxs = ownedNfts.map((metadata: AlchemyNftResponseData) => {
      return metadata?.id?.hashTxn?.toLowerCase();
    });
    return flatHashTxs;
  }, [data]);
};
