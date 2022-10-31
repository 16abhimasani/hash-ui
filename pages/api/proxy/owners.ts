import {
  deployments,
  HashRegistryV2__factory,
  Multicall__factory,
} from '@hash/protocol';
import { utils } from 'ethers';
import { fromPairs } from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';
import { PROVIDER } from '../../../clients/provider';
import { CHAIN_ID, NULL_ADDRESS } from '../../../constants';

const registry = HashRegistryV2__factory.connect(
  deployments[CHAIN_ID].registry.hash,
  PROVIDER,
);
const multiCall = Multicall__factory.connect(
  deployments[CHAIN_ID].misc.multicall,
  PROVIDER,
);

const pruneUintToAddress = (uint: string) => {
  return utils.getAddress(`0x${uint.slice(-40)}`);
};

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tokenIds } = req.query;

  if (typeof tokenIds !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'tokenId is not a valid value' });
    return;
  }

  const tokenIdsArr = tokenIds.split(',');
  const calls = tokenIdsArr
    .map((id) => registry.interface.encodeFunctionData('ownerOf', [id]))
    .map((callData) => ({
      target: registry.address,
      callData,
    }));

  const callRes = await multiCall.callStatic.aggregate(calls);

  const ownerEntries = tokenIdsArr
    .map((id: string, i: number) => {
      return [id, pruneUintToAddress(callRes[1][i])];
    })
    .filter(([id, owner]) => owner != NULL_ADDRESS);

  if (ownerEntries.length == 0) {
    res.status(200).json({
      statusCode: 200,
      owners: {},
    });
    return;
  }

  res.setHeader(
    'Cache-Control',
    `public, no-transform, s-maxage=30, max-age=30`,
  );

  res.status(200).json({
    statusCode: 200,
    owners: fromPairs(ownerEntries),
  });
};

export default handle;
