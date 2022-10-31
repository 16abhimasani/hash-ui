import React, { useMemo } from 'react';
import { FirestoreToken } from '../types/metadata';

export interface TokenPrefetchData {
  metadata: Partial<FirestoreToken & { owner: string }>;
  hash: string;
}

export interface TokenPrefetchProviderContext {
  prefetchedTokenMetadatas: {
    [hash: string]: Partial<FirestoreToken & { owner: string }>;
  };
}

export type TokenPrefetchProviderState = TokenPrefetchProviderContext;

const initialAppState: TokenPrefetchProviderState = {
  prefetchedTokenMetadatas: {},
};

const Context =
  React.createContext<TokenPrefetchProviderState>(initialAppState);

export interface TokenContextInterface {
  prefetchDatas?: TokenPrefetchData[];
}

export const TokenPrefetchProvider: React.FC<TokenContextInterface> = ({
  prefetchDatas,
  children,
}) => {
  const prefetchedTokenMetadatas = useMemo(() => {
    if (!prefetchDatas) {
      return {} as {
        [hash: string]: Partial<FirestoreToken & { owner: string }>;
      };
    }
    return prefetchDatas.reduce((a, c) => {
      return {
        ...a,
        [c.hash]: c.metadata,
      };
    }, {}) as { [hash: string]: Partial<FirestoreToken & { owner: string }> };
  }, [prefetchDatas]);
  const appStateObject = useMemo(() => {
    return {
      prefetchedTokenMetadatas,
    };
  }, [prefetchedTokenMetadatas]);

  return <Context.Provider value={appStateObject}>{children}</Context.Provider>;
};

export const useTokenPrefetchContext = (): TokenPrefetchProviderState => {
  return React.useContext(Context);
};

export const usePrefetchedTokenMetadataByContext = (
  hash: string | undefined,
) => {
  return useTokenPrefetchContext()?.prefetchedTokenMetadatas?.[hash ?? ''];
};
