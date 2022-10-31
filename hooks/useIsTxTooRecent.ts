import { useEffect, useMemo, useState } from 'react';
import { useBlockchainStore } from '../stores/blockchain';
import { useProvider } from './useProvider';

export const MIN_BLOCK_CONFIRMATIONS = 30;

export const useIsTxTooRecent = (hash: string | undefined) => {
  const mainnetBlockNumber = useBlockchainStore((s) => s.mainnetBlockNumber);
  const provider = useProvider();
  const [minedBlockNumber, setMinedBlockNumber] = useState(Infinity);

  useEffect(() => {
    if (!hash) {
      return;
    }
    if (!provider) {
      return;
    }
    provider.getTransaction(hash).then((t: any) => {
      setMinedBlockNumber(t.blockNumber ?? Infinity);
    });
  }, [provider, hash]);

  return useMemo(
    () =>
      !!mainnetBlockNumber &&
      mainnetBlockNumber - minedBlockNumber <= MIN_BLOCK_CONFIRMATIONS,
    [minedBlockNumber, mainnetBlockNumber],
  );
};
