import { BigNumber } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { OPENSEA_API_KEY } from '../../../constants';

const OPENSEA_URL = (
  address: string,
  id: string,
  forceUpdate: boolean = false,
) =>
  `https://api.opensea.io/api/v1/asset/${address}/${id}?force_update=${forceUpdate}`;

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { address, id } = req.query;

  if (typeof id !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'id is not a valid value' });
    return;
  }

  if (typeof address !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'address is not a valid value' });
    return;
  }

  const idBN = BigNumber.from(id);
  const headers = new Headers({
    'X-API-KEY': OPENSEA_API_KEY || '',
  });

  const osRes = await fetch(OPENSEA_URL(address, idBN.toString(), true), {
    headers,
  });

  if (osRes.ok) {
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
