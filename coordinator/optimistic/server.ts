import { BigNumber } from '@ethersproject/bignumber';
import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import {
  deployments,
  HashRegistryV2__factory,
  MetadataCoordinator__factory,
  Multicall__factory,
  offChainSeasonToRegistryInfo,
} from '@hash/protocol';
import { MetadataRegistryInfo } from '@hash/protocol/deployments/types';
import { CURRENT_SEASON, getSeasonFromTokenId } from '@hash/seasons';
import {
  mergeOnchainAndOffChainMetadata,
  OptimisticCoordinatorOptions,
} from '.';
import {
  applyMiddlewares,
  EMPTY_DOCUMENT,
  mergeDocumentsByInfos,
  MetadataDocument,
} from '..';
import { PROVIDER } from '../../clients/provider';
import { CHAIN_ID, NULL_ADDRESS, ZERO } from '../../constants';
import { TokenMetadata } from '../../types/metadata';
import { addTokenIdToTokenMetadata } from '../middleware';
import { getBaseMetadata } from '../season/server';

const coordinator = MetadataCoordinator__factory.connect(
  deployments[CHAIN_ID].registry.coordinator,
  PROVIDER,
);

const hash = HashRegistryV2__factory.connect(
  deployments[CHAIN_ID].registry.hash,
  PROVIDER,
);

const multiCall = Multicall__factory.connect(
  deployments[CHAIN_ID].misc.multicall,
  PROVIDER,
);

const getProxyMetadata = async (
  firestore: FirebaseFirestore.Firestore,
  txHash: string,
  options: OptimisticCoordinatorOptions,
) => {
  const query = await firestore
    .collection(FIRESTORE_ROUTES.SIGNED_TEXTS)
    .where('hash', '==', txHash)
    .orderBy('createdAt', 'desc')
    .get();
  if (!query.empty) {
    const data = query.docs[0].data();

    if (!data) {
      return EMPTY_DOCUMENT;
    }
    return {
      text:
        (!!data.ipfsContentDump
          ? JSON.stringify({
              ...JSON.parse(data.ipfsContentDump),
              cid: data.text,
            })
          : undefined) ??
        data.text ??
        '{}',
      writer: data.writer ?? NULL_ADDRESS,
      creationTime: BigNumber.from(data.createdAt ?? 0),
    };
  } else {
    return EMPTY_DOCUMENT;
  }
};

const getDerivedMetadata = async (
  firestore: FirebaseFirestore.Firestore,
  txHash: string,
  options: OptimisticCoordinatorOptions,
) => {
  return EMPTY_DOCUMENT;
  // const proxyQuery = await firestore
  //   .collection(FIRESTORE_ROUTES.SIGNED_TEXTS)
  //   .where('hash', '==', txHash)
  //   .orderBy('createdAt', 'desc')
  //   .get();

  // const proxyContentHash =
  //   proxyQuery.docs?.[0]?.data()?.text ?? EMPTY_DOCUMENT.text;

  // const query = await firestore
  //   .collection(FIRESTORE_ROUTES.VERDICT_METADATAS.ROOT)
  //   .where('verdict.contentHash', '==', proxyContentHash)
  //   .where(
  //     'offChainMetadata.numAffirmations',
  //     '>=',
  //     options.shouldUseUnderVotedVerdicts ? 0 : AFFIRMATION_NUM_VOTES_NEEDED,
  //   )
  //   .get();

  // if (!query.empty) {
  //   const data = query.docs[0].data() ?? {};
  //   return {
  //     text: JSON.stringify({ ...data, cid: query.docs[0].id }),
  //     writer: data.signer ?? (data.verdict as any).signer,
  //     creationTime: BigNumber.from(data.verdict?.creationTime ?? 0),
  //   };
  // } else {
  //   return EMPTY_DOCUMENT;
  // }
};

const DEFAULT_OPTIMISTIC_COORDINATOR_OPTIONS: OptimisticCoordinatorOptions = {
  shouldUseUnderVotedVerdicts: false,
};

const optimisticCoordinator = (firestore: FirebaseFirestore.Firestore) => ({
  idAndTxHashToDocuments: async (
    id: string,
    onChainDocuments: MetadataDocument[],
    onChainInfos: MetadataRegistryInfo[],
    txHash: string,
    options: OptimisticCoordinatorOptions = DEFAULT_OPTIMISTIC_COORDINATOR_OPTIONS,
  ): Promise<[MetadataDocument[], MetadataRegistryInfo[]]> => {
    const season =
      options.preferredSeason ?? getSeasonFromTokenId(id) ?? CURRENT_SEASON;
    const offChainRegistryInfos: MetadataRegistryInfo[] =
      offChainSeasonToRegistryInfo[season];
    const offChainPromises: Promise<MetadataDocument>[] = [];
    for (const info of offChainRegistryInfos) {
      if (info.registry.includes(deployments[CHAIN_ID].registry.base)) {
        offChainPromises.push(
          (getBaseMetadata ?? getBaseMetadata)(txHash, season, options),
        );
      }
      if (info.registry.includes(deployments[CHAIN_ID].registry.proxy)) {
        offChainPromises.push(getProxyMetadata(firestore, txHash, options));
      }
      if (info.registry.includes(deployments[CHAIN_ID].registry.derived)) {
        offChainPromises.push(getDerivedMetadata(firestore, txHash, options));
      }
    }
    const offChainDocuments = await Promise.all(offChainPromises);
    return mergeOnchainAndOffChainMetadata(
      onChainDocuments,
      onChainInfos,
      offChainDocuments,
      offChainRegistryInfos,
    );
  },
});

export const getTokenMetadataByOptimistic = async (
  firestore: FirebaseFirestore.Firestore,
  txHash: string,
  middlewares: ((m: any) => Promise<any>)[] = [],
) => {
  const hashCalldata = hash.interface.encodeFunctionData('txHashToTokenId', [
    txHash,
  ]);

  const documentsCalldata = coordinator.interface.encodeFunctionData(
    'txHashToDocuments',
    [txHash],
  );

  const calls = [
    {
      target: hash.address,
      callData: hashCalldata,
    },
    {
      target: coordinator.address,
      callData: documentsCalldata,
    },
  ];

  const callRes = await multiCall.callStatic.aggregate(calls);
  const txHashRes = hash.interface.decodeFunctionResult(
    'txHashToTokenId',
    callRes[1][0],
  );
  const documentsRes = coordinator.interface.decodeFunctionResult(
    'txHashToDocuments',
    callRes[1][1],
  );
  const id = BigNumber.from(txHashRes[0]);
  const [onChainDocuments, onChainInfos] = documentsRes;
  const [documents, infos] = await optimisticCoordinator(
    firestore,
  ).idAndTxHashToDocuments(
    id.toHexString(),
    onChainDocuments,
    onChainInfos,
    txHash,
  );

  return (await applyMiddlewares(
    await mergeDocumentsByInfos(documents, infos),
    [
      addTokenIdToTokenMetadata(id.eq(ZERO) ? null : id.toHexString()),
      ...middlewares,
    ],
  )) as TokenMetadata;
};
