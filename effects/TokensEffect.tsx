import { CURRENT_TOKEN_TYPE, DEFAULT_MINTING_STATE } from '@hash/seasons';
import { FC, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { ROUTES } from '../constants/routes';
import { useMintingState } from '../hooks/useMintingState';
import { useBlockchainStore } from '../stores/blockchain';
import { useSeasonStore } from '../stores/season';
import { fetcher } from '../utils/fetcher';

export const TokensEffect: FC = () => {
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const setSupply = useSeasonStore((s) => s.setSupply);

  const mintingState = useMintingState();

  const { data: maxIndexMapData } = useSWR(
    useMemo(
      () =>
        DEFAULT_MINTING_STATE === 'live' ||
        DEFAULT_MINTING_STATE === 'pre-reveal'
          ? `${ROUTES.API.PROXY.MAX_INDEX}?blockNum=${blockNumber}}&tokenType=${CURRENT_TOKEN_TYPE}`
          : null,
      [blockNumber, mintingState],
    ),
    fetcher,
  );

  useEffect(() => {
    if (!maxIndexMapData || !maxIndexMapData.maxIndexMap) {
      return;
    }
    const { maxIndexMap } = maxIndexMapData;
    setSupply(CURRENT_TOKEN_TYPE, maxIndexMap[CURRENT_TOKEN_TYPE]);
  }, [maxIndexMapData]);
  return null;
};
