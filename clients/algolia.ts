import algoliasearch from 'algoliasearch/lite';
import {
  ALGOLIA_API_CLIENT_ID,
  ALGOLIA_API_KEY,
  ALGOLIA_HASH_INDEX,
} from '../constants';

export const algoliaClient = algoliasearch(
  ALGOLIA_API_CLIENT_ID,
  ALGOLIA_API_KEY,
);

export const algoliaHashIndex = algoliaClient.initIndex(ALGOLIA_HASH_INDEX);
