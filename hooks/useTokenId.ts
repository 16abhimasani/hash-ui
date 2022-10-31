import { useMemo } from 'react';
import useSWR from 'swr';
import { ROUTES } from '../constants/routes';
import { useBlockchainStore } from '../stores/blockchain';
import { useTransactionsStore } from '../stores/transaction';
import { fetcher } from '../utils/fetcher';

// export const useTokenId = (hash: string | undefined) => {
//   const blockNum = useBlockchainStore(getBlockNumFromStoreWithDelay);
//   const results = useQuery(GET_TOKEN_METADATA_BY_HASH_BLOCK_BASED_QUERY, {
//     variables: {
//       hash,
//       blockNum,
//     },
//   });

//   const data = useLastTruthyValue(results.data);

//   return useMemo(() => {
//     if (!hash) {
//       return undefined;
//     }
//     if (!data) {
//       return undefined;
//     }
//     if (!data.hashes) {
//       return undefined;
//     }
//     if (!data.hashes[0]) {
//       return undefined;
//     }
//     return data.hashes[0].id as string;
//   }, [hash, data]);
// };

export const useTokenId = (hash: string | undefined) => {
  const { data } = useSWR(
    useMemo(
      () => (!!hash ? `${ROUTES.API.PROXY.TOKEN_ID}?hash=${hash}` : null),
      [hash],
    ),
    fetcher,
  );

  return useMemo(() => {
    if (!data || !hash) {
      return undefined;
    }
    if (!data.tokenId) {
      return null;
    }
    return data.tokenId as string;
  }, [data, hash]);
};

export const useTokenIds = (hashes: string[] | undefined) => {
  const transactionMap = useTransactionsStore((s) => s.transactionMap);
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const { data } = useSWR(
    useMemo(
      () =>
        !!hashes && hashes.length != 0
          ? `${ROUTES.API.PROXY.TOKEN_IDS}?&hashes=${hashes.join(',')}`
          : null,
      [hashes, transactionMap, blockNumber],
    ),
    fetcher,
  );

  return useMemo(() => {
    if (!data || !hashes) {
      return undefined;
    }
    if (!data.tokenIds) {
      return {};
    }
    return data.tokenIds as { [key: string]: string };
  }, [data]);
};
