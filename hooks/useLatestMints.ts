import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import {
  GET_LATEST_MINTS_BY_BLOCK_BASED_QUERY,
  LATEST_MINTED_HASH_TYPE,
} from '../queries';
import { useBlockchainStore } from '../stores/blockchain';
import { getBlockNumFromStoreWithDelay } from '../utils/blockNum';
import { useLastTruthyValue } from './useLastTruthyValue';

export const useLatestMints = () => {
  const blockNum = useBlockchainStore(getBlockNumFromStoreWithDelay);

  const results = useQuery(GET_LATEST_MINTS_BY_BLOCK_BASED_QUERY, {
    variables: { blockNum },
  });

  const data = useLastTruthyValue(results.data);

  return useMemo(() => {
    if (!data) {
      return undefined;
    }
    if (!data.hashes) {
      return undefined;
    }
    if (data.hashes.length === 0) {
      return undefined;
    }
    return data.hashes.map((hash: LATEST_MINTED_HASH_TYPE) => hash?.hash);
  }, [data]);
};
