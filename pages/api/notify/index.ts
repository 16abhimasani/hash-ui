import {
  deployments,
  ERC1155Mintable__factory,
  HashRegistryV2__factory,
} from '@hash/protocol';
import { NextApiRequest, NextApiResponse } from 'next';
import { PROVIDER } from '../../../clients/provider';
import { CHAIN_ID } from '../../../constants';

const erc1155 = ERC1155Mintable__factory.connect(
  deployments[CHAIN_ID].nft.erc1155,
  PROVIDER,
);
const hashRegistry = HashRegistryV2__factory.connect(
  deployments[CHAIN_ID].registry.hash,
  PROVIDER,
);

const handleNotify = async (req: NextApiRequest, res: NextApiResponse) => {
  // const body = req.body;
  // const activity = body?.activity;
  // if (!activity || activity?.length < 1) {
  //   res.status(200).json({
  //     statusCode: 200,
  //   });
  //   return;
  // }
  // const externalActivity = activity.filter(
  //   (a: any) => a.category === 'external',
  // );
  // const hashes = externalActivity.map((a: any) => a.hash);
  // for (const hash of hashes) {
  //   const receipt = await PROVIDER.getTransactionReceipt(hash);
  //   const transfers = receipt.logs.filter(
  //     (l) =>
  //       l.topics[0] ===
  //       '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
  //   );
  //   const updates = receipt.logs.filter(
  //     (l) =>
  //       l.topics[0] ===
  //       '0x6d02ad638ef1efb9d08c39bbfc9fc87a23a53baa61ddba88623bf654504128ca',
  //   );
  //   const decodedUpdates = updates.map((u) =>
  //     hashRegistry.interface.decodeEventLog('UpdatedRegistry', u.data),
  //   );
  //   const minters = transfers
  //     .map((t) => t.topics[3])
  //     .map((m) => '0x' + m.slice(-40));
  //   const tokenIds = transfers.map(
  //     (t) => erc1155.interface.decodeEventLog('TransferSingle', t.data)[3],
  //   );
  //   const txHashes = tokenIds.map(
  //     (t) =>
  //       decodedUpdates.find((u) => u[0].toHexString() === t.toHexString())?.[1],
  //   );

  //   for (let i = 0; i < txHashes.length; ++i) {
  //     const hash = txHashes[i].toHexString();
  //     const { bestName: accountName } = await getUserMetadata(minters[i]);
  //     const message = new MessageEmbed()
  //       .setColor('#d5dbb3')
  //       .setTitle(`New mint: ${accountName}`)
  //       .setURL(`${'https://hash.pob.studio'}/art/${hash}`)
  //       .setAuthor(accountName)
  //       .addField('Tx hash', hash)
  //       .addField(
  //         'Season',
  //         getSeasonFromTokenId(tokenIds[i].toHexString())?.toUpperCase(),
  //         true,
  //       )
  //       .setTimestamp()
  //       .setThumbnail(getArtworkPreviewUrl(hash));

  //     PostTweet(
  //       `** NEW MINT **\n` +
  //         `${shortenHexString(hash)} - minted by ${accountName}\n` +
  //         `< via @prrfbeauty + @HistoriansDAO >\n` +
  //         `---\n` +
  //         `#HASH #generative #cryptoart #nft\n` +
  //         `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${hash}`,
  //       'HASH_MINTS',
  //     );
  //     await mintingClient.send(message);
  //   }
  // }
  res.status(200).json({
    statusCode: 200,
  });
};

export default handleNotify;
