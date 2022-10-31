import { NextApiRequest, NextApiResponse } from 'next';
import { getTokenMetadataByCoordinator } from '../../../coordinator';

const handleTokenURI = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (typeof id !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'id is not a valid value' });
    return;
  }

  try {
    const metadata = await getTokenMetadataByCoordinator(id);
    res.setHeader(
      'Cache-Control',
      `public, no-transform, s-maxage=60, max-age=60`,
    );
    res.status(200).json(metadata);
  } catch (e: any) {
    res.status(500).json({ statusCode: 500, message: e.message });
    return;
  }
};

export default handleTokenURI;
