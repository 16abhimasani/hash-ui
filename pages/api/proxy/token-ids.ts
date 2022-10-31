import {
  deployments,
  HashRegistryV2__factory,
  Multicall__factory,
} from '@hash/protocol';
import { BigNumber } from 'ethers';
import { fromPairs } from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';
import { PROVIDER } from '../../../clients/provider';
import { CHAIN_ID, ZERO } from '../../../constants';

const registry = HashRegistryV2__factory.connect(
  deployments[CHAIN_ID].registry.hash,
  PROVIDER,
);
const multiCall = Multicall__factory.connect(
  deployments[CHAIN_ID].misc.multicall,
  PROVIDER,
);

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { hashes } = req.query;

  if (typeof hashes !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'hash is not a valid value' });
    return;
  }
  const hashesArr = hashes.split(',');
  const calls = hashesArr
    .map((h) => registry.interface.encodeFunctionData('txHashToTokenId', [h]))
    .map((callData) => ({
      target: registry.address,
      callData,
    }));

  const callRes = await multiCall.callStatic.aggregate(calls);

  const tokenIdEntries = hashesArr
    .map((id: string, i: number) => {
      return [id, callRes[1][i]];
    })
    .filter(([h, tokenId]) => !BigNumber.from(tokenId).eq(ZERO));

  if (tokenIdEntries.length == 0) {
    res.status(200).json({
      statusCode: 200,
      tokenIds: {},
    });
    return;
  }

  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
  );
  res.status(200).json({
    statusCode: 200,
    tokenIds: fromPairs(tokenIdEntries),
  });
};

export default handle;
