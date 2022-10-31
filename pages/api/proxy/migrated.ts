import { deployments, HashRegistryV2__factory } from '@hash/protocol';
import { NextApiRequest, NextApiResponse } from 'next';
import { PROVIDER } from '../../../clients/provider';
import { CHAIN_ID } from '../../../constants';

const registry = HashRegistryV2__factory.connect(
  deployments[CHAIN_ID].registry.hash,
  PROVIDER,
);

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (typeof id !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'blockNum is not a valid value' });
    return;
  }

  const isMigrated = await registry.isMigrated(id);

  if (isMigrated) {
    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
    );
  }

  res.status(200).json({
    statusCode: 200,
    id,
    isMigrated,
  });
};

export default handle;
