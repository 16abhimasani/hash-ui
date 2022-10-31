import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { admin } from '../clients/firebase-server';
import { PROVIDER } from '../clients/provider';
import { shortenHexString } from './hex';

const firestore = admin.firestore();

export const getUserMetadata = async (address: string) => {
  const ens = await PROVIDER.lookupAddress(address);
  const shortenedAddress = shortenHexString(address);
  const userMetadataRef = firestore
    .collection(FIRESTORE_ROUTES.USER_METADATAS)
    .doc(address);
  const snapshot = await userMetadataRef.get();
  const username = snapshot.data()?.username;
  const profileImage = snapshot.data()?.profileImage;
  const getBestName = () => {
    if (!!username) {
      return `@${username}`;
    }
    if (!!ens) {
      return ens;
    }
    return shortenedAddress;
  };
  return {
    address,
    shortenedAddress,
    ens,
    username,
    profileImage,
    bestName: getBestName(),
  };
};
