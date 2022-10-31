import { getSeasonFromTokenId } from '@hash/seasons';
import { NextApiRequest, NextApiResponse } from 'next';
import { getBaseMetadata } from '../../../coordinator/season/server';
import { hashRegistryCached } from '../../../utils/hash-registry';

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tokenId } = req.query;

  if (typeof tokenId !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'hash is not a valid value' });
    return;
  }

  const season = getSeasonFromTokenId(tokenId);

  if (!season) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'invalid season for tokenId' });
    return;
  }

  const hash = await hashRegistryCached.tokenIdToTxHash(tokenId);

  try {
    const metadata = await getBaseMetadata(hash, season);

    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
    );
    res.status(200).json(JSON.parse(metadata.text));
  } catch (e: any) {
    res.status(500).json({ statusCode: 500, message: e.message });
    return;
  }
};

export default handle;
