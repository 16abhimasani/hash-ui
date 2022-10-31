import { format } from 'date-fns';
import { BigNumber, utils } from 'ethers';
import { invert } from 'lodash';
import Link from 'next/link';
import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { usePriorityAccount } from '../../../connectors/priority';
import { ORDER_INFINITE_EXPIRY, TRADABLE_ASSETS } from '../../../constants';
import { ROUTES } from '../../../constants/routes';
import {
  useHashByContext,
  useIsMigratedByContext,
  useOwnerByContext,
  useTraderOrdersByContext,
} from '../../../contexts/token';
import { useIsHashApprovedByContext } from '../../../contexts/trader';
import {
  useTraderCancelOrder,
  useTraderFillOrder,
} from '../../../hooks/useTrader';
import { useUser } from '../../../hooks/useUser';
import { useModalStore } from '../../../stores/modal';
import {
  OrderStatus,
  SignedOrderWithCidAndOrderStatus,
} from '../../../types/trader';
import { formatDecimalNumber, lowerCaseCheck } from '../../../utils/string';
import { getTotalErc20AmountInOrder } from '../../../utils/trader';
import { BaseAnchor } from '../../anchor';
import { UserAvatar } from '../../avatar';
import { PrimaryButton, SecondaryButton } from '../../button';
import { Flex, FlexEnds } from '../../flex';
import { P, SpanBold, Text } from '../../text';
import { DetailsPanel } from './panel';

const OffersContent = styled.div`
  > div + div {
    margin-top: 16px;
  }
`;

const OfferContentRow = styled('div')`
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

const SmallPrimaryActionButton = styled(PrimaryButton)`
  padding: 6px 8px;
  font-size: 10px;
  line-height: 12px;
  height: 24px;
`;

const SmallSecondaryActionButton = styled(SecondaryButton)`
  padding: 6px 8px;
  font-size: 10px;
  line-height: 12px;
  height: 24px;
`;

export const OffersPanel: FC<{ setIsMigrateOpen: (b: boolean) => void }> = ({
  setIsMigrateOpen,
}) => {
  const hash = useHashByContext();
  const orders = useTraderOrdersByContext();

  if (!hash || !orders || !orders?.offers || orders?.offers.length === 0) {
    return null;
  }

  return (
    <DetailsPanel title={'Offers'} defaultIsExpanded={true}>
      <OffersContent>
        {orders.offers.map((o, i) => {
          return (
            <OfferRow
              setIsMigrateOpen={setIsMigrateOpen}
              {...o}
              key={`history-content-row-${hash}-${i}`}
            />
          );
        })}
      </OffersContent>
    </DetailsPanel>
  );
};

const StyledUserAvatar = styled(UserAvatar)`
  display: block;
  margin: 0;
  transform: none;
`;

const CancelOrderButton: FC<SignedOrderWithCidAndOrderStatus> = (order) => {
  const { cancel, txStatus, error, isLoading } = useTraderCancelOrder(order);

  const buttonText = useMemo(() => {
    if (isLoading || txStatus === 'in-progress') {
      return 'Canceling...';
    }
    if (txStatus === 'failed' || !!error) {
      return 'Cancel';
    }
    if (txStatus === 'success') {
      return 'Canceled';
    }
    return `Cancel`;
  }, [isLoading, txStatus, error]);

  const disabled = useMemo(() => {
    return isLoading || txStatus === 'in-progress' || txStatus === 'success';
  }, [isLoading, txStatus]);

  // if (isLoading || txStatus === 'in-progress') {
  //   return <SpinnerIcon/>
  // }

  return (
    <SmallSecondaryActionButton disabled={disabled} onClick={cancel}>
      {buttonText}
    </SmallSecondaryActionButton>
  );
};

const AcceptOrderButton: FC<
  SignedOrderWithCidAndOrderStatus & { setIsMigrateOpen: (b: boolean) => void }
> = ({ setIsMigrateOpen, ...order }) => {
  const { fill, txStatus, error, isLoading } = useTraderFillOrder(order);

  const buttonText = useMemo(() => {
    if (isLoading || txStatus === 'in-progress') {
      return 'Accepting...';
    }
    if (txStatus === 'failed' || !!error) {
      return 'Accept';
    }
    if (txStatus === 'success') {
      return 'Accepted';
    }
    return `Accept`;
  }, [isLoading, txStatus, error]);

  const disabled = useMemo(() => {
    return isLoading || txStatus === 'in-progress' || txStatus === 'success';
  }, [isLoading, txStatus]);

  const isApproved = useIsHashApprovedByContext();
  const isMigrated = useIsMigratedByContext();
  const toggleIsApproveModalOpen = useModalStore(
    (s) => s.toggleIsApproveModalOpen,
  );
  if (isMigrated === false) {
    return (
      <SmallPrimaryActionButton onClick={() => setIsMigrateOpen(true)}>
        Migrate to accept
      </SmallPrimaryActionButton>
    );
  }

  if (isApproved === false) {
    return (
      <SmallPrimaryActionButton onClick={() => toggleIsApproveModalOpen()}>
        Approve to accept
      </SmallPrimaryActionButton>
    );
  }

  return (
    <SmallPrimaryActionButton disabled={disabled} onClick={fill}>
      {buttonText}
    </SmallPrimaryActionButton>
  );
};

const OfferRow: FC<
  SignedOrderWithCidAndOrderStatus & { setIsMigrateOpen: (b: boolean) => void }
> = ({ setIsMigrateOpen, ...order }) => {
  const { maker, expiry, orderStatus, erc20Token } = order;

  const account = usePriorityAccount();
  const assetSymbol = useMemo(() => {
    return invert(TRADABLE_ASSETS)[erc20Token];
  }, [erc20Token]);

  const { bestName: name } = useUser(maker) ?? {};

  const owner = useOwnerByContext();

  const isAccountMaker = useMemo(
    () => lowerCaseCheck(maker, account),
    [maker, account],
  );
  const isAccountOwner = useMemo(
    () => lowerCaseCheck(account, owner),
    [account, owner],
  );

  if (!orderStatus) {
    return null;
  }

  if (orderStatus !== OrderStatus.Fillable) {
    return null;
  }

  return (
    <OfferContentRow>
      <FlexEnds>
        <Flex>
          <StyledUserAvatar user={maker} size={24} />
          <P style={{ paddingLeft: 6, color: 'black' }}>
            <Link href={`${ROUTES.USER}/${maker}`} passHref>
              <SpanBold as="a" style={{ color: 'black' }}>
                {name}
              </SpanBold>
            </Link>{' '}
            {`placed a bid of ${formatDecimalNumber(
              utils.formatEther(getTotalErc20AmountInOrder(order)),
            )} `}
            <strong>{assetSymbol}</strong>
          </P>
        </Flex>
        {isAccountMaker && <CancelOrderButton {...order} />}
        {isAccountOwner && (
          <AcceptOrderButton setIsMigrateOpen={setIsMigrateOpen} {...order} />
        )}
      </FlexEnds>
      <P style={{ marginLeft: 30, marginTop: 4 }}>
        Expires:{' '}
        {parseInt(BigNumber.from(expiry).toString()) === ORDER_INFINITE_EXPIRY
          ? 'never'
          : format(
              new Date(parseInt(BigNumber.from(expiry).toString()) * 1000),
              'MMMM d, y, hh:mm a',
            )}
      </P>
    </OfferContentRow>
  );
};
