import Link from 'next/link';
import { FC, useEffect, useMemo } from 'react';
import { easings, useTransition } from 'react-spring';
import { ROUTES } from '../../constants/routes';
import { useAuthStatusByContext, useLoginByContext } from '../../contexts/auth';
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
import { SpinnerIcon } from '../icons/spinner';
import {
  AnimatedModalContainer,
  AnimatedModalContentContainer,
  ModalCloseButton,
} from './common';

export const LoginModal: FC = () => {
  const isOpen = useModalStore((s) => s.isLoginModalOpen);
  const toggleIsOpen = useModalStore((s) => s.toggleIsLoginModalOpen);
  const setIsLoginModalOpen = useModalStore((s) => s.setIsLoginModalOpen);
  const transitions = useTransition(isOpen, {
    from: { opacity: 0, transform: 'translateY(-40px)' },
    enter: { opacity: 1, transform: 'translateY(0)' },
    leave: { opacity: 0, transform: 'translateY(-40px)' },
    config: {
      duration: 150,
      easing: easings.easeInOutQuart,
    },
  });
  const authStatus = useAuthStatusByContext();
  const login = useLoginByContext();
  const disabled = useMemo(
    () => authStatus === 'in-progress' || authStatus === 'success',
    [authStatus],
  );
  const buttonText = useMemo(() => {
    if (authStatus === 'success') {
      return 'Success!';
    }
    if (authStatus === 'in-progress') {
      return 'Logging in...';
    }
    return 'Connect';
  }, [authStatus]);

  useEffect(() => {
    if (isOpen && authStatus === 'success') {
      setIsLoginModalOpen(false);
    }
  }, [authStatus, isOpen, setIsLoginModalOpen]);

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
                  Create a new session
                </ActionTitle>
                <ActionDescription style={{ marginTop: 16 }}>
                  Sign a message with your wallet to enable seamless commenting,
                  upvoting, and saving.
                </ActionDescription>
                <ActionAnchorList style={{ marginTop: 16 }}>
                  <Link href={ROUTES.FAQ} passHref>
                    <ActionAnchor>How does sessions work?</ActionAnchor>
                  </Link>
                </ActionAnchorList>
                <PrimaryRowActionButton
                  onClick={login}
                  style={{ marginTop: 32 }}
                  disabled={disabled}
                >
                  {authStatus !== 'in-progress' && buttonText}
                  {authStatus === 'in-progress' && (
                    <SpinnerIcon style={{ margin: '0 10px' }} />
                  )}
                </PrimaryRowActionButton>
              </AnimatedModalContentContainer>
            </AnimatedModalContainer>
          ),
      )}
    </>
  );
};
