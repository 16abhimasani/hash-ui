import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { createHash } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { admin } from '../../../clients/firebase-server';
import {
  addAlgoliaAttributes,
  replaceImageWithPrivateGatewayFile,
  replaceSvgWithPreviewUrl,
} from '../../../coordinator/middleware';
import { addThumbnailsFromFirebaseAdmin } from '../../../coordinator/middleware/server';
import { getTokenMetadataByOptimistic } from '../../../coordinator/optimistic/server';
import { getAdditionalMintingMetadataForTokenForAlgolia } from '../../../utils/algolia';
import { TX_HASH_REGEX } from '../../../utils/regex';

const firestore = admin.firestore();

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { txHash } = req.query;

  if (typeof txHash !== 'string' || !TX_HASH_REGEX.test(txHash)) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'txHash is not a valid value' });
    return;
  }

  const tokenRef = firestore
    .collection(FIRESTORE_ROUTES.TOKENS.ROOT)
    .doc(txHash);
  const snapshot = await tokenRef.get();

  const metadataExists = !!snapshot.data()?.metadata;
  if (metadataExists) {
    res.setHeader(
      'Cache-Control',
      `public, no-transform, s-maxage=60, max-age=60`,
    );
    res.status(200).json(snapshot.data()?.metadata);
  }

  try {
    const metadata = await getTokenMetadataByOptimistic(firestore, txHash, [
      replaceImageWithPrivateGatewayFile,
      replaceSvgWithPreviewUrl,
      addThumbnailsFromFirebaseAdmin,
      addAlgoliaAttributes,
    ]);

    const isNotEmptyMetadata =
      !!metadata.tokenId ||
      !!metadata.titleAndDescriptionContentHash ||
      !!metadata.verdictMetadataContentHash;

    const metadataHash =
      '0x' +
      createHash('sha256').update(JSON.stringify(metadata)).digest('hex');
    const obj = {
      metadata,
      metadataHash,
    };
    if (!metadataExists) {
      res.setHeader(
        'Cache-Control',
        `public, no-transform, s-maxage=60, max-age=60`,
      );
      res.status(200).json(metadata);
    }
    if (isNotEmptyMetadata) {
      const shouldFetchMintingData =
        !snapshot.exists || (!snapshot.data()?.isMinted && !!metadata.tokenId);
      const mintingData = shouldFetchMintingData
        ? await getAdditionalMintingMetadataForTokenForAlgolia(metadata.tokenId)
        : {};
      if (snapshot.exists) {
        const prevMetadataHash = snapshot.data()?.metadataHash;
        if (shouldFetchMintingData || metadataHash !== prevMetadataHash) {
          await tokenRef.update({ ...obj, ...mintingData });
        } else {
        }
      } else {
        await tokenRef.set({ ...obj, ...mintingData });
      }
    }
  } catch (e: any) {
    console.log(txHash);
    console.log('e', e);
    if (!snapshot.exists) {
      res.status(200).json({});
    }
    return;
  }
};

export default handle;
