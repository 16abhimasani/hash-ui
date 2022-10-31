import {
  CURRENT_TOKEN_TYPE,
  TOKEN_TYPE_TO_PRICING_FUNCTION,
} from '@hash/seasons';
import { useCallback, useMemo, useState } from 'react';
import { usePriorityAccount } from '../connectors/priority';
import { ZERO } from '../constants';
import {
  useIsHashApprovedByContext,
  useTraderClientByContext,
} from '../contexts/trader';
import { useSeasonStore } from '../stores/season';
import { useTransactionsStore } from '../stores/transaction';
import { TransactionStatus } from '../types/transaction';
import { useFlatPriceMinterContract } from './useContracts';
import { useTxn } from './useTxn';

export const useMintByFlatPrice = (txHashes: string[] | null | undefined) => {
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const minter = useFlatPriceMinterContract();
  const account = usePriorityAccount();
  const [error, setError] = useState<any | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const isApproved = useIsHashApprovedByContext();

  const client = useTraderClientByContext();

  const tokenSupply = useSeasonStore(
    (s) => s.tokenTypeToSupply[CURRENT_TOKEN_TYPE],
  );

  const tx = useTxn(
    useMemo(
      () => ({
        txHashes: !!txHashes ? txHashes : [],
        type: 'token-minting',
      }),
      [txHashes],
    ),
  );

  const txStatus: TransactionStatus | undefined = useMemo(
    () => tx?.status,
    [tx],
  );

  const fullPrice = useMemo(() => {
    if (!txHashes) {
      return ZERO;
    }
    const currentIndex = tokenSupply ?? 0;
    return txHashes
      .map((_, i) =>
        TOKEN_TYPE_TO_PRICING_FUNCTION[CURRENT_TOKEN_TYPE](currentIndex + i),
      )
      .reduce((a, c) => a.add(c), ZERO);
  }, [txHashes, tokenSupply]);

  const mint = useCallback(async () => {
    if (!txHashes) {
      return;
    }
    if (!account) {
      return;
    }
    if (!minter) {
      return;
    }
    if (fullPrice.eq(ZERO)) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await minter.mintAndApprove(
        account,
        CURRENT_TOKEN_TYPE,
        txHashes,
        !isApproved && !!client?.exchangeProxy.address
          ? [client?.exchangeProxy.address]
          : [],
        {
          value: fullPrice,
        },
      );

      if (!!res) {
        addTransaction(res.hash, {
          type: 'token-minting',
          txHashes,
        });
        setError(undefined);
      }
    } catch (e) {
      console.error(e);
      setError(e);
    }
    setIsLoading(false);
  }, [minter, isApproved, setIsLoading, txHashes, account]);

  return useMemo(() => {
    return {
      error,
      tx,
      txStatus,
      mint,
      isLoading,
    };
  }, [isLoading, error, tx, txStatus, mint]);
};
