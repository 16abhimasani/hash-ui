import { NextApiRequest, NextApiResponse } from 'next';
import { AsyncPostTweet } from '../../../bots/twitter';
import { lowerCaseCheck } from '../../../utils/string';

const OS_COLLECTIONS = {
  HASH: `0xe18a32192ed95b0fe9d70d19e5025f103475d7ba`,
  LONDON_GIFT: `0x7645eec8bb51862a5aa855c40971b2877dae81af`,
  LONDON_EMBERS: `0x971fe57134d1b1b3d8d62ccadff1d2cf67e2b8ce`,
  PUBLIC_PIANO: `0x33c4bfd0f69fa19756ab78fa3c2dd1331c5d1acc`,
};

const handleOpenSeaNotify = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const body = req.body;
  console.log(body, 'request body from opensea');

  const embed = body?.embeds[0!];
  console.log(embed, 'embed');

  if (!body || !embed) {
    console.error('no body or embed');
    res.status(200).json({
      statusCode: 200,
    });
    return;
  }

  const openseaLink = embed?.author?.url;
  const description = embed?.description;
  console.log(openseaLink, 'openseaLink');
  console.log(description, 'description');

  const projectName = ((link: string) => {
    switch (true) {
      case lowerCaseCheck(link, OS_COLLECTIONS.PUBLIC_PIANO):
        return 'PUBLIC PIANO';
      case lowerCaseCheck(link, OS_COLLECTIONS.LONDON_GIFT):
        return 'LONDON GIFT';
      case lowerCaseCheck(link, OS_COLLECTIONS.LONDON_EMBERS):
        return 'LONDON EMBERS';
      case lowerCaseCheck(link, OS_COLLECTIONS.HASH):
        return 'HASH';
      default:
        return 'error';
    }
  })(openseaLink);
  console.log(projectName, 'projectName');
  if (lowerCaseCheck(projectName, 'error')) {
    console.error('projectName check failed');
    res.status(200).json({
      statusCode: 200,
    });
    return;
  }

  const assetName = ((description: string) => {
    const namePrefixLength = 11;
    const namePrefixLengthWithVerdict = 15;
    const partBeforeUrl = description?.split('(')[0!];
    const removeLastBracket = partBeforeUrl?.substring(
      0,
      partBeforeUrl?.length - 1,
    );
    const doesIncludeVerdictEmoji =
      removeLastBracket?.includes('✅') || removeLastBracket?.includes('🚫');
    const cleanName = doesIncludeVerdictEmoji
      ? removeLastBracket?.substring(namePrefixLengthWithVerdict)
      : removeLastBracket?.substring(namePrefixLength);
    return cleanName;
  })(description);
  console.log(assetName, 'assetName');

  const priceData = embed?.fields[0!];
  console.log(priceData, 'priceData');
  const tokenPrice = priceData?.value?.split(' ')[0!] || 0;
  const tokenSymbol = priceData?.value?.split(' ')[1!] || 'ETH';

  const appId = ((project: string) => {
    switch (true) {
      case lowerCaseCheck(project, 'piano'):
        return 'PIANO_SALES';
      case lowerCaseCheck(project, 'london'):
        return 'LONDON_SALES';
      default:
        return 'HASH_SALES';
    }
  })(projectName);
  console.log(appId, 'appId');

  const addDaoHandles = ((project: string) => {
    switch (true) {
      case lowerCaseCheck(project, 'piano'):
        return '';
      case lowerCaseCheck(project, 'london'):
        return ' + @LondonDAO';
      case lowerCaseCheck(project, 'hash'):
        return ' + @HistoriansDAO';
      default:
        return '';
    }
  })(projectName);

  const addTagLines = ((project: string) => {
    const defaultTags = `#generative #cryptoart #nft`;
    switch (true) {
      case lowerCaseCheck(project, 'piano'):
        return `#PublicPiano #cryptoart #nft`;
      case lowerCaseCheck(project, 'gift'):
        return `#LondonGift ${defaultTags}`;
      case lowerCaseCheck(project, 'ember'):
        return `#LondonEmbers ${defaultTags}`;
      case lowerCaseCheck(project, 'hash'):
        return `#HASH ${defaultTags}`;
      default:
        return `#nft`;
    }
  })(projectName);

  const tweetBody =
    // `* NEW ${projectName} SALE *\n` +
    `** NEW SALE **\n` +
    `${assetName} - sold for ${tokenPrice} $${tokenSymbol}\n` +
    `< via @prrfbeauty${addDaoHandles} >\n` +
    `---\n` +
    `${addTagLines}\n` +
    `${openseaLink}`;

  try {
    await AsyncPostTweet(tweetBody, appId);
    console.log('success');
  } catch (error) {
    console.error(error, 'error');
  }

  res.status(200).json({
    statusCode: 200,
  });
};

export default handleOpenSeaNotify;
