import { ListboxOption } from '@reach/listbox';
import { addDays, format } from 'date-fns';
import { ethers } from 'ethers';
import Link from 'next/link';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { easings, useTransition } from 'react-spring';
import { usePriorityAccount } from '../../connectors/priority';
import {
  BIDDABLE_TRADABLE_ASSETS,
  DEFAULT_BIDDABLE_TRADABLE_ASSET,
  TradableAssetSymbol,
  ZERO,
} from '../../constants';
import { ROUTES } from '../../constants/routes';
import { useTokenIdByContext } from '../../contexts/token';
import {
  useFungibleAssetBalance,
  useIsFungibleAssetApproved,
  useTraderPlaceBid,
} from '../../hooks/useTrader';
import { DEFAULT_TOAST_STYLES } from '../../styles';
import { formatDecimalNumber } from '../../utils/string';
import { ActionAnchor, ActionAnchorList } from '../actions/common';
import { PrimaryRowActionButton } from '../art/panels/panel';
import { FlexCenter } from '../flex';
import { HashLogo } from '../hashLogo';
import { CloseIcon } from '../icons/close';
import { SpinnerIcon } from '../icons/spinner';
import {
  DEFAULT_NUM_DAYS,
  FormAdditiveLabel,
  FormContainer,
  FormGroupContainer,
  FormLabel,
  FormLabelRow,
  NumberInput,
  NumDaysRangeInput,
  SelectInput,
  SelectInputButton,
  SelectInputList,
  SelectInputPopover,
  TextInputContainerRow,
} from '../input';
import { ApproveTradeableAssetModal } from './approveTradeableAsset';
import {
  AnimatedModalContainer,
  AnimatedModalContentContainer,
  ModalCloseButton,
} from './common';

export const BidModal: FC<{
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
}> = ({ isOpen, setIsOpen }) => {
  const account = usePriorityAccount();
  const [biddingAssetSymbol, setBiddingAssetSymbol] = useState(
    DEFAULT_BIDDABLE_TRADABLE_ASSET,
  );
  const balance = useFungibleAssetBalance(biddingAssetSymbol, account);
  const toggleIsOpen = useCallback(
    () => setIsOpen(!isOpen),
    [setIsOpen, isOpen],
  );

  const transitions = useTransition(isOpen, {
    from: { opacity: 0, transform: 'translateY(-60px)' },
    enter: { opacity: 1, transform: 'translateY(0)' },
    leave: { opacity: 0, transform: 'translateY(-60px)' },
    config: {
      duration: 150,
      easing: easings.easeInOutQuart,
    },
  });
  const [bidAmountText, setBidAmountText] = useState('');
  const [numDays, setNumDays] = useState(DEFAULT_NUM_DAYS);

  const bidAmount = useMemo(() => {
    const parsedValue = parseFloat(bidAmountText);

    if (!!parsedValue) {
      return ethers.utils.parseEther(parsedValue.toString());
    }
    return undefined;
  }, [bidAmountText]);

  const isBidAmountExceededBalance = useMemo(() => {
    if (!bidAmount || !balance) {
      return false;
    }
    return bidAmount.gte(balance);
  }, [bidAmount, balance]);

  const isValidBidAmount = useMemo(() => {
    return !isBidAmountExceededBalance && !!bidAmount && !bidAmount.eq(ZERO);
  }, [bidAmount, isBidAmountExceededBalance]);

  const tokenId = useTokenIdByContext();
  const [placeBid, isLoading] = useTraderPlaceBid(tokenId);

  const isApproved = useIsFungibleAssetApproved(
    biddingAssetSymbol,
    account,
    bidAmount,
  );

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const handlePlaceBidClick = useCallback(async () => {
    if (!bidAmount) {
      return;
    }
    if (isApproved) {
      const isSuccess = await placeBid(
        biddingAssetSymbol,
        bidAmount,
        numDays === Infinity
          ? undefined
          : addDays(new Date(), numDays).getTime(),
      );
      if (isSuccess) {
        toggleIsOpen();
        toast.success('Bid placed.', {
          duration: 10000,
          style: DEFAULT_TOAST_STYLES,
        });
      }
    } else {
      setIsApprovalModalOpen(true);
    }
  }, [isApproved, placeBid, bidAmount, biddingAssetSymbol]);

  useEffect(() => {
    if (isApprovalModalOpen && isApproved) {
      setIsApprovalModalOpen(false);
    }
  }, [isApprovalModalOpen, isApproved]);

  useEffect(() => {
    if (!isOpen) {
      setIsApprovalModalOpen(false);
    }
  }, [isOpen]);

  const placeBidButtonDisabled = useMemo(
    () =>
      !isValidBidAmount || isLoading || !tokenId || isApproved === undefined,
    [isApproved, tokenId, isLoading, isValidBidAmount],
  );

  return (
    <>
      <ApproveTradeableAssetModal
        tradableAsset={biddingAssetSymbol}
        isOpen={isApprovalModalOpen && isOpen}
        setIsOpen={setIsOpen}
      />
      {!isApprovalModalOpen &&
        transitions(
          (props, item) =>
            item && (
              <AnimatedModalContainer
                style={{
                  opacity: props.opacity,
                  display: props.opacity.to((o) => (o !== 0 ? 'flex' : 'none')),
                }}
              >
                <AnimatedModalContentContainer style={props}>
                  {' '}
                  <ModalCloseButton
                    onClick={() => {
                      toggleIsOpen();
                    }}
                  >
                    <CloseIcon />
                  </ModalCloseButton>
                  <FlexCenter>
                    <HashLogo />
                  </FlexCenter>
                  <FormGroupContainer style={{ marginTop: 32 }}>
                    <FormContainer>
                      <FormLabelRow>
                        <FormLabel>Offer price</FormLabel>
                        {(() => {
                          if (isBidAmountExceededBalance) {
                            return (
                              <FormAdditiveLabel style={{ color: '#FF6363' }}>
                                Exceed current balance
                              </FormAdditiveLabel>
                            );
                          }
                          return (
                            <FormAdditiveLabel>
                              Balance:{' '}
                              {!!balance
                                ? formatDecimalNumber(
                                    ethers.utils.formatEther(balance),
                                  )
                                : '-'}{' '}
                              {biddingAssetSymbol}
                            </FormAdditiveLabel>
                          );
                        })()}
                      </FormLabelRow>
                      <TextInputContainerRow>
                        <NumberInput
                          onChange={(e) => setBidAmountText(e.target.value)}
                          placeholder={'0.00'}
                          style={{ marginRight: 8 }}
                        />
                        <SelectInput
                          onChange={(s: TradableAssetSymbol) =>
                            setBiddingAssetSymbol(s)
                          }
                          defaultValue={DEFAULT_BIDDABLE_TRADABLE_ASSET}
                        >
                          <SelectInputButton />
                          <SelectInputPopover>
                            <SelectInputList>
                              {BIDDABLE_TRADABLE_ASSETS.map((a) => {
                                return (
                                  <ListboxOption
                                    key={`select-asset-${a}`}
                                    value={a}
                                  >
                                    {a}
                                  </ListboxOption>
                                );
                              })}
                            </SelectInputList>
                          </SelectInputPopover>
                        </SelectInput>
                      </TextInputContainerRow>
                    </FormContainer>
                    <FormContainer>
                      <FormLabelRow>
                        <FormLabel>Offer duration</FormLabel>
                        <FormAdditiveLabel>
                          Exp around:{' '}
                          {format(
                            addDays(new Date(), numDays),
                            'MMM d hh:mm a',
                          )}
                        </FormAdditiveLabel>
                      </FormLabelRow>
                      <NumDaysRangeInput onChange={setNumDays} />
                    </FormContainer>
                  </FormGroupContainer>
                  <ActionAnchorList style={{ marginTop: 32 }}>
                    <Link href={`${ROUTES.FAQ}`} passHref={true}>
                      <ActionAnchor>
                        How does the HASH marketplace work?
                      </ActionAnchor>
                    </Link>
                  </ActionAnchorList>
                  <PrimaryRowActionButton
                    disabled={placeBidButtonDisabled}
                    onClick={handlePlaceBidClick}
                    style={{ marginTop: 32 }}
                  >
                    {isLoading ? <SpinnerIcon /> : 'Make offer'}{' '}
                  </PrimaryRowActionButton>
                </AnimatedModalContentContainer>
              </AnimatedModalContainer>
            ),
        )}
    </>
  );
};
