import { BigNumber } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { ALCHEMY_KEY, OPENSEA_API_KEY } from '../../../constants';

const TOKEN_METADATA_URL = (
  address: string,
  id: string,
  forceUpdate: boolean = false,
) =>
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}/getNFTMetadata?contractAddress=${address}&tokenId=${id}`;

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

  const tmRes = await fetch(TOKEN_METADATA_URL(address, idBN.toString()), {
    headers,
  });

  if (tmRes.ok) {
    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=86400, max-age=86400`,
    );
    const data = await tmRes.json();
    res.status(200).json({
      metadata: {
        name: data?.title,
        description: data?.description,
        image_url: data?.media?.[0]?.gateway,
      },
      statusCode: 200,
    });
    return;
  } else {
    res.status(200).json({
      statusCode: 200,
      message: 'os call failed.',
    });
    return;
  }
};

export default handle;
