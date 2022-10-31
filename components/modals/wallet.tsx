import { FC, useMemo } from 'react';
import { easings, useTransition } from 'react-spring';
import { useMountedState } from 'react-use';
import { usePriorityAccount } from '../../connectors/priority';
import {
  useAuthStatusByContext,
  useIsAuthenticatedByContext,
} from '../../contexts/auth';
import { useModalStore } from '../../stores/modal';
import {
  Web3ConnectedButNeedAuthWalletContent,
  Web3ConnectedWalletContent,
  Web3ConnectWalletContent,
} from '../web3Status';
import {
  AnimatedModalContainer,
  AnimatedModalContentContainer,
} from './common';

export const WalletModal: FC = () => {
  // important that these are destructed from the account-specific web3-react context
  const account = usePriorityAccount();

  const isOpen = useModalStore((s) => s.isWalletModalOpen);
  const toggleIsOpen = useModalStore((s) => s.toggleIsWalletModalOpen);

  const transitions = useTransition(isOpen, {
    from: { opacity: 0, transform: 'translateY(-40px)' },
    enter: { opacity: 1, transform: 'translateY(0)' },
    leave: { opacity: 0, transform: 'translateY(-40px)' },
    config: {
      duration: 150,
      easing: easings.easeInOutQuart,
    },
  });

  const isMounted = useMountedState();
  const authStatus = useAuthStatusByContext();
  const needsAuth = useMemo(
    () =>
      authStatus === 'in-progress' ||
      authStatus === 'failed' ||
      authStatus === 'require-full-auth',
    [authStatus],
  );
  const isAuthenticated = useIsAuthenticatedByContext();

  return (
    <>
      {transitions(
        (props, item) =>
          item && (
            <AnimatedModalContainer
              onClick={toggleIsOpen}
              style={{
                opacity: props.opacity,
                display: props.opacity.to((o) => (o !== 0 ? 'flex' : 'none')),
              }}
            >
              <AnimatedModalContentContainer style={props}>
                {!account && isMounted() && <Web3ConnectWalletContent />}
                {!!account && isAuthenticated && (
                  <Web3ConnectedWalletContent
                    setIsDropdownOpen={toggleIsOpen}
                  />
                )}
                {!!account && needsAuth && (
                  <Web3ConnectedButNeedAuthWalletContent />
                )}
              </AnimatedModalContentContainer>
            </AnimatedModalContainer>
          ),
      )}
    </>
  );
};
