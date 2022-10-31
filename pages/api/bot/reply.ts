import { NextApiRequest, NextApiResponse } from 'next';
import { TwitterReplyBot } from '../../../bots/twitter/reply';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      const { authorization } = req.headers;
      if (authorization === `Bearer ${process.env.ETHERSCAN_API_KEY}`) {
        const output = await TwitterReplyBot();
        res.status(200).json({ success: true, output });
      } else {
        res.status(401).json({ success: false });
      }
    } catch (err) {
      res.status(500).json({ statusCode: 500, err });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
