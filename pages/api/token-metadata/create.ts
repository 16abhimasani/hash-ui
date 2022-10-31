import { NextApiRequest, NextApiResponse } from 'next';
import { Blob, NFTStorage } from 'nft.storage';
import { NFT_STORAGE_API_KEY } from '../../../constants';

const client = new NFTStorage({ token: NFT_STORAGE_API_KEY ?? '' });

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(400).json({ statusCode: 400, message: 'Bad Request' });
    return;
  }

  const { title, description, descriptionHtml } = req.body;

  if (typeof title !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'title is not a valid value' });
    return;
  }

  if (typeof description !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'description is not a valid value' });
    return;
  }

  if (typeof descriptionHtml !== 'string') {
    res.status(422).json({
      statusCode: 422,
      message: 'descriptionHtml is not a valid value',
    });
    return;
  }

  try {
    const metadataObj = { title, description, descriptionHtml };

    const metadataBlob = new Blob([JSON.stringify(metadataObj)]);

    const cid = await client.storeBlob(metadataBlob);
    res.status(200).json({ cid });
  } catch (e) {
    res.status(500).json({ statusCode: 500, message: 'Something went wrong' });
  }
};

export default handle;
