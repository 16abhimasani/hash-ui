import { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { ROUTES } from '../constants/routes';
import { useBlockchainStore } from '../stores/blockchain';
import { useCollectionsStore } from '../stores/collections';
import { fetcher } from '../utils/fetcher';
import { ADDRESS_REGEX } from '../utils/regex';

export const useAccountCollection = (account?: string) => {
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const { data } = useSWR(
    useMemo(
      () =>
        !!account && ADDRESS_REGEX.test(account)
          ? `${ROUTES.API.COLLECTION.INDEX}?id=account&owner=${account}&blockNum=${blockNumber}`
          : null,
      [account, blockNumber],
    ),
    fetcher,
    {},
  );
  const updateCollectionHashesMap = useCollectionsStore(
    (s) => s.updateCollectionHashesMap,
  );
  useEffect(() => {
    if (!data || !account) {
      return;
    }
    updateCollectionHashesMap((update) => {
      update[account] = data.hashOrIds;
    });
  }, [data, account, updateCollectionHashesMap]);
};
