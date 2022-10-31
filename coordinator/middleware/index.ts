import { constructHashArtFilePath } from '@hash/firebase-utils';
import { fb } from '../../clients/firebase-app';
import {
  getArtworkPreviewUrl,
  getPrivateIpfsGatewayUrl,
} from '../../utils/urls';

export const replaceImageWithPrivateGatewayFile = async (
  metadata: any,
): Promise<any> => {
  if (!!metadata.image && metadata.image.startsWith('ipfs://')) {
    return {
      ...metadata,
      image: getPrivateIpfsGatewayUrl(metadata.image.slice(7)),
    };
  }

  return metadata;
};

export const replaceSvgWithPreviewUrl = async (metadata: any): Promise<any> => {
  const tx = metadata?.properties?.tx?.value;
  if (!tx) {
    return metadata;
  }
  if (
    !!metadata.image &&
    metadata.image.startsWith('data:image/svg+xml;base64,')
  ) {
    return {
      ...metadata,
      image: getArtworkPreviewUrl(tx),
    };
  }

  return metadata;
};

export const addThumbnailsFromFirebaseClient = async (
  metadata: any,
): Promise<any> => {
  const tx = metadata?.properties?.tx?.value;
  // HACK: metadata stores season attributes in all caps, lowercasing it to match Season Type
  const season = metadata?.properties?.season?.value?.toLowerCase();
  if (!tx || !season) {
    return metadata;
  }

  const ref = await fb.storage().ref(constructHashArtFilePath(tx, season));
  try {
    const cachedImage = await ref.getDownloadURL();
    return {
      ...metadata,
      cachedImage,
    };
  } catch (e: any) {
    // hit the preview service to trigger creation of cached file
    fetch(getArtworkPreviewUrl(tx));
    return metadata;
  }
};

export const addAlgoliaAttributes = async (metadata: any): Promise<any> => {
  return {
    ...metadata,
    isMinted: !!metadata.tokenId,
  };
};

export const addTokenIdToTokenMetadata =
  (tokenId: string | null) =>
  async (metadata: any): Promise<any> => ({ ...metadata, tokenId });
