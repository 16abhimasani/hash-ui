import {
  getTxDataFromProvider,
  Season,
  SEASON_TO_ART_FACTORY,
  SEASON_TO_NUM,
} from '@hash/seasons';
import { NextApiRequest, NextApiResponse } from 'next';
import { MAINNET_PROVIDER } from '../../../clients/provider';
import { TX_HASH_REGEX } from '../../../utils/regex';

const handlePrerender = async (req: NextApiRequest, res: NextApiResponse) => {
  const { hash, season } = req.query;
  // type and format checks
  if (typeof hash !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'txHash is not a valid value' });
    return;
  }
  if (!TX_HASH_REGEX.test(hash as string)) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'txHash is not a valid value' });
    return;
  }
  if (
    !season ||
    typeof season !== 'string' ||
    (SEASON_TO_NUM as any)[season] === undefined
  ) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'season is not a valid value' });
    return;
  }

  try {
    const txData = await getTxDataFromProvider(MAINNET_PROVIDER, hash);
    const artFactory = SEASON_TO_ART_FACTORY[season as Season];

    const gene = await artFactory.generateGeneFromTxData(txData);

    const payload = {
      season,
      statusCode: 200,
      gene,
      data: artFactory.prerender(gene),
    };
    res.setHeader(
      'Cache-Control',
      `public, no-transform, s-maxage=3600, max-age=3600`,
    );
    res.status(200).json(payload);
  } catch (err: any) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    const errResponse = { statusCode, message: err.message };
    res.status(statusCode).json(errResponse);
  }
};

export default handlePrerender;
