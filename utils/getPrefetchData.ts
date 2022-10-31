import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { deployments, HashRegistryV2__factory } from '@hash/protocol';
import { admin } from '../clients/firebase-server';
import { PROVIDER } from '../clients/provider';
import { CHAIN_ID, NULL_ADDRESS } from '../constants';
import { TokenPrefetchData } from '../contexts/tokenPrefetch';
import { ListPrefetchData, ListWithId } from '../types/list';
import { FirestoreToken } from '../types/metadata';
import { serializeFirestoreToken, serializeList } from './serialize';

const registry = HashRegistryV2__factory.connect(
  deployments[CHAIN_ID].registry.hash,
  PROVIDER,
);

export const getPrefetchDataForHash = async (
  hash: string,
): Promise<TokenPrefetchData | undefined> => {
  const firestore = admin.firestore();
  const metadataCacheRef = firestore
    .collection(FIRESTORE_ROUTES.TOKENS.ROOT)
    .doc(hash);

  const snapshot = await metadataCacheRef.get();

  if (!snapshot.exists) {
    return undefined;
  }

  const metadata = snapshot.data();

  const owner = await registry.ownerOfByTxHash(hash);

  return {
    hash,
    metadata: {
      ...serializeFirestoreToken(metadata),
      owner: owner === NULL_ADDRESS ? null : owner,
    } as Partial<FirestoreToken & { owner: string }>,
  };
};

export const getPrefetchDataForList = async (
  id: string,
): Promise<ListPrefetchData | undefined> => {
  const firestore = admin.firestore();

  const listRef = firestore.collection(FIRESTORE_ROUTES.CURATIONS.ROOT).doc(id);
  const listSettingsRef = listRef
    .collection(FIRESTORE_ROUTES.CURATIONS.SETTINGS.ROOT)
    .doc(FIRESTORE_ROUTES.CURATIONS.SETTINGS.DOC_ID);
  const [listDoc, listSettingsDoc] = await firestore.getAll(
    listRef,
    listSettingsRef,
  );
  if (!listDoc.exists) {
    return undefined;
  }
  return {
    list: serializeList({ ...listDoc.data(), id: listDoc.id } as ListWithId),
    // settings: listSettingsDoc.data(),
  };
};
