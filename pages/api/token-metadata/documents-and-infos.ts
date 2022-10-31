import { NextApiRequest, NextApiResponse } from 'next';
import { getDocumentsAndInfosByCoordinator } from '../../../coordinator';

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tokenId } = req.query;

  if (typeof tokenId !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'tokenId is not a valid value' });
    return;
  }
  const [documents, infos] = await getDocumentsAndInfosByCoordinator(tokenId);

  res.setHeader(
    'Cache-Control',
    `public, no-transform, s-maxage=60, max-age=60`,
  );
  res.status(200).json({
    statusCode: 200,
    documents,
    infos,
  });
};

export default handle;
