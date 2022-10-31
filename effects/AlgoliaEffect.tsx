import { FC, useEffect } from 'react';
import algoliasearchinsights from 'search-insights';
import { usePriorityAccount } from '../connectors/priority';
import { ALGOLIA_API_CLIENT_ID, ALGOLIA_API_KEY } from '../constants';

algoliasearchinsights('init', {
  appId: ALGOLIA_API_CLIENT_ID,
  apiKey: ALGOLIA_API_KEY,
});

export const AlgoliaEffect: FC = ({}) => {
  const account = usePriorityAccount();
  useEffect(() => {
    if (!account) {
      return;
    }
    algoliasearchinsights('setUserToken', account);
  }, [account]);
  return <></>;
};
