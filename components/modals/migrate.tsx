import Link from 'next/link';
import { FC, useCallback, useMemo } from 'react';
import { easings, useTransition } from 'react-spring';
import { ROUTES } from '../../constants/routes';
import { useTokenIdByContext } from '../../contexts/token';
import { useMigrate } from '../../hooks/useMigrate';
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

export const MigrateModal: FC<{
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
  const tokenId = useTokenIdByContext();
  const { migrate, txStatus, error, isLoading } = useMigrate(tokenId);

  const buttonText = useMemo(() => {
    if (isLoading || txStatus === 'in-progress') {
      return 'Migrating...';
    }
    if (txStatus === 'failed' || !!error) {
      return 'Error. Try Again?';
    }
    if (txStatus === 'success') {
      return 'Migrated';
    }
    return `Migrate HASH`;
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
                  Migrate HASH to ERC-721
                </ActionTitle>
                <ActionDescription style={{ marginTop: 16 }}>
                  To enable trading, please complete a one-time migration. Enjoy
                  lower commissions & an enhanced trading experience.
                </ActionDescription>
                <ActionAnchorList style={{ marginTop: 16 }}>
                  <Link href={`${ROUTES.FAQ}`} passHref={true}>
                    <ActionAnchor>
                      How does the HASH marketplace work?
                    </ActionAnchor>
                  </Link>
                  <ActionAnchor
                    href={
                      'https://twitter.com/prrfbeauty/status/1499774577571811329?s=21'
                    }
                    target={'_blank'}
                  >
                    Why upgrade to ERC-721
                  </ActionAnchor>
                </ActionAnchorList>
                <PrimaryRowActionButton
                  onClick={migrate}
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
