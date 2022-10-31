import Link from 'next/link';
import { useRouter } from 'next/router';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { animated, useSpring } from 'react-spring';
import { useClickAway, useCopyToClipboard, useMountedState } from 'react-use';
import styled from 'styled-components';
import { hooks as metaMaskHooks, metaMask } from '../connectors/metaMask';
import {
  usePriorityAccount,
  usePriorityConnector,
  usePriorityIsActivating,
} from '../connectors/priority';
import {
  hooks as walletConnectHooks,
  walletConnect,
} from '../connectors/walletConnect';
import { CHAIN_ID } from '../constants';
import { ROUTES } from '../constants/routes';
import {
  useAuthStatusByContext,
  useIsAuthenticatedByContext,
  useLoginByContext,
  useSignOutByContext,
} from '../contexts/auth';
import { useIsHashApprovedByContext } from '../contexts/trader';
import { useTwitterLink } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { useModalStore } from '../stores/modal';
import { BREAKPTS } from '../styles';
import { shortenHexString } from '../utils/hex';
import { BaseAnchor } from './anchor';
import { UserAvatar } from './avatar';
import { BaseButton } from './button';
import { DropdownAnimation } from './dropdown';
import { Flex, FlexEnds } from './flex';
import { ApproveTradingIcon } from './icons/approveTrading';
import { CopyAddressIcon } from './icons/copyAddress';
import { DisconnectWalletIcon } from './icons/disconnectWallet';
import { SpinnerIcon } from './icons/spinner';
import { TwitterIcon } from './icons/twitter';
import { MetamaskIcon, WalletConnectIcon } from './icons/wallet';
import { Text } from './text';

const StyledUserAvatar = styled(UserAvatar)`
  margin-left: 0;
  transform: translateY(0px);
`;

const ConnectWalletContainer = styled.div`
  padding: 10px;
  > button + button {
    margin-top: 8px;
  }
`;

export const Web3ConnectWalletContent: FC = () => {
  return (
    <ConnectWalletContainer>
      <ConnectWalletMetamaskOption />
      <ConnectWalletWalletConnectOption />
    </ConnectWalletContainer>
  );
};

const ConnectWalletMetamaskOption = () => {
  const isActivating = metaMaskHooks.useIsActivating();
  if (!window?.ethereum) {
    return (
      <ConnectWalletButton
        key={`wallet-option-install-metamask`}
        onClick={() => window.open('https://metamask.io', '_blank')}
      >
        <ConnectWalletButtonIcon>
          <MetamaskIcon />
        </ConnectWalletButtonIcon>
        Install metamask
      </ConnectWalletButton>
    );
  }

  return (
    <ConnectWalletButton
      disabled={isActivating}
      onClick={() => {
        metaMask.activate(CHAIN_ID);
      }}
    >
      <ConnectWalletButtonIcon>
        <MetamaskIcon />
      </ConnectWalletButtonIcon>
      {isActivating ? 'Connecting' : 'MetaMask'}
    </ConnectWalletButton>
  );
};

const ConnectWalletWalletConnectOption = () => {
  const isActivating = walletConnectHooks.useIsActivating();
  return (
    <ConnectWalletButton
      disabled={isActivating}
      onClick={() => {
        walletConnect.activate(CHAIN_ID);
      }}
    >
      <ConnectWalletButtonIcon>
        <WalletConnectIcon />
      </ConnectWalletButtonIcon>
      {isActivating ? 'Connecting' : 'Wallet Connect'}
    </ConnectWalletButton>
  );
};

const ConnectedButNeedAuthWalletContainer = styled.div`
  padding: 16px;
  > button + button {
    margin-top: 8px;
  }
`;

export const AddressPill = styled.div`
  padding: 4px 8px;
  background: #f7f7f7;
  border-radius: 99999px;
  font-size: 12px;
  /* identical to box height */

  display: flex;
  align-items: center;

  color: #949494;
`;

export const Web3ConnectedButNeedAuthWalletContent: FC<{
  setIsDropdownOpen?: (b: boolean) => void;
}> = ({ setIsDropdownOpen }) => {
  const account = usePriorityAccount();
  const connector = usePriorityConnector();
  const accountMetadata = useUser(account);
  const disconnect = useCallback(() => {
    connector.deactivate();
  }, [connector]);

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
  return (
    <ConnectedButNeedAuthWalletContainer>
      <Flex>
        <StyledUserAvatar size={24} user={account} />
        <AddressOrNameSpan
          style={{ marginLeft: 8, fontWeight: 'bold', fontSize: 14 }}
        >
          {accountMetadata?.bestName}
        </AddressOrNameSpan>
        {(!!accountMetadata?.username || !!accountMetadata?.ens) &&
          !!account && (
            <AddressPill style={{ marginLeft: 6 }}>
              {shortenHexString(account)}
            </AddressPill>
          )}
      </Flex>
      <FlexEnds style={{ marginTop: 20 }}>
        {authStatus !== 'in-progress' && (
          <SecondaryButton onClick={disconnect}>Change Wallet</SecondaryButton>
        )}
        {authStatus === 'in-progress' && <Text>Check your wallet...</Text>}

        <PrimaryButton onClick={login} disabled={disabled}>
          {authStatus !== 'in-progress' && buttonText}
          {authStatus === 'in-progress' && (
            <SpinnerIcon style={{ margin: '0 10px' }} />
          )}
        </PrimaryButton>
      </FlexEnds>
    </ConnectedButNeedAuthWalletContainer>
  );
};

const Web3ConnectedWalletLinkTwitter: FC<{
  setIsDropdownOpen?: (b: boolean) => void;
}> = ({ setIsDropdownOpen }) => {
  const account = usePriorityAccount();
  const { isTwitterLinked } = useTwitterLink(account);
  const toggleIsOpen = useModalStore((s) => s.toggleIsTwitterModalOpen);

  if (isTwitterLinked) {
    return null;
  }

  return (
    <CollectionWell
      onClick={() => {
        setIsDropdownOpen?.(false);
        toggleIsOpen();
      }}
    >
      <CollectionWellIconContainer>
        <TwitterIcon />
      </CollectionWellIconContainer>
      <CollectionWellTextContainer>Link Twitter</CollectionWellTextContainer>
      <CollectionWellDot />
    </CollectionWell>
  );
};

export const Web3ConnectedWalletContent: FC<{
  setIsDropdownOpen?: (b: boolean) => void;
}> = ({ setIsDropdownOpen }) => {
  const router = useRouter();
  const account = usePriorityAccount();
  const connector = usePriorityConnector();

  const [, copyToClipboard] = useCopyToClipboard();
  const [copied, setCopied] = useState<boolean>(false);
  const copyClick = useCallback(() => {
    if (account) {
      copyToClipboard(account);
      setCopied(true);
    }
  }, [account]);
  const signout = useSignOutByContext();
  const disconnect = useCallback(() => {
    signout?.();
    connector.deactivate();
  }, [signout, router, connector]);
  const isApproved = useIsHashApprovedByContext();
  const toggleIsApproveModalOpen = useModalStore(
    (s) => s.toggleIsApproveModalOpen,
  );
  return (
    <>
      <CollectionsContainer>
        <CollectionGrid>
          <Link href={`${ROUTES.USER}/${account}`} passHref>
            <CollectionWell>
              <div>
                <UserAvatar size={24} user={account} />
              </div>
              <CollectionWellTextContainer>
                My Profile
              </CollectionWellTextContainer>
            </CollectionWell>
          </Link>
          {isApproved === false && (
            <CollectionWell
              onClick={() => {
                toggleIsApproveModalOpen();
                setIsDropdownOpen?.(false);
              }}
            >
              <div>
                <ApproveTradingIcon />
              </div>
              <CollectionWellTextContainer>
                Approve HASH to trade
              </CollectionWellTextContainer>
            </CollectionWell>
          )}
          <Web3ConnectedWalletLinkTwitter
            setIsDropdownOpen={setIsDropdownOpen}
          />
          {/* <CollectionWellApproveHash /> */}
          <CollectionWell onClick={copyClick}>
            <CollectionWellIconContainer>
              <CopyAddressIcon />
            </CollectionWellIconContainer>
            <CollectionWellTextContainer>
              {copied ? 'Copied!' : 'Copy Address'}
            </CollectionWellTextContainer>
          </CollectionWell>
          <CollectionWell
            onClick={() => {
              disconnect();
            }}
          >
            <CollectionWellIconContainer>
              <DisconnectWalletIcon />
            </CollectionWellIconContainer>
            <CollectionWellTextContainer>
              Disconnect
            </CollectionWellTextContainer>
          </CollectionWell>
        </CollectionGrid>
      </CollectionsContainer>
    </>
  );
};

const CollectionWellTextContainer = styled.div`
  margin-left: 8px;
`;

const CollectionWellIconContainer = styled.div`
  height: 24px;
  width: 24px;
  > svg {
    height: 24px;
    width: 24px;
  }
`;

export const Web3Status: FC<{
  onConnectedClick?: () => void;
  prefixAddress?: string;
}> = () => {
  const account = usePriorityAccount();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const clickAwayRef = useRef<HTMLDivElement | null>(null);
  useClickAway(clickAwayRef, () => {
    setIsDropdownOpen(false);
  });

  const accountMetadata = useUser(account);

  const [{ y, opacity, pointerEvents, userSelect }, set] = useSpring(
    () => DropdownAnimation.hidden,
  );
  useEffect(() => {
    if (isDropdownOpen) {
      set(DropdownAnimation.visible);
    } else {
      set(DropdownAnimation.hidden);
    }
  }, [isDropdownOpen]);

  const isMounted = useMountedState();
  const authStatus = useAuthStatusByContext();
  const isAuthenticated = useIsAuthenticatedByContext();
  const isActivating = usePriorityIsActivating();

  const needsAuth = useMemo(
    () =>
      authStatus === 'in-progress' ||
      authStatus === 'failed' ||
      authStatus === 'require-full-auth' ||
      (!!account && authStatus === 'unknown'),
    [authStatus, account],
  );

  console.log(account, isActivating);

  return (
    <>
      <Web3StatusWrapper ref={clickAwayRef}>
        {!!account && (
          <StyledButton
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            isActive={isDropdownOpen}
          >
            <StyledUserAvatar size={28} user={account} />
            <AddressOrNameSpan style={{ marginLeft: 6 }}>
              {accountMetadata?.bestName}
            </AddressOrNameSpan>
          </StyledButton>
        )}
        {!account && !isActivating && (
          <PrimaryButton
            isActive={isDropdownOpen}
            onClick={() => setIsDropdownOpen(true)}
          >
            Connect Wallet
          </PrimaryButton>
        )}
        <DropdownSpacer />
        <Web3DropdownContainer
          style={{
            transform: y.to((v: number) => `translateY(${v}%`),
            opacity,
            pointerEvents,
            userSelect,
          }}
        >
          {!account && isMounted() && <Web3ConnectWalletContent />}
          {!!account && isAuthenticated && (
            <Web3ConnectedWalletContent setIsDropdownOpen={setIsDropdownOpen} />
          )}
          {!!account && needsAuth && <Web3ConnectedButNeedAuthWalletContent />}
        </Web3DropdownContainer>
      </Web3StatusWrapper>
    </>
  );
};

const AddressOrNameSpan = styled.span`
  margin-left: 8px;
  @media (max-width: ${BREAKPTS.LG}px) {
    display: none;
  }
`;

const CollectionGrid = styled.div`
  padding: 6px 4px;
`;

const CollectionWell = styled(BaseAnchor)<{ disabled?: boolean }>`
  padding: 12px 14px;
  border-radius: 7px;
  font-style: normal;
  position: relative;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  cursor: ${(p) => (p.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};
  line-height: 16px;
  :hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const CollectionWellDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background-color: #1eff27;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 8px;
  margin: auto;
`;

const ActionRowButton = styled(BaseButton)`
  padding: 12px 12px;
  font-weight: 600;
  color: black;
  font-size: 14px;
  display: block;
  width: 100%;
  text-align: left;
  transition: all 200ms ease-in-out;
  border-radius: 7px;
  &:hover {
    transform: none;
    background: rgba(0, 0, 0, 0.05);
  }
`;

const PrimaryActionRowButton = styled(ActionRowButton)`
  background: rgba(0, 0, 0, 0.025);
  &:hover {
    transform: none;
    background: rgba(0, 0, 0, 0.05);
  }
`;

const ConnectWalletButton = styled(PrimaryActionRowButton)`
  height: 48px;
  font-size: 16px;
  text-align: center;
  position: relative;
  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConnectWalletButtonIcon = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
  left: 8px;
  height: 30px;
  width: 30px;
  > svg {
    height: 30px;
    width: 30px;
  }
`;

const AccountManagementContainer = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 6px;
`;

const CollectionsContainer = styled.div``;

const Web3DropdownContainer = animated(styled.div`
  position: absolute;
  right: 0;
  margin-top: 10px;
  z-index: 1100;
  background: white;
  min-width: 256px;
  box-shadow: 0px 9px 20px rgba(0, 0, 0, 0.14);
  border-radius: 8px;
  opacity: 0;
`);

const DropdownSpacer = styled.div`
  background: transparent;
  width: 100%;
  height: 10px;
  position: absolute;
`;

const Web3StatusWrapper = styled.div`
  position: relative;
`;

const StyledButton = styled(BaseButton)<{ isActive?: boolean }>`
  height: 40px;
  padding: 6px 8px 6px 6px;
  font-weight: 600;
  color: black;
  font-size: 14px;
  line-height: 14px;
  display: flex;
  align-items: center;
  @media (max-width: ${BREAKPTS.LG}px) {
    padding: 6px 6px 6px 6px;
  }
  border-radius: 999px;
  transition: all 200ms ease-in-out;
  background: ${(p) =>
    p.isActive ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0)'};
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  :disabled {
    color: rgba(0, 0, 0, 0.1);
  }
`;

const PrimaryButton = styled(StyledButton)<{ isActive?: boolean }>`
  padding: 6px 16px;
  color: white;
  background: ${(p) => (p.isActive ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,1)')};
  border-radius: 4px;
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  :disabled {
    color: white;
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(StyledButton)<{ isActive?: boolean }>`
  padding: 6px 16px;
  color: black;
  background: ${(p) => (p.isActive ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)')};
  border-radius: 4px;
  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`;
