import { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { ROUTES } from '../constants/routes';
import { useBlockchainStore } from '../stores/blockchain';
import { useCollectionsStore } from '../stores/collections';
import { fetcher } from '../utils/fetcher';
import { ADDRESS_REGEX } from '../utils/regex';

export const useAccountMyTx = (account?: string) => {
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const { data } = useSWR(
    useMemo(
      () =>
        !!account && ADDRESS_REGEX.test(account)
          ? `${ROUTES.API.COLLECTION.INDEX}?id=my-txs&account=${account}&blockNum=${blockNumber}`
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
      update[`my-txs/${account}`] = data.hashes;
    });
  }, [data, updateCollectionHashesMap]);
};
