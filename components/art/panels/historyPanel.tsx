import { format } from 'date-fns';
import { utils } from 'ethers';
import Link from 'next/link';
import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { ROUTES } from '../../../constants/routes';
import { useHashByContext } from '../../../contexts/token';
import { HashHistory, useHashHistory } from '../../../hooks/useHashHistory';
import { useUser } from '../../../hooks/useUser';
import { TradeDirection } from '../../../types/trader';
import { formatDecimalNumber } from '../../../utils/string';
import { getIpfsUrl } from '../../../utils/urls';
import { BaseAnchor, MonoAnchorWithIcon } from '../../anchor';
import { UserAvatar } from '../../avatar';
import { Flex, FlexCenter, FlexEnds } from '../../flex';
import { P, SpanBold, Text } from '../../text';
import { DetailsPanel } from './panel';

const HistoryContent = styled.div`
  > div + div {
    margin-top: 16px;
  }
`;

const HistoryContentRow = styled.div`
  ${P} {
    font-size: 13px;
  }
  ${Text} {
    font-size: 11px;
    margin-left: 2px;
  }
  ${SpanBold} {
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Anchor = styled(BaseAnchor)`
  text-decoration: none;
  display: flex;
  align-items: center;
`;

export const HistoryPanel: FC = () => {
  const hash = useHashByContext();
  const history = useHashHistory(hash ?? undefined);

  if (!hash) {
    return null;
  }

  return (
    <DetailsPanel title={'History'}>
      <HistoryContent>
        {history.length !== 0 &&
          history.map((h, i) => {
            return (
              <HistoryRow
                hash={hash}
                history={h}
                key={`history-content-row-${hash}-${i}`}
              />
            );
          })}
        {history.length === 0 && (
          <FlexCenter style={{ padding: '20px 0' }}>
            <P>No history yet.</P>
          </FlexCenter>
        )}
      </HistoryContent>
    </DetailsPanel>
  );
};

const ACTION_SENTENCE = {
  'minted': 'minted this HASH',
  'optimistic-metadata': 'annotated off-chain',
  'onchain-metadata': 'annotated on-chain',
  'optimistic-verdict': 'created verdict',
  'onchain-verdict': 'submitted verdict on-chain',
};

const StyledUserAvatar = styled(UserAvatar)`
  display: block;
  margin: 0;
  transform: none;
`;

const HistoryRow: FC<{
  currentContentHash?: string;
  hash: string;
  history: HashHistory;
}> = ({ hash, history, currentContentHash }) => {
  const author = useMemo(() => {
    if (history.type === 'minted') {
      return history.minter;
    }
    if (history.type === 'hash-filled-order') {
      return history.taker;
    }
    if (history.type === 'hash-made-order') {
      return history.maker;
    }
    return history.writer;
  }, [history]);

  const { bestName: name } = useUser(author) ?? {};

  const isViewLinkDisabled = useMemo(() => {
    if (
      history.type === 'onchain-metadata' ||
      history.type === 'optimistic-metadata' ||
      history.type === 'hash-filled-order' ||
      history.type === 'hash-made-order'
    ) {
      return false;
    }
    return true;
  }, [history]);

  const linkLabel = useMemo(() => {
    if (history.type === 'hash-filled-order') {
      return 'View Txn';
    }
    return 'View Pin';
  }, [history]);

  const linkHref = useMemo(() => {
    if (history.type === 'hash-filled-order') {
      return `https://etherscan.io/tx/${history.txHash}`;
    }
    return !!(history as any)?.contentHash
      ? getIpfsUrl((history as any)?.contentHash)
      : undefined;
  }, [history]);

  const actionSentence = useMemo(() => {
    if (
      history.type === 'hash-filled-order' &&
      history.direction === TradeDirection.SellNFT
    ) {
      return `bought for ${formatDecimalNumber(
        utils.formatEther(history.amount),
      )} ${history.amountSymbol}`;
    }
    if (
      history.type === 'hash-filled-order' &&
      history.direction === TradeDirection.BuyNFT
    ) {
      return `accepted offer for ${formatDecimalNumber(
        utils.formatEther(history.amount),
      )} ${history.amountSymbol}`;
    }
    if (
      history.type === 'hash-made-order' &&
      history.direction === TradeDirection.SellNFT
    ) {
      return `listed for ${formatDecimalNumber(
        utils.formatEther(history.amount),
      )} ${history.amountSymbol}`;
    }
    if (
      history.type === 'hash-made-order' &&
      history.direction === TradeDirection.BuyNFT
    ) {
      return `placed offer for ${formatDecimalNumber(
        utils.formatEther(history.amount),
      )} ${history.amountSymbol}`;
    }
    return (ACTION_SENTENCE as any)[history.type];
  }, [history]);

  return (
    <HistoryContentRow>
      <FlexEnds>
        <Flex>
          <StyledUserAvatar user={author} size={24} />
          <P style={{ paddingLeft: 6, color: 'black' }}>
            <Link href={`${ROUTES.USER}/${author}`} passHref>
              <SpanBold as="a" style={{ color: 'black' }}>
                {name}
              </SpanBold>
            </Link>{' '}
            {actionSentence}
          </P>
        </Flex>
        {!isViewLinkDisabled && (
          <>
            <MonoAnchorWithIcon
              href={linkHref}
              target={'_blank'}
              rel="noopener noreferrer"
            >
              {linkLabel}
            </MonoAnchorWithIcon>
          </>
        )}
      </FlexEnds>
      <P style={{ marginLeft: 30, marginTop: 4 }}>
        {history?.createdAt
          ? format(new Date(history.createdAt * 1000), 'MMMM d, y, hh:mm a')
          : '-'}
      </P>
    </HistoryContentRow>
  );
};
