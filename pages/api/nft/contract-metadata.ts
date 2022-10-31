import { NextApiRequest, NextApiResponse } from 'next';
import { OPENSEA_API_KEY } from '../../../constants';

const OPENSEA_URL = (address: string) =>
  ` https://api.opensea.io/api/v1/asset_contract/${address}`;

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { address } = req.query;

  if (typeof address !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'address is not a valid value' });
    return;
  }

  const headers = new Headers({
    'X-API-KEY': OPENSEA_API_KEY || '',
  });

  const osRes = await fetch(OPENSEA_URL(address), {
    headers,
  });

  if (osRes.ok) {
    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
    );
    res.status(200).json({
      metadata: await osRes.json(),
      statusCode: 200,
    });
    return;
  } else {
    res.status(200).json({
      statusCode: 200,
      message: 'os call failed.',
    });
  }
};

export default handle;
