import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { admin } from '../../../clients/firebase-server';
import { getTagsForHash } from '../../../tag-generator';
import { hashRegistryCached } from '../../../utils/hash-registry';

const TAGS_CACHE_INTERVAL = () => new Date().getTime() + 24 * 60 * 60 * 1000;

const isTagCacheExpired = (date: number) => {
  return TAGS_CACHE_INTERVAL() < date;
};

const firestore = admin.firestore();

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { hash } = req.query;

  if (typeof hash !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'id is not a valid value' });
    return;
  }

  const tokenId = await hashRegistryCached.txHashToTokenId(hash);

  const tokenRef = firestore.collection(FIRESTORE_ROUTES.TOKENS.ROOT).doc(hash);

  const snapshot = await tokenRef.get();

  const shouldSendCache =
    snapshot.exists &&
    !!tokenId &&
    !!snapshot.data()?.tags &&
    !!snapshot.data()?.tagCacheExpiry &&
    !isTagCacheExpired(snapshot.data()?.tagCacheExpiry);

  try {
    if (shouldSendCache) {
      res.setHeader(
        'Cache-Control',
        `public, immutable, no-transform, s-maxage=360, max-age=360`,
      );
      res.status(200).json({ tags: snapshot.data()?.tags });
    }

    const [tags, tagsByType] = await getTagsForHash(hash, tokenId);

    if (snapshot.exists) {
      await tokenRef.update({
        tags,
        tagsByType,
        tagCacheExpiry: TAGS_CACHE_INTERVAL(),
      });
    }

    if (!shouldSendCache) {
      res.setHeader(
        'Cache-Control',
        `public, immutable, no-transform, s-maxage=360, max-age=360`,
      );
      res.status(200).json({ tags });
      return;
    }
  } catch (e: any) {
    console.log('e', e);
    if (!shouldSendCache) {
      res.status(500).json({ statusCode: 500, message: e.message });
    }
    return;
  }
};

export default handle;
