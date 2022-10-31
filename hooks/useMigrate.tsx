import { useCallback, useMemo, useState } from 'react';
import { usePriorityAccount } from '../connectors/priority';
import {
  useIsHashApprovedByContext,
  useTraderClientByContext,
} from '../contexts/trader';
import { useTransactionsStore } from '../stores/transaction';
import { TransactionStatus } from '../types/transaction';
import { useHashV2Contract } from './useContracts';
import { useTxn } from './useTxn';

export const useMigrate = (tokenId: string | null | undefined) => {
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const hash = useHashV2Contract();
  const account = usePriorityAccount();
  const [error, setError] = useState<any | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const isApproved = useIsHashApprovedByContext();

  const client = useTraderClientByContext();
  const tx = useTxn(
    useMemo(
      () => ({
        tokenIds: !!tokenId ? [tokenId] : [],
        type: 'token-migrating',
      }),
      [tokenId],
    ),
  );

  const txStatus: TransactionStatus | undefined = useMemo(
    () => tx?.status,
    [tx],
  );

  const migrate = useCallback(async () => {
    if (!tokenId) {
      return;
    }
    if (!hash) {
      return;
    }
    if (!account) {
      return;
    }
    try {
      setIsLoading(true);
      const res = await hash.migrateAndApprove(
        account,
        [tokenId],
        !isApproved && !!client?.exchangeProxy.address
          ? [client?.exchangeProxy.address]
          : [],
      );
      if (!!res) {
        addTransaction(res.hash, {
          type: 'token-migrating',
          tokenIds: [tokenId],
        });
        setError(undefined);
      }
    } catch (e) {
      console.error(e);
      setError(e);
    }
    setIsLoading(false);
  }, [tokenId, client, isApproved, setIsLoading, hash, account]);

  return useMemo(() => {
    return {
      error,
      tx,
      txStatus,
      migrate,
      isLoading,
    };
  }, [isLoading, error, tx, txStatus, migrate]);
};
