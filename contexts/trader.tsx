import { NftSwapV4 } from '@traderxyz/nft-swap-sdk';
import React, { useMemo } from 'react';
import { getProviderOrSigner } from '../clients/provider';
import { usePriorityAccount } from '../connectors/priority';
import { CHAIN_ID } from '../constants';
import { useProvider } from '../hooks/useProvider';
import { useIsHashApproved } from '../hooks/useTrader';

export interface TraderProviderContext {
  traderClient?: NftSwapV4;
  isHashApproved?: boolean;
}

export type TraderProviderState = TraderProviderContext;

const initialAppState: TraderProviderState = {
  traderClient: undefined,
};

const Context = React.createContext<TraderProviderState>(initialAppState);

export interface TokenContextInterface {}

export const TraderProvider: React.FC<TokenContextInterface> = ({
  children,
}) => {
  const account = usePriorityAccount();
  const provider = useProvider(true);

  const isHashApproved = useIsHashApproved(account);

  const traderClient = useMemo(() => {
    if (!provider) {
      return undefined;
    }
    if (!account) {
      return undefined;
    }
    return new NftSwapV4(
      provider,
      getProviderOrSigner(provider, account) as any,
      CHAIN_ID,
    );
  }, [account, provider]);

  const appStateObject = useMemo(() => {
    return {
      traderClient,
      isHashApproved,
    };
  }, [traderClient, isHashApproved]);

  return <Context.Provider value={appStateObject}>{children}</Context.Provider>;
};

export const useTraderContext = (): TraderProviderState => {
  return React.useContext(Context);
};

export const useTraderClientByContext = (): NftSwapV4 | undefined => {
  return React.useContext(Context)?.traderClient;
};

export const useIsHashApprovedByContext = (): boolean | undefined => {
  return React.useContext(Context)?.isHashApproved;
};
