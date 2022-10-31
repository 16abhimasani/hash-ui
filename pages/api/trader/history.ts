import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { utils } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { AsyncPostTweet } from '../../../bots/twitter';
import { admin } from '../../../clients/firebase-server';
import { PROVIDER } from '../../../clients/provider';
import { traderClient } from '../../../clients/trader-server';
import {
  ADDRESS_TO_TRADABLE_ASSET_SYMBOL,
  FEE_TRADABLE_ASSETS,
  HASH_PROD_LINK,
  TRADABLE_ASSETS,
} from '../../../constants';
import { OrderStatus, TradeDirection } from '../../../types/trader';
import {
  createOfferAcceptedAlert,
  createSaleAcceptedAlert,
} from '../../../utils/alert-server';
import { hashRegistryCached } from '../../../utils/hash-registry';
import { shortenHexString } from '../../../utils/hex';
import { formatDecimalNumber } from '../../../utils/string';
import { updateBestOrderToDisplay } from '../../../utils/updateBestOrderToDisplay';

const firestore = admin.firestore();

const handleNotify = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;
  const activity = body?.activity;
  console.log('activity', activity);
  if (!activity || activity?.length < 1) {
    res.status(200).json({
      statusCode: 200,
    });
    return;
  }
  const tokenActivity = activity.filter(
    (a: any) =>
      (a.category === 'token' &&
        FEE_TRADABLE_ASSETS.map((b) => TRADABLE_ASSETS[b]).includes(
          a.rawContract.address,
        )) ||
      (a.fromAddress === traderClient.exchangeProxy.address &&
        a.category === 'internal'),
  );
  console.log('tokenActivity', tokenActivity);

  const hashes = tokenActivity.map((a: any) => a.hash);

  for (const hash of hashes) {
    const receipt = await PROVIDER.getTransactionReceipt(hash);
    const fills = receipt.logs.filter(
      (l) =>
        l.topics[0] ===
        '0x50273fa02273cceea9cf085b42de5c8af60624140168bd71357db833535877af',
    );

    const decodedNonceAndErc20AmountAndTakers = fills.map((h) => [
      traderClient.exchangeProxy.interface
        .decodeEventLog('ERC721OrderFilled', h.data)[3]
        .toHexString(),
      traderClient.exchangeProxy.interface.decodeEventLog(
        'ERC721OrderFilled',
        h.data,
      )[5],
      traderClient.exchangeProxy.interface.decodeEventLog(
        'ERC721OrderFilled',
        h.data,
      )[2],
    ]);

    console.log(
      'decodedNonceAndErc20AmountAndTakers',
      decodedNonceAndErc20AmountAndTakers,
    );

    for (let i = 0; i < decodedNonceAndErc20AmountAndTakers.length; ++i) {
      const ref = firestore
        .collection(FIRESTORE_ROUTES.SIGNED_ORDERS)
        .doc(decodedNonceAndErc20AmountAndTakers[i][0]);
      const orderSnapshot = await ref.get();
      if (!orderSnapshot.exists) {
        continue;
      }
      const order = orderSnapshot.data();
      const block = await PROVIDER.getBlock(receipt.blockNumber);

      await ref.update({
        isFilled: true,
        filledAtBlockNum: receipt.blockNumber,
        filledAt: new Date(block.timestamp * 1000),
        filledTxHash: hash,
        filledTakerAddress: decodedNonceAndErc20AmountAndTakers[i][2],
        orderStatus: OrderStatus.Unfillable,
        lastActivityAt: new Date(block.timestamp * 1000),
        isCheckedInvalidOrderStatusIsFilled: true,
      });

      if (!!order) {
        const tokenId = order.erc721TokenId;
        const hash = await hashRegistryCached.tokenIdToTxHash(tokenId);
        await updateBestOrderToDisplay(tokenId, hash);
        if (order.direction === TradeDirection.SellNFT) {
          await createSaleAcceptedAlert(
            hash,
            decodedNonceAndErc20AmountAndTakers[i][2],
            order as any,
          );
        }
        if (order.direction === TradeDirection.BuyNFT) {
          await createOfferAcceptedAlert(
            hash,
            decodedNonceAndErc20AmountAndTakers[i][2],
            order as any,
          );
        }
        const tokenMetadataSnapshot = await firestore
          .collection(FIRESTORE_ROUTES.TOKENS.ROOT)
          .doc(hash)
          .get();
        const tokenMetadata = tokenMetadataSnapshot.data();
        if (!!tokenMetadata) {
          try {
            const assetName =
              tokenMetadata.metadata.originalName ??
              tokenMetadata.metadata.name ??
              shortenHexString(hash, 6);
            const tokenPrice = formatDecimalNumber(
              utils.formatEther(order.erc20AssetAmount),
            );
            const tokenSymbol =
              ADDRESS_TO_TRADABLE_ASSET_SYMBOL[order.erc20Token];
            const tweetBody =
              // `* NEW ${projectName} SALE *\n` +
              `** NEW SALE **\n` +
              `${assetName} - sold for ${tokenPrice} $${tokenSymbol}\n` +
              `< via 0xv4 protocol + @prrfbeauty + @HistoriansDAO >\n` +
              `---\n` +
              `${'#HASH #generative #cryptoart #nft'}\n` +
              `${HASH_PROD_LINK}/art/${hash}`;
            await AsyncPostTweet(tweetBody, 'HASH_SALES');
            console.log('success');
          } catch (error) {
            console.error(error, 'error');
          }
        }
      }
    }
  }
  res.status(200).json({
    statusCode: 200,
  });
};

export default handleNotify;
