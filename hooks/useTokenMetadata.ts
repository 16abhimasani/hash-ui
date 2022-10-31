import { BigNumber } from '@ethersproject/bignumber';
import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { deployments, offChainSeasonToRegistryInfo } from '@hash/protocol';
import { MetadataRegistryInfo } from '@hash/protocol/deployments/types';
import { getUnixTime } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import useSWR from 'swr';
import { fb } from '../clients/firebase-app';
import {
  usePriorityAccount,
  usePriorityProvider,
} from '../connectors/priority';
import { CHAIN_ID, ZERO } from '../constants';
import { ROUTES } from '../constants/routes';
import { useCurrentUserHasEitherRoles } from '../contexts/auth';
import {
  applyMiddlewares,
  EMPTY_DOCUMENT,
  mergeDocumentsByInfos,
  MetadataDocument,
} from '../coordinator';
import {
  addThumbnailsFromFirebaseClient,
  replaceImageWithPrivateGatewayFile,
} from '../coordinator/middleware';
import {
  mergeOnchainAndOffChainMetadata,
  OptimisticCoordinatorOptions,
} from '../coordinator/optimistic';
import { useTransactionsStore } from '../stores/transaction';
import {
  TokenMetadata,
  TokenMetadataKey,
  TokenMetadataWithDocumentsAndInfos,
} from '../types/metadata';
import { OptimisticStatus } from '../types/optimistic';
import { SignedText, SignedTextWithMetadata } from '../types/signing';
import { TransactionStatus } from '../types/transaction';
import { fetcher } from '../utils/fetcher';
import { getSignedTextHash } from '../utils/signing';
import {
  useSignedTextMetadataWriterContract,
  useTokenOwnerMetadataWriterContract,
} from './useContracts';
import { useOwnerByHash, useOwnerByTokenId } from './useOwner';
import { useSeasonFromHash } from './useSeason';
import { useSignMessage } from './useSignMessage';
import { useTokenId } from './useTokenId';
import { useTxn } from './useTxn';

export type TokenMetadataStatus = 'updatable' | 'metadata' | TransactionStatus;

export const useOnChainDocumentsAndInfos = (
  id: string | undefined,
): [MetadataDocument[], MetadataRegistryInfo[]] | undefined => {
  const transactionMap = useTransactionsStore((s) => s.transactionMap);

  const { data } = useSWR(
    useMemo(
      () =>
        !!id
          ? `${ROUTES.API.TOKEN_METADATA.DOCUMENTS_AND_INFOS}?&tokenId=${id}`
          : null,
      [id, transactionMap],
    ),
    fetcher,
  );

  return useMemo(() => {
    if (!id) {
      return [[], []];
    }
    if (!data || !data?.infos || !data?.documents) {
      return undefined;
    }

    return [
      data.documents.map((d: any) => ({
        ...d,
        creationTime: BigNumber.from(d.creationTime),
      })) as MetadataDocument[],
      data.infos as MetadataRegistryInfo[],
    ];
  }, [data]);
};

const DEFAULT_OPTIMISTIC_COORDINATOR_OPTIONS: OptimisticCoordinatorOptions = {
  shouldUseUnderVotedVerdicts: true,
};

export const useOffChainDocumentsAndInfos = (
  hash: string | undefined,
  options: OptimisticCoordinatorOptions = DEFAULT_OPTIMISTIC_COORDINATOR_OPTIONS,
) => {
  const seasonFromHash = useSeasonFromHash(hash);
  const season = useMemo(
    () => options.preferredSeason ?? seasonFromHash,
    [seasonFromHash, options.preferredSeason],
  );
  const infos = useMemo(
    () => (!!season ? offChainSeasonToRegistryInfo[season] : undefined),
    [season],
  );

  const { data: baseMetadataDocument } = useSWR(
    useMemo(
      () =>
        !!hash
          ? `${ROUTES.API.TOKEN_METADATA.BASE}?season=${season}&hash=${hash}`
          : null,
      [season, hash],
    ),
    fetcher,
    {},
  );

  const proxyRef = useMemo(() => {
    if (!hash) {
      return undefined;
    }

    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.SIGNED_TEXTS)
      .where('hash', '==', hash)
      .orderBy('createdAt', 'desc');
  }, [hash]);

  const [proxyDocuments] = useCollectionData<SignedTextWithMetadata>(proxyRef, {
    idField: 'id',
  });

  const proxyMetadataDocument = useMemo((): MetadataDocument | undefined => {
    if (!proxyDocuments) {
      return undefined;
    }
    const document = proxyDocuments[0];
    if (!!document) {
      return {
        writer: document.writer,
        creationTime: BigNumber.from(document.createdAt),
        text: JSON.stringify({
          ...JSON.parse(document.ipfsContentDump),
          cid: document.text,
        }),
      };
    }
    return EMPTY_DOCUMENT;
  }, [proxyDocuments]);

  // const derivedRef = useMemo(() => {
  //   if (!proxyMetadataDocument) {
  //     return undefined;
  //   }

  //   const { cid } = JSON.parse(proxyMetadataDocument.text);

  //   if (!cid) {
  //     return undefined;
  //   }

  //   return fb
  //     .firestore()
  //     .collection(FIRESTORE_ROUTES.VERDICT_METADATAS.ROOT)
  //     .where('verdict.contentHash', '==', cid)
  //     .where(
  //       'offChainMetadata.numAffirmations',
  //       '>=',
  //       options.shouldUseUnderVotedVerdicts ? 0 : AFFIRMATION_NUM_VOTES_NEEDED,
  //     );
  // }, [proxyMetadataDocument, options]);

  // const [derivedDocuments] =
  //   useCollectionData<SignedVerdictMetadataFromFirebase>(derivedRef, {
  //     idField: 'id',
  //   });

  const derivedMetadataDocument = useMemo((): MetadataDocument | undefined => {
    return EMPTY_DOCUMENT;
    // if (!derivedDocuments) {
    //   return undefined;
    // }
    // const document = derivedDocuments[0];
    // if (!!document) {
    //   return {
    //     writer: document.signer ?? (document.verdict as any).signer,
    //     creationTime: BigNumber.from(document.verdict.createdAt),
    //     text: JSON.stringify(document),
    //   };
    // }
    // return EMPTY_DOCUMENT;
  }, []);

  return useMemo(():
    | [MetadataDocument[], MetadataRegistryInfo[]]
    | undefined => {
    if (
      !baseMetadataDocument ||
      !proxyMetadataDocument ||
      !derivedMetadataDocument
    ) {
      return undefined;
    }

    return [
      infos?.map((info: MetadataRegistryInfo) => {
        if (info.registry.includes(deployments[CHAIN_ID].registry.base)) {
          return baseMetadataDocument;
        }
        if (info.registry.includes(deployments[CHAIN_ID].registry.proxy)) {
          return proxyMetadataDocument;
        }
        if (info.registry.includes(deployments[CHAIN_ID].registry.derived)) {
          return derivedMetadataDocument;
        }
        return EMPTY_DOCUMENT;
      }) ?? [],
      infos ?? [],
    ];
  }, [
    infos,
    baseMetadataDocument,
    proxyMetadataDocument,
    derivedMetadataDocument,
  ]);
};

export const useWriteOnChainMetadata = (id: string | undefined) => {
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const writer = useTokenOwnerMetadataWriterContract(true);
  const signedTextWriter = useSignedTextMetadataWriterContract(true);
  const owner = useOwnerByTokenId(id);
  const account = usePriorityAccount();
  const [error, setError] = useState<any | undefined>(undefined);

  const isUpdatable = useMemo(
    () => account?.toLowerCase() === owner?.toLowerCase(),
    [account, owner],
  );

  const tx = useTxn(
    useMemo(
      () => ({ tokenId: id ?? '', type: 'updating-token-metadata' }),
      [id],
    ),
  );

  const txStatus: TransactionStatus | undefined = useMemo(
    () => tx?.status,
    [tx],
  );

  const updateMetadataByTexts = useCallback(
    async (keys: TokenMetadataKey[], texts: string[]) => {
      if (!isUpdatable) {
        return;
      }
      if (!id) {
        return;
      }
      try {
        const res = await writer?.writeDocuments(id, keys, texts);
        if (!!res) {
          addTransaction(res.hash, {
            tokenId: id,
            type: 'updating-token-metadata',
          });
          setError(undefined);
        }
      } catch (e) {
        console.error(e);
        setError(e);
      }
    },
    [isUpdatable, writer, id],
  );

  const updateMetadataBySignedTexts = useCallback(
    async (keys: TokenMetadataKey[], signedTexts: SignedText[]) => {
      if (!isUpdatable) {
        return;
      }

      if (!id) {
        return;
      }
      try {
        const res = await signedTextWriter?.writeDocuments(
          id,
          keys,
          signedTexts,
          {
            value: ZERO,
          },
        );
        if (!!res) {
          addTransaction(res.hash, {
            tokenId: id,
            type: 'updating-token-metadata',
          });
          setError(undefined);
        }
      } catch (e) {
        console.error(e);
        setError(e);
      }
    },
    [isUpdatable, signedTextWriter, id],
  );

  const status: TokenMetadataStatus = useMemo(() => {
    if (!!txStatus) {
      return txStatus;
    }
    if (error) {
      return 'failed';
    }
    return isUpdatable ? 'updatable' : 'metadata';
  }, [error, txStatus, isUpdatable]);

  return useMemo(() => {
    return {
      error,
      tx,
      status,
      updateMetadataByTexts,
      updateMetadataBySignedTexts,
      isUpdatable,
    };
  }, [
    error,
    tx,
    status,
    isUpdatable,
    updateMetadataByTexts,
    updateMetadataBySignedTexts,
  ]);
};

export const useWriteOptimisticTokenMetadata = (hash: string | undefined) => {
  const account = usePriorityAccount();
  const library = usePriorityProvider();
  const signMessage = useSignMessage();
  const owner = useOwnerByHash(hash);
  const isHistorianOrScribe = useCurrentUserHasEitherRoles([
    'historian',
    'scribe',
  ]);
  const isUpdatable = useMemo(() => {
    if (!account) {
      return false;
    }
    return (
      isHistorianOrScribe || owner?.toLowerCase() === account?.toLowerCase()
    );
  }, [isHistorianOrScribe, account, account, owner]);

  const [status, setStatus] = useState<OptimisticStatus>('updatable');

  const createSignedMetadata = useCallback(
    async (key: TokenMetadataKey, text: string) => {
      if (!account || !library) {
        return;
      }
      if (!hash) {
        return;
      }
      setStatus('in-progress');
      const createdAt = getUnixTime(Date.now());

      const signedMetadataHash = getSignedTextHash({
        writer: account,
        text,
        txHash: hash,
        fee: ZERO.toString(),
        createdAt,
      });

      try {
        const signature = (await signMessage(signedMetadataHash)) ?? '0x00';

        const signedText: SignedText = {
          writer: account,
          text,
          txHash: hash,
          fee: ZERO.toString(),
          createdAt,
          signature,
        };

        const res = await fetch(
          `${ROUTES.API.TOKEN_METADATA.CREATE_SIGNED_TEXT}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ signedText, key, hash }),
          },
        );
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('failed');
        }
      } catch (e) {
        console.error(e);
        setStatus('failed');
      }
    },
    [account, hash],
  );

  return useMemo(() => {
    return {
      status,
      createSignedMetadata,
      isUpdatable,
    };
  }, [isUpdatable, status, createSignedMetadata]);
};

const useMergeDocumentsByInfos = (
  documents: MetadataDocument[] | undefined,
  infos: MetadataRegistryInfo[] | undefined,
  middlewares: ((m: any) => Promise<any>)[] = [],
) => {
  const [metadata, setMetadata] = useState<Partial<TokenMetadata> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!documents || !infos) {
      return;
    }
    const mergeAndTransform = async () => {
      return applyMiddlewares(
        await mergeDocumentsByInfos(documents, infos),
        middlewares,
      );
    };
    mergeAndTransform().then(setMetadata);
  }, [documents, infos]);
  return metadata;
};

export const useOnChainTokenMetadata = (id: string | undefined) => {
  const documentsAndInfos = useOnChainDocumentsAndInfos(id);
  const metadata = useMergeDocumentsByInfos(
    documentsAndInfos?.[0],
    documentsAndInfos?.[1],
  );
  return useMemo(
    () =>
      !!metadata
        ? ({
            ...metadata,
            documentsAndInfos,
          } as TokenMetadataWithDocumentsAndInfos)
        : undefined,
    [documentsAndInfos, metadata],
  );
};

export const useOptimisticTokenMetadata = (
  hash: string | undefined,
  options: OptimisticCoordinatorOptions = DEFAULT_OPTIMISTIC_COORDINATOR_OPTIONS,
) => {
  const tokenId = useTokenId(hash ?? undefined);
  const onChainDocumentsAndInfos = useOnChainDocumentsAndInfos(
    tokenId ?? undefined,
  );
  const offChainDocumentsAndInfos = useOffChainDocumentsAndInfos(hash, options);

  const [optimisticDocumentsAndInfos, setOptimisticDocumentAndInfos] = useState<
    [MetadataDocument[], MetadataRegistryInfo[]]
  >([[], []]);

  useEffect(() => {
    if (!offChainDocumentsAndInfos || !onChainDocumentsAndInfos) {
      return;
    }
    mergeOnchainAndOffChainMetadata(
      onChainDocumentsAndInfos[0],
      onChainDocumentsAndInfos[1],
      offChainDocumentsAndInfos[0],
      offChainDocumentsAndInfos[1],
    ).then(setOptimisticDocumentAndInfos);
  }, [onChainDocumentsAndInfos, offChainDocumentsAndInfos]);

  const metadata = useMergeDocumentsByInfos(
    optimisticDocumentsAndInfos[0],
    optimisticDocumentsAndInfos[1],
    [replaceImageWithPrivateGatewayFile, addThumbnailsFromFirebaseClient],
  );

  return useMemo(
    () =>
      !!hash
        ? ({
            ...metadata,
            documentsAndInfos: optimisticDocumentsAndInfos,
          } as Partial<TokenMetadataWithDocumentsAndInfos>)
        : {},
    [metadata, optimisticDocumentsAndInfos],
  );
};
