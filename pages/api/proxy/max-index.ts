import { deployments, HashV2__factory } from '@hash/protocol';
import { BigNumber } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { PROVIDER } from '../../../clients/provider';
import { CHAIN_ID } from '../../../constants';

const hashV2 = HashV2__factory.connect(deployments[CHAIN_ID].nft.v2, PROVIDER);

const handleMaxIndex = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tokenType, blockNum } = req.query;

  if (typeof tokenType !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'tokenType is not a valid value' });
    return;
  }

  if (typeof blockNum !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'blockNum is not a valid value' });
    return;
  }

  if (parseInt(blockNum) === NaN || parseInt(blockNum) < 0) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'blockNum is not a valid value' });
    return;
  }

  const maxIndex = await hashV2.tokenTypeToSupply(tokenType);

  res.status(200).json({
    statusCode: 200,
    maxIndexMap: {
      [tokenType]: BigNumber.from(maxIndex).toNumber(),
    },
  });
};

export default handleMaxIndex;
