import {
  CURRENT_TOKEN_TYPE,
  DEFAULT_MINTING_STATE,
  MintingState,
  TOKEN_TYPE_TO_MAX_SUPPLY,
  TOKEN_TYPE_TO_REVEAL_BLOCK_NUM,
} from '@hash/seasons';
import { useMemo } from 'react';
import { useBlockchainStore } from '../stores/blockchain';
import { useSeasonStore } from '../stores/season';

export const useMintingState = () => {
  const blockNum = useBlockchainStore((s) => s.blockNumber);
  const tokenSupply = useSeasonStore(
    (s) => s.tokenTypeToSupply[CURRENT_TOKEN_TYPE],
  );
  return useMemo((): MintingState => {
    const isMintingActive =
      TOKEN_TYPE_TO_REVEAL_BLOCK_NUM[CURRENT_TOKEN_TYPE] !== 0 &&
      !!blockNum &&
      blockNum > TOKEN_TYPE_TO_REVEAL_BLOCK_NUM[CURRENT_TOKEN_TYPE];
    const isStillToMint =
      tokenSupply !== undefined &&
      tokenSupply < TOKEN_TYPE_TO_MAX_SUPPLY[CURRENT_TOKEN_TYPE];
    if (isMintingActive && isStillToMint) {
      return 'live';
    }
    if (!isMintingActive) {
      return 'pre-reveal';
    }
    if (!isStillToMint) {
      return 'sold-out';
    }
    return DEFAULT_MINTING_STATE;
  }, [blockNum, tokenSupply]);
};
