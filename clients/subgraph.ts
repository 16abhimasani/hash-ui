import { ApolloClient, InMemoryCache } from '@apollo/client';
import {
  CHAIN_ID,
  LONDON_SUBGRAPH_LINK,
  LONDON_TEST_SUBGRAPH_LINK,
  POB_SUBGRAPH_LINK,
  POB_TEST_SUBGRAPH_LINK,
} from '../constants';

export const pobSubgraphClient = new ApolloClient({
  uri: CHAIN_ID === 1 ? POB_SUBGRAPH_LINK : POB_TEST_SUBGRAPH_LINK,
  cache: new InMemoryCache(),
});

export const londonSubgraphClient = new ApolloClient({
  uri: CHAIN_ID === 1 ? LONDON_SUBGRAPH_LINK : LONDON_TEST_SUBGRAPH_LINK,
  cache: new InMemoryCache(),
});
