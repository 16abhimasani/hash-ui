import { NextApiRequest, NextApiResponse } from 'next';
import { PROVIDER } from '../../../clients/provider';

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { blockNums: blockNumsStr } = req.query;

  if (typeof blockNumsStr !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'blockNums is not a valid value' });
    return;
  }

  if (blockNumsStr.length === 0) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'blockNums is not a valid value' });
    return;
  }

  const blockNums = blockNumsStr.split(',');

  const blockNumObj: { [n: number]: number } = {};

  for (const blockNum of blockNums) {
    if (isNaN(parseInt(blockNum))) {
      continue;
    }
    blockNumObj[parseInt(blockNum)] = (
      await PROVIDER.getBlock(parseInt(blockNum))
    ).timestamp;
  }

  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
  );
  res.status(200).json({
    statusCode: 200,
    blockNumToTimeStamp: blockNumObj,
  });
};

export default handle;
