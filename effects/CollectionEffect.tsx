import { FC, useCallback, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { MIN_BLOCK_CONFIRMATIONS } from '../constants';
import { ROUTES } from '../constants/routes';
import { useBlockchainStore } from '../stores/blockchain';
import { useCollectionsStore } from '../stores/collections';
import { fetcher } from '../utils/fetcher';

export const CollectionEffect: FC = () => {
  // value scaled back for min block confirmations needed
  const mainnetBlockNumber = useBlockchainStore((s) =>
    !!s.mainnetBlockNumber
      ? s.mainnetBlockNumber - MIN_BLOCK_CONFIRMATIONS
      : undefined,
  );

  const updateCollectionHashesMap = useCollectionsStore(
    (s) => s.updateCollectionHashesMap,
  );

  // gas-station
  const gasStationHashes = useCollectionsStore(
    useCallback((state) => state.collectionHashesMap['gas-station'] ?? [], []),
  );
  const gasStationNumTx = useMemo(() => {
    if (gasStationHashes.length > 25) {
      return 2;
    }
    if (gasStationHashes.length > 50) {
      return 1;
    }
    return 4;
  }, [gasStationHashes]);
  const { data: gasStationData } = useSWR(
    useMemo(
      () =>
        `${ROUTES.API.COLLECTION.INDEX}?id=gas-station&blockNum=${mainnetBlockNumber}&numTx=${gasStationNumTx}`,
      [mainnetBlockNumber],
    ),
    fetcher,
  );

  useEffect(() => {
    if (!gasStationData) {
      return;
    }
    updateCollectionHashesMap((update) => {
      update['gas-station'] = (update['gas-station'] ?? []).concat(
        gasStationData.hashes,
      );
    });
  }, [gasStationData, updateCollectionHashesMap]);

  return <></>;
};
