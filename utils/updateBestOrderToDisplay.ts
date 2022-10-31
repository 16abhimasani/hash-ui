import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { deployments, HashBaseV2__factory } from '@hash/protocol';
import { BigNumber, utils } from 'ethers';
import { FieldValue } from 'firebase-admin/firestore';
import { NFTStorage } from 'nft.storage';
import { admin } from '../clients/firebase-server';
import { PROVIDER } from '../clients/provider';
import { CHAIN_ID, NFT_STORAGE_API_KEY } from '../constants';
import { OrderStatus, TradeDirection } from '../types/trader';

const registry = HashBaseV2__factory.connect(
  deployments[CHAIN_ID].registry.hash,
  PROVIDER,
);

const client = new NFTStorage({ token: NFT_STORAGE_API_KEY ?? '' });
const firestore = admin.firestore();

export const updateBestOrderToDisplay = async (
  tokenId: string,
  hash: string,
) => {
  const owner = utils.getAddress(await registry.ownerOf(tokenId));
  const filledOrderSnapshot = await firestore
    .collection(FIRESTORE_ROUTES.SIGNED_ORDERS)
    .orderBy('filledAtBlockNum', 'desc')
    .where('hash', '==', hash)
    .where('orderStatus', '==', OrderStatus.Unfillable)
    .where('isFilled', '==', true)
    .where('filledAtBlockNum', '>=', 0)
    .limit(1)
    .get();
  const offersSnapshot = await firestore
    .collection(FIRESTORE_ROUTES.SIGNED_ORDERS)
    .where('hash', '==', hash)
    .where('direction', '==', TradeDirection.BuyNFT)
    .where('orderStatus', '==', OrderStatus.Fillable)
    .orderBy('maker', 'desc')
    .where('maker', '!=', owner)
    .orderBy('erc20AssetAmountNum', 'desc')
    .limit(1)
    .get();
  const listsSnapshot = await firestore
    .collection(FIRESTORE_ROUTES.SIGNED_ORDERS)
    .orderBy('erc20AssetAmountNum', 'asc')
    .where('hash', '==', hash)
    .where('direction', '==', TradeDirection.SellNFT)
    .where('orderStatus', '==', OrderStatus.Fillable)
    .where('maker', '==', owner)
    .limit(1)
    .get();

  const filledOrder = filledOrderSnapshot.docs?.[0]?.data();
  const list = listsSnapshot.docs?.[0]?.data();
  const offer = offersSnapshot.docs?.[0]?.data();

  const updateObj: any = {};

  if (!list && !offer) {
    if (!!filledOrder) {
      updateObj['bestOrderToDisplay'] = filledOrder;
    }
  } else if (!offer) {
    updateObj['bestOrderToDisplay'] = list;
  } else if (!list) {
    updateObj['bestOrderToDisplay'] = offer;
  } else if (BigNumber.from(offer.erc20TokenAmount).gt(list.erc20TokenAmount)) {
    updateObj['bestOrderToDisplay'] = offer;
  } else {
    updateObj['bestOrderToDisplay'] = list;
  }
  if (!updateObj['bestOrderToDisplay']) {
    updateObj['bestOrderToDisplay'] = FieldValue.delete();
  }
  if (!!filledOrder) {
    updateObj['bestFilledOrderToDisplay'] = filledOrder;
  }
  if (Object.keys(updateObj).length === 0) {
  }
  await firestore
    .collection(FIRESTORE_ROUTES.TOKENS.ROOT)
    .doc(hash)
    .update(updateObj);
};
