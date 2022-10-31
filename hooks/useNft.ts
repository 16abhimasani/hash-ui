import { useMemo } from 'react';
import useSWR from 'swr';
import { ROUTES } from '../constants/routes';
import { fetcher } from '../utils/fetcher';

export const useNftMetadata = (
  address: string | undefined,
  tokenId: string | undefined,
) => {
  const { data } = useSWR(
    useMemo(
      () =>
        !!tokenId && !!address
          ? `${ROUTES.API.OPENSEA.METADATA}?address=${address}&id=${tokenId}`
          : null,
      [tokenId, address],
    ),
    fetcher,
    {},
  );

  const { data: alchemyData } = useSWR(
    useMemo(
      () =>
        !!tokenId && !!address
          ? `${ROUTES.API.NFT.METADATA}?address=${address}&id=${tokenId}`
          : null,
      [tokenId, address],
    ),
    fetcher,
    {},
  );

  return useMemo(() => {
    const metadata = data?.metadata ?? alchemyData?.metadata;
    if (!metadata) {
      return undefined;
    }
    return metadata;
  }, [data, alchemyData]);
};

export const useNftContractMetadata = (address: string | undefined) => {
  const { data } = useSWR(
    useMemo(
      () =>
        !!address
          ? `${ROUTES.API.NFT.CONTRACT_METADATA}?address=${address}`
          : null,
      [address],
    ),
    fetcher,
    {},
  );

  return useMemo(() => {
    if (!data) {
      return undefined;
    }
    // console.log(data);

    if (!data.metadata) {
      return undefined;
    }
    return data.metadata;
  }, [data]);
};
