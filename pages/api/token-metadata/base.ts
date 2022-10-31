import { NextApiRequest, NextApiResponse } from 'next';
import { getBaseMetadata } from '../../../coordinator/season/server';
import { TX_HASH_REGEX } from '../../../utils/regex';

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { hash, season } = req.query;

  if (typeof hash !== 'string' || !TX_HASH_REGEX.test(hash)) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'hash is not a valid value' });
    return;
  }

  if (typeof season !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'season is not a valid value' });
    return;
  }

  try {
    const metadata = await getBaseMetadata(hash, season as any);

    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
    );
    res.status(200).json(metadata);
  } catch (e: any) {
    res.status(500).json({ statusCode: 500, message: e.message });
    return;
  }
};

export default handle;
