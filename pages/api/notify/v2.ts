import {
  deployments,
  HashRegistryV2__factory,
  HashV2__factory,
} from '@hash/protocol';
import { getSeasonFromTokenId } from '@hash/seasons';
import { MessageEmbed } from 'discord.js';
import { NextApiRequest, NextApiResponse } from 'next';
import { PostTweet } from '../../../bots/twitter';
import { mintingClient } from '../../../clients/discord';
import { PROVIDER } from '../../../clients/provider';
import { CHAIN_ID, HASH_PROD_LINK } from '../../../constants';
import { ROUTES } from '../../../constants/routes';
import { padHexString, shortenHexString } from '../../../utils/hex';
import { getArtworkPreviewUrl } from '../../../utils/urls';
import { getUserMetadata } from '../../../utils/user-server';

const hashV2 = HashV2__factory.connect(deployments[CHAIN_ID].nft.v2, PROVIDER);
const hashRegistry = HashRegistryV2__factory.connect(
  deployments[CHAIN_ID].registry.hash,
  PROVIDER,
);

const handleNotify = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;
  const activity = body?.activity;
  if (!activity || activity?.length < 1) {
    res.status(200).json({
      statusCode: 200,
    });
    return;
  }
  console.log(activity);
  const filteredActivity = activity.filter(
    (a: any) => a.category === 'internal',
  );
  const hashes = filteredActivity.map((a: any) => a.hash);
  for (const hash of hashes) {
    const receipt = await PROVIDER.getTransactionReceipt(hash);
    const transfers = receipt.logs.filter(
      (l) =>
        l.topics[0] ===
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    );
    const updates = receipt.logs.filter(
      (l) =>
        l.topics[0] ===
        '0x6d02ad638ef1efb9d08c39bbfc9fc87a23a53baa61ddba88623bf654504128ca',
    );
    const decodedUpdates = updates.map((u) =>
      hashRegistry.interface.decodeEventLog('UpdatedRegistry', u.data),
    );
    const minters = transfers
      .map((t) => t.topics[2])
      .map((m) => '0x' + m.slice(-40));
    const tokenIds = transfers.map((t) => t.topics[3]);
    console.log(minters, tokenIds);
    const txHashes = tokenIds.map(
      (t) => decodedUpdates.find((u) => u[0].toHexString() === t)?.[1],
    );
    console.log(txHashes);
    for (let i = 0; i < txHashes.length; ++i) {
      const hash = padHexString(txHashes[i].toHexString());
      const { bestName: accountName } = await getUserMetadata(minters[i]);
      const message = new MessageEmbed()
        .setColor('#d5dbb3')
        .setTitle(`New mint: ${accountName}`)
        .setURL(`${'https://hash.pob.studio'}/art/${hash}`)
        .setAuthor(accountName)
        .addField('Tx hash', hash)
        .addField(
          'Season',
          getSeasonFromTokenId(tokenIds[i])?.toUpperCase(),
          true,
        )
        .setTimestamp()
        .setThumbnail(getArtworkPreviewUrl(hash));

      PostTweet(
        `** NEW MINT **\n` +
          `${shortenHexString(hash)} - minted by ${accountName}\n` +
          `< via @prrfbeauty + @HistoriansDAO >\n` +
          `---\n` +
          `#HASH #generative #cryptoart #nft\n` +
          `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${hash}`,
        'HASH_MINTS',
      );
      await mintingClient.send(message);
    }
  }
  res.status(200).json({
    statusCode: 200,
  });
};

export default handleNotify;
