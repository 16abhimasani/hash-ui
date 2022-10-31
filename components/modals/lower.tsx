import { BigNumber, ethers, utils } from 'ethers';
import Link from 'next/link';
import { FC, useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { easings, useTransition } from 'react-spring';
import styled from 'styled-components';
import { TradableAssetSymbol, ZERO } from '../../constants';
import { ROUTES } from '../../constants/routes';
import {
  useBestSaleByContext,
  useIsMigratedByContext,
  useTokenIdByContext,
} from '../../contexts/token';
import { useTraderListSale } from '../../hooks/useTrader';
import { DEFAULT_TOAST_STYLES } from '../../styles';
import { formatDecimalNumber } from '../../utils/string';
import { getTotalErc20AmountInOrder } from '../../utils/trader';
import { ActionAnchor, ActionAnchorList } from '../actions/common';
import { PrimaryRowActionButton } from '../art/panels/panel';
import { FlexCenter } from '../flex';
import { HashLogo } from '../hashLogo';
import { CloseIcon } from '../icons/close';
import { SpinnerIcon } from '../icons/spinner';
import {
  FormAdditiveLabel,
  FormContainer,
  FormGroupContainer,
  FormLabel,
  FormLabelRow,
  NumberInput,
  TextInputContainerRow,
} from '../input';
import {
  AnimatedModalContainer,
  ModalCloseButton,
  ModalContentContainer,
} from './common';

const SelectedAssetButton = styled.div`
  display: flex;
  width: 100%;
  position: relative;
  padding: 8px 14px;
  font-size: 16px;
  line-height: 18px;
  background: white;
  border-radius: 999px;
  width: 100%;
  outline: none;
  width: fit-content;
  font-weight: bold;
  display: flex;
  align-items: center;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.25);
`;

export const LowerModal: FC<{
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
}> = ({ isOpen, setIsOpen }) => {
  const toggleIsOpen = useCallback(
    () => setIsOpen(!isOpen),
    [setIsOpen, isOpen],
  );
  const bestSale = useBestSaleByContext();
  const transitions = useTransition(isOpen, {
    from: { opacity: 0, transform: 'translateY(-40px)' },
    enter: { opacity: 1, transform: 'translateY(0)' },
    leave: { opacity: 0, transform: 'translateY(-40px)' },
    config: {
      duration: 150,
      easing: easings.easeInOutQuart,
    },
  });
  // TODO: fix after v4
  const receivingAssetSymbol = useMemo(() => 'ETH' as TradableAssetSymbol, []);

  const totalBestSaleReceivingAmount = useMemo(
    () => (!!bestSale ? getTotalErc20AmountInOrder(bestSale) : undefined),
    [bestSale],
  );

  const [receivingAmountText, setReceivingAmountText] = useState('');
  const receivingAmount = useMemo(() => {
    const parsedValue = parseFloat(receivingAmountText);

    if (!!parsedValue) {
      return ethers.utils.parseEther(parsedValue.toString());
    }
    return undefined;
  }, [receivingAmountText]);
  const isReceivingAmountExceededBestSale = useMemo(() => {
    if (!totalBestSaleReceivingAmount || !receivingAmount) {
      return false;
    }
    return receivingAmount.gte(totalBestSaleReceivingAmount);
  }, [totalBestSaleReceivingAmount, receivingAmount]);
  const isValidReceivingAmount = useMemo(() => {
    return (
      !!receivingAmount &&
      !receivingAmount.eq(ZERO) &&
      !isReceivingAmountExceededBestSale
    );
  }, [receivingAmount, isReceivingAmountExceededBestSale]);
  const tokenId = useTokenIdByContext();
  const [listSale, isLoading] = useTraderListSale(tokenId);
  const isMigrated = useIsMigratedByContext();
  const handleListSaleClick = useCallback(async () => {
    if (!receivingAmount) {
      return;
    }
    if (!bestSale) {
      return;
    }
    const isSuccess = await listSale(
      receivingAssetSymbol,
      receivingAmount,
      BigNumber.from(bestSale.expiry).toNumber() * 1000,
      BigNumber.from(bestSale.nonce).toHexString(),
    );
    if (isSuccess) {
      toggleIsOpen();
      toast.success('Listing price lowered.', {
        duration: 10000,
        style: DEFAULT_TOAST_STYLES,
      });
    }
  }, [
    // isApproved,
    // onSuccess,
    listSale,
    receivingAmount,
    bestSale,
    receivingAssetSymbol,
  ]);

  const isListSaleButtonDisabled = useMemo(
    () => !isMigrated || !isValidReceivingAmount || isLoading || !tokenId,
    [isMigrated, tokenId, isLoading, isValidReceivingAmount],
  );

  return (
    <>
      {transitions(
        (props, item) =>
          item && (
            <AnimatedModalContainer style={props}>
              <ModalContentContainer>
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
                      <FormAdditiveLabel>
                        Last Price:{' '}
                        {!!totalBestSaleReceivingAmount
                          ? `${formatDecimalNumber(
                              utils.formatEther(totalBestSaleReceivingAmount),
                            )} ${receivingAssetSymbol}`
                          : '-'}
                      </FormAdditiveLabel>
                    </FormLabelRow>
                    <TextInputContainerRow>
                      <NumberInput
                        onChange={(e) => setReceivingAmountText(e.target.value)}
                        placeholder={'0.00'}
                        style={{ marginRight: 8 }}
                      />
                      <SelectedAssetButton>
                        {receivingAssetSymbol}
                      </SelectedAssetButton>
                    </TextInputContainerRow>
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
                  {isLoading ? <SpinnerIcon /> : 'Lower price'}{' '}
                </PrimaryRowActionButton>
              </ModalContentContainer>
            </AnimatedModalContainer>
          ),
      )}
    </>
  );
};
