import { ListboxOption } from '@reach/listbox';
import { addDays, format } from 'date-fns';
import { ethers } from 'ethers';
import Link from 'next/link';
import { FC, useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { easings, useTransition } from 'react-spring';
import {
  DEFAULT_LISTING_TRADABLE_ASSET,
  RECEIVABLE_TRADABLE_ASSETS,
  TradableAssetSymbol,
  ZERO,
} from '../../constants';
import { ROUTES } from '../../constants/routes';
import {
  useIsMigratedByContext,
  useTokenIdByContext,
} from '../../contexts/token';
import { useIsHashApprovedByContext } from '../../contexts/trader';
import { useTraderListSale } from '../../hooks/useTrader';
import { DEFAULT_TOAST_STYLES } from '../../styles';
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
import { ApproveHashModal } from './approveHash';
import {
  AnimatedModalContainer,
  AnimatedModalContentContainer,
  ModalCloseButton,
} from './common';

export const ListModalWithApprovalStep: FC<{
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
}> = ({ isOpen, setIsOpen }) => {
  const isApproved = useIsHashApprovedByContext();

  return (
    <>
      {isApproved === false ? (
        <ApproveHashModal isOpen={isOpen} setIsOpen={setIsOpen} />
      ) : (
        <ListModal isOpen={isOpen} setIsOpen={setIsOpen} />
      )}
    </>
  );
};

export const ListModal: FC<{
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
}> = ({ isOpen, setIsOpen }) => {
  const [receivingAssetSymbol, setReceivingAssetSymbol] = useState(
    DEFAULT_LISTING_TRADABLE_ASSET,
  );
  const toggleIsOpen = useCallback(
    () => setIsOpen(!isOpen),
    [setIsOpen, isOpen],
  );

  const transitions = useTransition(isOpen, {
    from: { opacity: 0, transform: 'translateY(-40px)' },
    enter: { opacity: 1, transform: 'translateY(0)' },
    leave: { opacity: 0, transform: 'translateY(-40px)' },
    config: {
      duration: 150,
      easing: easings.easeInOutQuart,
    },
  });
  const [receivingAmountText, setReceivingAmountText] = useState('');
  const receivingAmount = useMemo(() => {
    const parsedValue = parseFloat(receivingAmountText);

    if (!!parsedValue) {
      return ethers.utils.parseEther(parsedValue.toString());
    }
    return undefined;
  }, [receivingAmountText]);

  const isValidReceivingAmount = useMemo(() => {
    return !!receivingAmount && !receivingAmount.eq(ZERO);
  }, [receivingAmount]);
  const tokenId = useTokenIdByContext();
  const [listSale, isLoading] = useTraderListSale(tokenId);
  const isMigrated = useIsMigratedByContext();
  const handleListSaleClick = useCallback(async () => {
    if (!receivingAmount) {
      return;
    }
    const isSuccess = await listSale(
      receivingAssetSymbol,
      receivingAmount,
      numDays === Infinity ? undefined : addDays(new Date(), numDays).getTime(),
      undefined,
    );
    if (isSuccess) {
      toggleIsOpen();
      toast.success('Listing created.', {
        duration: 10000,
        style: DEFAULT_TOAST_STYLES,
        id: 'wrong-chain-id',
      });
    }
  }, [listSale, tokenId, toggleIsOpen, receivingAmount, receivingAssetSymbol]);

  const [numDays, setNumDays] = useState(DEFAULT_NUM_DAYS);

  const isListSaleButtonDisabled = useMemo(
    () => !isMigrated || !isValidReceivingAmount || isLoading || !tokenId,
    [isMigrated, tokenId, isLoading, isValidReceivingAmount],
  );

  return (
    <>
      {transitions(
        (props, item) =>
          item && (
            <AnimatedModalContainer
              style={{
                opacity: props.opacity,
                display: props.opacity.to((o) => (o !== 0 ? 'flex' : 'none')),
              }}
            >
              <AnimatedModalContentContainer style={props}>
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
                      <FormLabel>Listing price</FormLabel>
                    </FormLabelRow>
                    <TextInputContainerRow>
                      <NumberInput
                        onChange={(e) => setReceivingAmountText(e.target.value)}
                        placeholder={'0.00'}
                        style={{ marginRight: 8 }}
                      />
                      <SelectInput
                        onChange={(s: TradableAssetSymbol) =>
                          setReceivingAssetSymbol(s)
                        }
                        defaultValue={DEFAULT_LISTING_TRADABLE_ASSET}
                      >
                        <SelectInputButton />
                        <SelectInputPopover>
                          <SelectInputList>
                            {RECEIVABLE_TRADABLE_ASSETS.map((a) => {
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
                      <FormLabel>Listing duration</FormLabel>
                      <FormAdditiveLabel>
                        Exp around:{' '}
                        {format(addDays(new Date(), numDays), 'MMM d hh:mm a')}
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
                  disabled={isListSaleButtonDisabled}
                  onClick={handleListSaleClick}
                  style={{ marginTop: 32 }}
                >
                  {isLoading ? <SpinnerIcon /> : 'List for sale'}{' '}
                </PrimaryRowActionButton>
              </AnimatedModalContentContainer>
            </AnimatedModalContainer>
          ),
      )}
    </>
  );
};
