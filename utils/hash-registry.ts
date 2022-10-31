import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { deployments, HashRegistryV2__factory } from '@hash/protocol';
import { admin } from '../clients/firebase-server';
import { PROVIDER } from '../clients/provider';
import { CHAIN_ID, ZERO } from '../constants';
import { padHexString } from './hex';

const firestore = admin.firestore();

export const hashRegistryCached = {
  tokenIdToTxHash: async (tokenId: string) => {
    const registry = HashRegistryV2__factory.connect(
      deployments[CHAIN_ID].registry.hash,
      PROVIDER,
    );
    const tokenIdToHashRef = firestore
      .collection(FIRESTORE_ROUTES.TOKEN_ID_TO_HASH)
      .doc(tokenId);
    const snapshot = await tokenIdToHashRef.get();
    if (!!snapshot.data()?.hash) {
      return snapshot.data()?.hash;
    }

    const hashBn = await registry.tokenIdToTxHash(tokenId);

    if (hashBn.eq(ZERO)) {
      return undefined;
    }

    const hash = padHexString(hashBn.toHexString());
    const hashToTokenIdRef = firestore
      .collection(FIRESTORE_ROUTES.HASH_TO_TOKEN_ID)
      .doc(hash);

    const batch = firestore.batch();
    batch.set(hashToTokenIdRef, { tokenId });
    batch.set(tokenIdToHashRef, { hash });
    await batch.commit();
    return hash;
  },
  txHashToTokenId: async (hash: string) => {
    const registry = HashRegistryV2__factory.connect(
      deployments[CHAIN_ID].registry.hash,
      PROVIDER,
    );
    const hashToTokenIdRef = firestore
      .collection(FIRESTORE_ROUTES.HASH_TO_TOKEN_ID)
      .doc(hash);
    const snapshot = await hashToTokenIdRef.get();
    if (!!snapshot.data()?.tokenId) {
      return snapshot.data()?.tokenId;
    }

    const tokenIdBn = await registry.txHashToTokenId(hash);

    if (tokenIdBn.eq(ZERO)) {
      return undefined;
    }

    const tokenIdToHashRef = firestore
      .collection(FIRESTORE_ROUTES.TOKEN_ID_TO_HASH)
      .doc(tokenIdBn.toHexString());

    const batch = firestore.batch();
    batch.set(hashToTokenIdRef, { tokenId: tokenIdBn.toHexString() });
    batch.set(tokenIdToHashRef, { hash });
    await batch.commit();
    return padHexString(tokenIdBn.toHexString());
  },
};
