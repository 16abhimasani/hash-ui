import { FC, useMemo } from 'react';
import styled from 'styled-components';
import {
  usePriorityAccount,
  usePriorityIsActivating,
} from '../../../connectors/priority';
import {
  useBestSaleByContext,
  useHashByContext,
  useIsMigratedByContext,
  useOwnerByContext,
} from '../../../contexts/token';
import { useBestPriceStatisticByContext } from '../../../hooks/useBestPriceStatistic';
import {
  useTraderCancelOrder,
  useTraderFillOrder,
} from '../../../hooks/useTrader';
import { lowerCaseCheck } from '../../../utils/string';
import {
  ActionDropdown,
  DropdownAction,
  DropdownActionDescription,
  DropdownActionsListContainer,
} from '../../actionsDropdown';
import { Flex } from '../../flex';
import { Label } from '../../text';
import { UserCell } from '../../userCell';
import {
  PanelContainer,
  PanelContentContainer,
  PanelLineSeparator,
  PrimaryRowActionButton,
  SecondaryRowActionButton,
} from './panel';

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

const BuyerButtonActions: FC<{ setIsBidOpen: (b: boolean) => void }> = ({
  setIsBidOpen,
}) => {
  const bestSale = useBestSaleByContext();

  const isSelling = useMemo(() => {
    return !!bestSale;
  }, [bestSale]);
  const hash = useHashByContext();

  const { fill, txStatus, error, isLoading } = useTraderFillOrder(bestSale);

  const buttonText = useMemo(() => {
    if (isLoading || txStatus === 'in-progress') {
      return 'Buying...';
    }
    if (txStatus === 'failed' || !!error) {
      return 'Buy Now';
    }
    if (txStatus === 'success') {
      return 'Bought';
    }
    return `Buy Now`;
  }, [isLoading, txStatus, error]);

  const disabled = useMemo(() => {
    return isLoading || txStatus === 'in-progress' || txStatus === 'success';
  }, [isLoading, txStatus]);

  if (isSelling) {
    return (
      <>
        <PrimaryRowActionButton disabled={disabled} onClick={fill}>
          {buttonText}
        </PrimaryRowActionButton>
        <SecondaryRowActionButton
          onClick={() => setIsBidOpen(true)}
          style={{ marginTop: 20 }}
        >
          {isSelling ? 'Place Bid' : 'Make Offer'}
        </SecondaryRowActionButton>
      </>
    );
  }

  return (
    <>
      <PrimaryRowActionButton onClick={() => setIsBidOpen(true)}>
        {isSelling ? 'Place Bid' : 'Make Offer'}
      </PrimaryRowActionButton>
    </>
  );
};

const manageButton = (onClick: () => void) => (
  <SecondaryRowActionButton onClick={onClick} style={{ marginTop: 20 }}>
    {'Manage'}
  </SecondaryRowActionButton>
);

const CancelSaleButtonAction: FC<{ toggleDropdown?: () => void }> = ({
  toggleDropdown,
}) => {
  const bestSale = useBestSaleByContext();

  const { cancel, txStatus, error, isLoading } = useTraderCancelOrder(bestSale);

  const buttonText = useMemo(() => {
    if (isLoading || txStatus === 'in-progress') {
      return 'Canceling...';
    }
    if (txStatus === 'failed' || !!error) {
      return 'Cancel Sale';
    }
    if (txStatus === 'success') {
      return 'Canceled Sale';
    }
    return `Cancel Sale`;
  }, [isLoading, txStatus, error]);

  const isSelling = useMemo(() => {
    return !!bestSale;
  }, [bestSale]);

  const disabled = useMemo(() => {
    return (
      !isSelling ||
      isLoading ||
      txStatus === 'in-progress' ||
      txStatus === 'success'
    );
  }, [isSelling, isLoading, txStatus]);

  return (
    <DropdownAction onClick={cancel} disabled={disabled} title={buttonText}>
      <DropdownActionDescription>
        Remove the listing price for this item. Requires an on-chain transaction
        to void the sale.
      </DropdownActionDescription>
    </DropdownAction>
  );
};

const LowerSaleButtonAction: FC<{ toggleDropdown?: () => void }> = ({
  toggleDropdown,
}) => {
  const bestSale = useBestSaleByContext();

  const isSelling = useMemo(() => {
    return !!bestSale;
  }, [bestSale]);

  return (
    <DropdownAction
      onClick={toggleDropdown}
      disabled={!isSelling}
      title={'Lower Sale'}
    >
      <DropdownActionDescription>
        Lower the listing price for this item. Does not require gas or an
        on-chain transaction.
      </DropdownActionDescription>
    </DropdownAction>
  );
};

const SellerButtonActions: FC<{
  setIsListOpen: (b: boolean) => void;
  setIsMigrateOpen: (b: boolean) => void;
  setIsLowerOpen: (b: boolean) => void;
}> = ({ setIsMigrateOpen, setIsLowerOpen, setIsListOpen }) => {
  const bestSale = useBestSaleByContext();

  const isSelling = useMemo(() => {
    return !!bestSale;
  }, [bestSale]);

  const isMigrated = useIsMigratedByContext();

  return (
    <>
      {!isSelling && (
        <PrimaryRowActionButton
          onClick={() =>
            isMigrated ? setIsListOpen(true) : setIsMigrateOpen(true)
          }
        >
          List for Sale
        </PrimaryRowActionButton>
      )}
      <ActionDropdown enable={true} button={manageButton}>
        {(onClick: () => void, isOpen?: boolean) => (
          <DropdownActionsListContainer>
            <DropdownAction title={'Order Official Print'}>
              <DropdownActionDescription>
                Get this HASH printed. Custom Framing and Frameless options
                available
              </DropdownActionDescription>
            </DropdownAction>
            {isMigrated === false && (
              <DropdownAction
                title={'Migrate to new contract'}
                onClick={() => {
                  setIsMigrateOpen(true);
                  onClick();
                }}
              >
                <DropdownActionDescription>
                  HASH is upgrading to a new ERC-721 contract, migrate to enjoy
                  lower commissions.
                </DropdownActionDescription>
              </DropdownAction>
            )}
            {isMigrated && (
              <LowerSaleButtonAction
                toggleDropdown={() => {
                  onClick();
                  setIsLowerOpen(true);
                }}
              />
            )}
            {isMigrated && <CancelSaleButtonAction toggleDropdown={onClick} />}
          </DropdownActionsListContainer>
        )}
      </ActionDropdown>
    </>
  );
};

export const MintedPanel: FC<{
  setIsBidOpen: (b: boolean) => void;
  setIsListOpen: (b: boolean) => void;
  setIsMigrateOpen: (b: boolean) => void;
  setIsLowerOpen: (b: boolean) => void;
}> = ({ setIsBidOpen, setIsMigrateOpen, setIsLowerOpen, setIsListOpen }) => {
  const account = usePriorityAccount();
  const isActivating = usePriorityIsActivating();
  const owner = useOwnerByContext();

  const isOwner = useMemo(
    () => lowerCaseCheck(account, owner),
    [account, owner],
  );

  const { priceLabel, priceText } = useBestPriceStatisticByContext();

  return (
    <PanelContainer>
      <PanelContentContainer>
        <Flex>
          <div>
            <Label style={{ fontSize: 12 }}>{priceLabel}</Label>
            <PriceText style={{ marginTop: 12 }}>{priceText}</PriceText>
          </div>
        </Flex>
        <Flex style={{ marginTop: 28 }}>
          <UserCell label="Owner" user={owner} />
        </Flex>
        {owner !== undefined && !isActivating && (
          <>
            <PanelLineSeparator />
            {isOwner && (
              <SellerButtonActions
                setIsLowerOpen={setIsLowerOpen}
                setIsListOpen={setIsListOpen}
                setIsMigrateOpen={setIsMigrateOpen}
              />
            )}
            {!isOwner && <BuyerButtonActions setIsBidOpen={setIsBidOpen} />}
          </>
        )}
      </PanelContentContainer>
    </PanelContainer>
  );
};
