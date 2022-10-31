import { NextApiRequest, NextApiResponse } from 'next';
import { hashRegistryCached } from '../../../utils/hash-registry';

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { hash } = req.query;

  if (typeof hash !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'hash is not a valid value' });
    return;
  }

  const tokenId = await hashRegistryCached.txHashToTokenId(hash);

  if (!!tokenId) {
    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
    );
  }
  res.status(200).json({
    statusCode: 200,
    tokenId,
    hash,
  });
};

export default handle;
