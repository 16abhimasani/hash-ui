import {
  BASE_METADATA_REGISTRY_INFO_INDEX,
  USER_ADDED_REGISTRY_INFO_INDEX,
} from '@hash/protocol';
import { MetadataRegistryInfo } from '@hash/protocol/deployments/types';
import { Season } from '@hash/seasons';
import { MetadataDocument } from '..';
import { NULL_ADDRESS } from '../../constants';

export interface OptimisticCoordinatorOptions {
  shouldUseUnderVotedVerdicts?: boolean;
  preferredSeason?: Season;
}

export const mergeOnchainAndOffChainMetadata = async (
  onChainDocuments: MetadataDocument[],
  onChainInfos: MetadataRegistryInfo[],
  offChainDocuments: MetadataDocument[],
  offChainInfos: MetadataRegistryInfo[],
): Promise<[MetadataDocument[], MetadataRegistryInfo[]]> => {
  // during loading states, these arrays can be empty, short circuiting the logic here
  if (onChainDocuments.length === 0 && onChainInfos.length === 0) {
    return [offChainDocuments, offChainInfos];
  }
  if (offChainInfos.length === 0 && offChainInfos.length === 0) {
    return [onChainDocuments, onChainInfos];
  }

  // from here on out, we assume the metadata abides to the format of registry infos found on chain
  let documents: MetadataDocument[] = [];
  let infos: MetadataRegistryInfo[] = [];

  if (
    onChainDocuments[BASE_METADATA_REGISTRY_INFO_INDEX].writer === NULL_ADDRESS
  ) {
    documents.push(offChainDocuments[BASE_METADATA_REGISTRY_INFO_INDEX]);
    infos.push(offChainInfos[BASE_METADATA_REGISTRY_INFO_INDEX]);
  } else {
    documents.push(onChainDocuments[BASE_METADATA_REGISTRY_INFO_INDEX]);
    infos.push(onChainInfos[BASE_METADATA_REGISTRY_INFO_INDEX]);
  }

  const isOffChainLatest = offChainDocuments[
    USER_ADDED_REGISTRY_INFO_INDEX
  ].creationTime.gt(
    onChainDocuments[USER_ADDED_REGISTRY_INFO_INDEX].creationTime,
  );
  const isOnChainSameAsOffChain =
    offChainDocuments[USER_ADDED_REGISTRY_INFO_INDEX].text ===
    onChainDocuments[USER_ADDED_REGISTRY_INFO_INDEX].text;

  if (isOffChainLatest && !isOnChainSameAsOffChain) {
    documents.push(offChainDocuments[USER_ADDED_REGISTRY_INFO_INDEX]);
    infos.push(offChainInfos[USER_ADDED_REGISTRY_INFO_INDEX]);
  } else {
    documents.push(onChainDocuments[USER_ADDED_REGISTRY_INFO_INDEX]);
    infos.push(onChainInfos[USER_ADDED_REGISTRY_INFO_INDEX]);
  }

  // const optimisticVerdictMetadata = await getObjectFromURI(
  //   offChainDocuments[AFFIRMATION_REGISTRY_INFO_INDEX].text,
  // );

  // const onChainVerdictMetadata = await getObjectFromURI(
  //   onChainDocuments[AFFIRMATION_REGISTRY_INFO_INDEX].text,
  // );
  // const userAddedMetadataContentHash = (
  //   await getObjectFromURI(
  //     onChainDocuments[USER_ADDED_REGISTRY_INFO_INDEX].text,
  //   )
  // ).cid;

  // if (
  //   !!userAddedMetadataContentHash &&
  //   optimisticVerdictMetadata.verdict?.contentHash ===
  //     userAddedMetadataContentHash
  // ) {
  //   documents.push(offChainDocuments[AFFIRMATION_REGISTRY_INFO_INDEX]);
  //   infos.push(offChainInfos[AFFIRMATION_REGISTRY_INFO_INDEX]);
  // } else if (
  //   !!userAddedMetadataContentHash &&
  //   onChainVerdictMetadata.verdict?.contentHash === userAddedMetadataContentHash
  // ) {
  //   documents.push(onChainDocuments[AFFIRMATION_REGISTRY_INFO_INDEX]);
  //   infos.push(onChainInfos[AFFIRMATION_REGISTRY_INFO_INDEX]);
  // } else {
  //   documents.push(EMPTY_DOCUMENT);
  //   infos.push(onChainInfos[AFFIRMATION_REGISTRY_INFO_INDEX]);
  // }

  return [documents, infos];
};
