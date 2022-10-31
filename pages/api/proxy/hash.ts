import { BigNumber } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { ZERO } from '../../../constants';
import { hashRegistryCached } from '../../../utils/hash-registry';

const handleHash = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tokenId } = req.query;

  if (typeof tokenId !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'tokenId is not a valid value' });
    return;
  }
  const hash = await hashRegistryCached.tokenIdToTxHash(tokenId);

  if (BigNumber.from(hash).eq(ZERO)) {
    res.status(200).json({
      statusCode: 200,
      hash: hash,
    });
    return;
  }

  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
  );
  res.status(200).json({
    statusCode: 200,
    hash: hash,
  });
};

export default handleHash;
