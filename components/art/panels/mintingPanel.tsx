import {
  CURRENT_SEASON,
  CURRENT_TOKEN_TYPE,
  TOKEN_TYPE_TO_MAX_SUPPLY,
  TOKEN_TYPE_TO_PRICING_FUNCTION,
  TOKEN_TYPE_TO_REVEAL_BLOCK_NUM,
} from '@hash/seasons';
import { ethers } from 'ethers';
import Link from 'next/link';
import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { WHAT_IS_ALL_NONSENSE_LINK_HUNT } from '../../../constants';
import { ROUTES } from '../../../constants/routes';
import { useHashByContext } from '../../../contexts/token';
import { useMintByFlatPrice } from '../../../hooks/useFlatPriceMinter';
import { useMintingState } from '../../../hooks/useMintingState';
import { useBlockchainStore } from '../../../stores/blockchain';
import { useSeasonStore } from '../../../stores/season';
import { formatDecimalNumber } from '../../../utils/string';
import { FlexEnds } from '../../flex';
import { Label } from '../../text';
import { AddressPill } from '../../web3Status';
import {
  PanelContainer,
  PanelContentContainer,
  PanelLineSeparator,
  PrimaryRowActionButton,
  SecondaryRowActionButton,
} from './panel';
import { SoldOutPanel } from './soldOutPanel';

const PriceText = styled.h1`
  padding: 0;
  margin: 0;
  font-family: Helvetica Neue;
  font-style: normal;
  font-weight: 500;
  font-size: 30px;
  line-height: 37px;
  color: #000000;
`;

const ProgressBarContainer = styled.div<{ percentage: number }>`
  position: relative;
  background: #e1e1e1;
  border-radius: 9999px;
  height: 6px;
  width: 100%;
  ::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    height: 6px;
    background: #000;
    border-radius: 9999px;
    width: ${(p) => Math.round(p.percentage * 100)}%;
  }
`;

const ProgressBar: FC<{ numMinted: number; supply: number }> = ({
  numMinted,
  supply,
}) => {
  return (
    <div>
      <FlexEnds style={{ marginBottom: 10 }}>
        <Label>Supply</Label>
        <Label style={{ color: 'black', fontWeight: 'bold' }}>
          {`${numMinted} / ${supply} minted`}
        </Label>
      </FlexEnds>
      <ProgressBarContainer percentage={numMinted / supply} />
    </div>
  );
};

const PrerevealPanel: FC = () => {
  const mintingState = useMintingState();
  console.log(mintingState);

  const blockNumber = useBlockchainStore((s) => s.blockNumber);

  const mintingPrice = useMemo(() => {
    return TOKEN_TYPE_TO_PRICING_FUNCTION[CURRENT_TOKEN_TYPE](0);
  }, []);

  const numBlocksLeftToMint = useMemo(() => {
    if (!blockNumber) {
      return undefined;
    }
    return TOKEN_TYPE_TO_REVEAL_BLOCK_NUM[CURRENT_TOKEN_TYPE] - blockNumber;
  }, [blockNumber]);

  return (
    <PanelContainer>
      <PanelContentContainer>
        <FlexEnds>
          <Label style={{}}>Mint Price</Label>
          <Link href={ROUTES.FAQ} passHref>
            <AddressPill style={{ textDecoration: 'none' }} as={'a'}>
              PRE-MINTING
            </AddressPill>
          </Link>
        </FlexEnds>
        <PriceText style={{ marginTop: 12, marginBottom: 24 }}>
          {formatDecimalNumber(ethers.utils.formatEther(mintingPrice))} ETH
        </PriceText>
        <ProgressBar
          numMinted={0}
          supply={TOKEN_TYPE_TO_MAX_SUPPLY[CURRENT_TOKEN_TYPE]}
        />
        <PanelLineSeparator />
        <PrimaryRowActionButton
          target={'_blank'}
          as={'a'}
          href={WHAT_IS_ALL_NONSENSE_LINK_HUNT}
          style={{ textDecoration: 'none', marginBottom: 12 }}
        >
          Learn More about {CURRENT_SEASON}
        </PrimaryRowActionButton>
        <PrimaryRowActionButton disabled>
          Minting starts in {numBlocksLeftToMint ?? '-'} blocks
        </PrimaryRowActionButton>
      </PanelContentContainer>
    </PanelContainer>
  );
};

const MintPanel: FC = () => {
  const txHash = useHashByContext();

  const tokenIndex = useSeasonStore(
    (s) => s.tokenTypeToSupply[CURRENT_TOKEN_TYPE],
  );

  const { mint, txStatus, isLoading, error } = useMintByFlatPrice(
    useMemo(() => (!!txHash ? [txHash] : undefined), [txHash]),
  );

  const mintingPrice = useMemo(() => {
    return TOKEN_TYPE_TO_PRICING_FUNCTION[CURRENT_TOKEN_TYPE](0);
  }, []);

  const buttonText = useMemo(() => {
    if (isLoading || txStatus === 'in-progress') {
      return 'Minting...';
    }
    if (txStatus === 'failed' || !!error) {
      return 'Error. Try Again?';
    }
    if (txStatus === 'success') {
      return 'Minted';
    }
    return `Mint HASH`;
  }, [isLoading, txStatus, error]);

  const isButtonDisabled = useMemo(() => {
    return isLoading || txStatus === 'in-progress' || txStatus === 'success';
  }, [isLoading, txStatus]);

  return (
    <PanelContainer>
      <PanelContentContainer>
        <FlexEnds>
          <Label style={{}}>Mint Price</Label>
        </FlexEnds>
        <PriceText style={{ marginTop: 12, marginBottom: 24 }}>
          {formatDecimalNumber(ethers.utils.formatEther(mintingPrice))} ETH
        </PriceText>
        <ProgressBar
          numMinted={tokenIndex}
          supply={TOKEN_TYPE_TO_MAX_SUPPLY[CURRENT_TOKEN_TYPE]}
        />
        <PanelLineSeparator />
        <PrimaryRowActionButton onClick={mint} disabled={isButtonDisabled}>
          {buttonText}
        </PrimaryRowActionButton>
        <SecondaryRowActionButton
          target={'_blank'}
          as={'a'}
          href={WHAT_IS_ALL_NONSENSE_LINK_HUNT}
          style={{ textDecoration: 'none', marginTop: 12 }}
        >
          Learn More about {CURRENT_SEASON}
        </SecondaryRowActionButton>
      </PanelContentContainer>
    </PanelContainer>
  );
};

export const MintingPanel: FC = () => {
  const mintingState = useMintingState();

  if (mintingState === 'sold-out') {
    return <SoldOutPanel />;
  }

  if (mintingState === 'live') {
    return <MintPanel />;
  }

  return <PrerevealPanel />;
};
