import { NextApiRequest, NextApiResponse } from 'next';
import { PROVIDER } from '../../../clients/provider';

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name } = req.query;

  if (typeof name !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'name is not a valid value' });
    return;
  }

  console.log('name', name);
  const address = await PROVIDER.resolveName(name);

  console.log('address', address);

  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
  );
  res.status(200).json({
    statusCode: 200,
    address,
    name,
  });
};

export default handle;
