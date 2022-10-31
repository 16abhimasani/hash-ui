import Link from 'next/link';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { easings, useTransition } from 'react-spring';
import { ROUTES } from '../../constants/routes';
import { useIsHashApprovedByContext } from '../../contexts/trader';
import { useTraderApproveHash } from '../../hooks/useTrader';
import { useModalStore } from '../../stores/modal';
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

export const ApproveHashModalGlobal: FC = () => {
  const setIsApproveModalOpen = useModalStore((s) => s.setIsApproveModalOpen);
  const isApproveModalOpen = useModalStore((s) => s.isApproveModalOpen);
  const isApproved = useIsHashApprovedByContext();
  useEffect(() => {
    if (isApproved && isApproveModalOpen) {
      setIsApproveModalOpen(false);
    }
  }, [isApproved, isApproveModalOpen]);
  return (
    <ApproveHashModal
      isOpen={isApproveModalOpen}
      setIsOpen={setIsApproveModalOpen}
    />
  );
};

export const ApproveHashModal: FC<{
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
}> = ({ isOpen, setIsOpen }) => {
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
  const { approve, txStatus, error, isLoading } = useTraderApproveHash();

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
    return `Approve HASH`;
  }, [isLoading, txStatus, error]);

  const isButtonDisabled = useMemo(() => {
    return isLoading || txStatus === 'in-progress' || txStatus === 'success';
  }, [isLoading, txStatus]);

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
                  Approve HASH to trade with 0x protocol
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
