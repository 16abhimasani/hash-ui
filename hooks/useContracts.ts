import { JsonRpcProvider } from '@ethersproject/providers';
import {
  AffirmationWriter__factory,
  deployments,
  ERC20__factory,
  FlatPriceMinter__factory,
  HashV2__factory,
  Multicall__factory,
  SignedTextMetadataWriter__factory,
  TokenMetadataRegistry__factory,
  TokenOwnerMetadataWriter__factory,
} from '@hash/protocol';
import { useMemo } from 'react';
import { getProviderOrSigner } from '../clients/provider';
import { usePriorityAccount } from '../connectors/priority';
import { CHAIN_ID } from '../constants';
import { useProvider } from './useProvider';

export const useMultiCallContract = (shouldUseFallback: boolean = false) => {
  const account = usePriorityAccount();
  const provider = useProvider(shouldUseFallback);

  return useMemo(() => {
    if (!provider) {
      return;
    }

    return Multicall__factory.connect(
      deployments[CHAIN_ID].misc.multicall,
      getProviderOrSigner(provider as JsonRpcProvider, account),
    );
  }, [account, provider]);
};

export const useTokenOwnerMetadataWriterContract = (
  shouldUseFallback: boolean = false,
) => {
  const account = usePriorityAccount();
  const provider = useProvider(shouldUseFallback);

  return useMemo(() => {
    if (!provider) {
      return;
    }
    return TokenOwnerMetadataWriter__factory.connect(
      deployments[CHAIN_ID].writer.tokenOwner,
      getProviderOrSigner(provider as JsonRpcProvider, account),
    );
  }, [account, provider]);
};

export const useSignedTextMetadataWriterContract = (
  shouldUseFallback: boolean = false,
) => {
  const account = usePriorityAccount();
  const provider = useProvider(shouldUseFallback);
  return useMemo(() => {
    if (!account || !provider) {
      return;
    }

    return SignedTextMetadataWriter__factory.connect(
      deployments[CHAIN_ID].writer.signedText,
      getProviderOrSigner(provider as JsonRpcProvider, account),
    );
  }, [account, provider]);
};

export const useHashV2Contract = (shouldUseFallback: boolean = false) => {
  const account = usePriorityAccount();
  const provider = useProvider(shouldUseFallback);
  return useMemo(() => {
    if (!provider) {
      return;
    }
    return HashV2__factory.connect(
      deployments[CHAIN_ID].nft.v2,
      getProviderOrSigner(provider as JsonRpcProvider, account),
    );
  }, [account, provider]);
};

export const useFlatPriceMinterContract = (
  shouldUseFallback: boolean = false,
) => {
  const account = usePriorityAccount();
  const provider = useProvider(shouldUseFallback);
  return useMemo(() => {
    if (!provider) {
      return;
    }
    return FlatPriceMinter__factory.connect(
      deployments[CHAIN_ID].minter.flatPrice,
      getProviderOrSigner(provider as JsonRpcProvider, account),
    );
  }, [account, provider]);
};

export const useTokenMetadataContract = (
  shouldUseFallback: boolean = false,
) => {
  const account = usePriorityAccount();
  const provider = useProvider(shouldUseFallback);

  return useMemo(() => {
    if (!provider) {
      return;
    }

    return TokenMetadataRegistry__factory.connect(
      deployments[CHAIN_ID].registry.metadata,
      getProviderOrSigner(provider as JsonRpcProvider, account),
    );
  }, [account, provider]);
};

export const useAffirmationWriter = (shouldUseFallback: boolean = false) => {
  const account = usePriorityAccount();
  const provider = useProvider(shouldUseFallback);

  return useMemo(() => {
    if (!provider) {
      return;
    }

    return AffirmationWriter__factory.connect(
      deployments[CHAIN_ID].writer.affirmation,
      getProviderOrSigner(provider as JsonRpcProvider, account),
    );
  }, [account, provider]);
};

export const useErc20Contract = (
  address: string | undefined,
  shouldUseFallback: boolean = false,
) => {
  const account = usePriorityAccount();
  const provider = useProvider(shouldUseFallback);

  return useMemo(() => {
    if (!provider) {
      return;
    }
    if (!address) {
      return;
    }
    return ERC20__factory.connect(
      address,
      getProviderOrSigner(provider as JsonRpcProvider, account),
    );
  }, [address, account, provider]);
};
