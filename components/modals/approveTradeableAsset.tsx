import Link from 'next/link';
import { FC, useCallback, useMemo } from 'react';
import { easings, useTransition } from 'react-spring';
import { TradableAssetSymbol } from '../../constants';
import { ROUTES } from '../../constants/routes';
import { useTraderApproveTradableAsset } from '../../hooks/useTrader';
import {
  ActionAnchor,
  ActionAnchorList,
  ActionDescription,
  ActionTitle,
} from '../actions/common';
import { PrimaryRowActionButton } from '../art/panels/panel';
import { FlexCenter } from '../flex';
import { HashLogo } from '../hashLogo';
import { CloseIcon } from '../icons/close';
import {
  AnimatedModalContainer,
  AnimatedModalContentContainer,
  ModalCloseButton,
} from './common';

export const ApproveTradeableAssetModal: FC<{
  tradableAsset?: TradableAssetSymbol;
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
}> = ({ tradableAsset, isOpen, setIsOpen }) => {
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
  const { approve, txStatus, error, isLoading } =
    useTraderApproveTradableAsset(tradableAsset);

  const buttonText = useMemo(() => {
    if (isLoading || txStatus === 'in-progress') {
      return 'Approving...';
    }
    if (txStatus === 'failed' || !!error) {
      return 'Error. Try Again?';
    }
    if (txStatus === 'success') {
      return 'Approved';
    }
    return `Approve ${tradableAsset}`;
  }, [isLoading, txStatus, tradableAsset, error]);

  const isButtonDisabled = useMemo(() => {
    return isLoading || txStatus === 'in-progress' || txStatus === 'success';
  }, [isLoading, txStatus]);

  if (!tradableAsset) {
    return null;
  }

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
                <ActionTitle style={{ marginTop: 32 }}>
                  Approve {tradableAsset} to trade with 0x protocol
                </ActionTitle>
                <ActionDescription style={{ marginTop: 16 }}>
                  To enable trading, please complete a one-time approval. Enjoy
                  lower commissions & an enhanced trading experience.
                </ActionDescription>
                <ActionAnchorList style={{ marginTop: 16 }}>
                  <Link href={`${ROUTES.FAQ}`} passHref={true}>
                    <ActionAnchor>
                      How does the HASH marketplace work?
                    </ActionAnchor>
                  </Link>
                </ActionAnchorList>
                <PrimaryRowActionButton
                  onClick={approve}
                  style={{ marginTop: 32 }}
                  disabled={isButtonDisabled}
                >
                  {buttonText}
                </PrimaryRowActionButton>
              </AnimatedModalContentContainer>
            </AnimatedModalContainer>
          ),
      )}
    </>
  );
};
