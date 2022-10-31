import { useEffect } from 'react';
import { usePriorityAccount } from '../connectors/priority';
export const useViewedPage = (hash: string | undefined) => {
  const account = usePriorityAccount();
  useEffect(() => {
    if (!account || !hash) {
      return;
    }
    // algoliasearchinsights('clickedObjectIDs', {
    //   index: ALGOLIA_HASH_INDEX,
    //   eventName: 'View',
    //   objectIDs: [hash],
    //   userToken: account,
    // });
  }, [account]);
};
