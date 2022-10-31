import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import {
  OFF_CHAIN_METADATA_INFO_REGISTRY_PREFIX,
  USER_ADDED_REGISTRY_INFO_INDEX,
} from '@hash/protocol';
import { useCallback, useMemo } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { fb } from '../clients/firebase-app';
import {
  TokenMetadataKey,
  TokenMetadataWithDocumentsAndInfos,
} from '../types/metadata';
import { SignedTextWithMetadata } from '../types/signing';
import { Verdict } from '../types/verdict';
import { pinIPFSMetadataByAPI } from '../utils/ipfs-metadata';
import { useTokenId } from './useTokenId';
import {
  useOptimisticTokenMetadata,
  useWriteOnChainMetadata,
  useWriteOptimisticTokenMetadata,
} from './useTokenMetadata';

export interface UserAddedMetadata {
  name: string;
  description: string;
  verdict?: Verdict;
  writer: string;
  titleAndDescriptionContentHash: string;
}

export const useUserAddedMetadataByHash = (hash: string | undefined) => {
  const tokenId = useTokenId(hash);
  return useUserAddedMetadata(hash, tokenId ?? undefined);
};

export const useUserAddedMetadataByTokenMetadata = (
  tokenMetadata: Partial<TokenMetadataWithDocumentsAndInfos> | undefined,
) => {
  return useMemo(() => {
    if (!tokenMetadata) {
      return undefined;
    }

    const {
      name,
      description,
      descriptionHtml,
      originalName,
      originalDescription,
      verdict,
      documentsAndInfos,
      titleAndDescriptionContentHash,
    } = tokenMetadata;
    return {
      name: originalName ?? name,
      description: originalDescription ?? description,
      verdict,
      writer: documentsAndInfos?.[0][USER_ADDED_REGISTRY_INFO_INDEX]?.writer,
      titleAndDescriptionContentHash,
    } as UserAddedMetadata;
  }, [tokenMetadata]);
};

export const useUserAddedMetadata = (
  hash: string | undefined,
  tokenId: string | undefined,
) => {
  const metadata = useOptimisticTokenMetadata(hash);

  return useUserAddedMetadataByTokenMetadata(metadata);
};

export const useWriteUserAddedMetadata = (
  hash: string | undefined,
  tokenId: string | undefined,
  tokenMetadata: Partial<TokenMetadataWithDocumentsAndInfos> | undefined,
) => {
  const proxyRef = useMemo(() => {
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.SIGNED_TEXTS)
      .where('hash', '==', hash)
      .orderBy('createdAt', 'desc');
  }, [hash]);

  const [proxyDocuments] = useCollectionData<SignedTextWithMetadata>(proxyRef, {
    idField: 'id',
  });

  const {
    error: onChainError,
    status: onChainStatus,
    updateMetadataByTexts,
    updateMetadataBySignedTexts,
    isUpdatable: isOnChainUpdatable,
  } = useWriteOnChainMetadata(tokenId);

  const {
    status: optimisticStatus,
    createSignedMetadata,
    isUpdatable: isOptimisticUpdatable,
  } = useWriteOptimisticTokenMetadata(hash);

  const updateTitleAndDescription = useCallback(
    async (title: string, description: string, isOptimistic?: boolean) => {
      if (!hash) {
        return;
      }
      const cid = await pinIPFSMetadataByAPI({ title, description });

      if (isOptimistic) {
        createSignedMetadata('metadataCID', cid);
      } else {
        const keys: TokenMetadataKey[] = ['metadataCID'];
        const texts: string[] = [cid];
        updateMetadataByTexts(keys, texts);
      }
    },
    [hash, createSignedMetadata, updateMetadataByTexts],
  );

  const submitOptimisticTitleAndDescription = useCallback(async () => {
    if (!proxyDocuments?.[0]) {
      return;
    }

    const keys: TokenMetadataKey[] = ['metadataCID'];
    const signedTexts: SignedTextWithMetadata[] = [proxyDocuments[0]];
    updateMetadataBySignedTexts(keys, signedTexts);
  }, [updateMetadataBySignedTexts, proxyDocuments]);

  const isOptimisticSubmittableOnChain = useMemo(
    () =>
      isOnChainUpdatable &&
      tokenMetadata?.documentsAndInfos?.[1]?.[
        USER_ADDED_REGISTRY_INFO_INDEX
      ]?.registry?.startsWith(OFF_CHAIN_METADATA_INFO_REGISTRY_PREFIX) &&
      !!proxyDocuments?.[0],
    [isOnChainUpdatable, proxyDocuments, tokenMetadata],
  );

  return useMemo(() => {
    return {
      // updating
      updateTitleAndDescription,
      isOnChainUpdatable,
      isOptimisticUpdatable,
      optimisticStatus,
      onChainStatus,
      onChainError,
      submitOptimisticTitleAndDescription,
      isOptimisticSubmittableOnChain,
    };
  }, [
    onChainStatus,
    isOnChainUpdatable,
    isOptimisticSubmittableOnChain,
    isOptimisticUpdatable,
    optimisticStatus,
    onChainError,
    onChainStatus,
    submitOptimisticTitleAndDescription,
  ]);
};
