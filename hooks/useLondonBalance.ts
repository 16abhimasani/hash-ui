import { gql, useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { londonSubgraphClient } from '../clients/subgraph';
import { useBlockchainStore } from '../stores/blockchain';
import { getBlockNumFromStoreWithDelay } from '../utils/blockNum';
import { useLastTruthyValue } from './useLastTruthyValue';

const GET_LONDON_BALANCE_BY_ADDRESS_BLOCK_BASED_QUERY = gql`
  query GetLondonBalance($address: String!, $blockNum: Int!) {
    tokenOwnership(id: $address, block: { number: $blockNum }) {
      id
      quantity
    }
  }
`;

export const useLondonBalance = (address: string | undefined | null) => {
  const blockNum = useBlockchainStore(getBlockNumFromStoreWithDelay);

  const results = useQuery(GET_LONDON_BALANCE_BY_ADDRESS_BLOCK_BASED_QUERY, {
    variables: { address, blockNum },
    client: londonSubgraphClient,
  });

  const data = useLastTruthyValue(results.data);

  return useMemo(() => {
    if (!address) {
      return false;
    }
    if (!data) {
      return false;
    }
    if (!data.tokenOwnership) {
      return false;
    }
    return true;
  }, [address, data]);
};
