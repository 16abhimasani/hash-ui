import {
  constructHashArtFilePath,
  FIREBASE_STORAGE_BUCKET_IDENTIFIER,
} from '@hash/firebase-utils';
import { admin } from '../../clients/firebase-server';

const bucket = admin.storage().bucket();

export const addThumbnailsFromFirebaseAdmin = async (
  metadata: any,
): Promise<any> => {
  const tx = metadata?.properties?.tx?.value;
  // HACK: metadata stores season attributes in all caps, lowercasing it to match Season Type
  const season = metadata?.properties?.season?.value?.toLowerCase();
  if (!tx || !season) {
    return metadata;
  }

  const ref = await bucket.file(constructHashArtFilePath(tx, season));
  if ((await ref.exists())[0]) {
    const cachedImage = `https://storage.googleapis.com/${FIREBASE_STORAGE_BUCKET_IDENTIFIER}/${constructHashArtFilePath(
      tx,
      season,
    )}`;
    return {
      ...metadata,
      cachedImage,
    };
  } else {
    return metadata;
  }
};
