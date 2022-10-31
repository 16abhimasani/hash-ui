import { NextApiRequest, NextApiResponse } from 'next';
import { PROVIDER } from '../../../clients/provider';

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { address } = req.query;

  if (typeof address !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'address is not a valid value' });
    return;
  }

  const ensName = await PROVIDER.lookupAddress(address);

  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
  );
  res.status(200).json({
    statusCode: 200,
    name: ensName,
    address,
  });
};

export default handle;
