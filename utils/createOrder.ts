import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { deployments, HashBaseV2__factory } from '@hash/protocol';
import { BigNumber, utils } from 'ethers';
import { FieldValue } from 'firebase-admin/firestore';
import { Blob, NFTStorage } from 'nft.storage';
import { admin } from '../clients/firebase-server';
import { PROVIDER } from '../clients/provider';
import { CHAIN_ID, NFT_STORAGE_API_KEY } from '../constants';
import { OrderStatus, SignedERC721OrderStruct } from '../types/trader';
import { hashRegistryCached } from './hash-registry';
import { updateBestOrderToDisplay } from './updateBestOrderToDisplay';

const registry = HashBaseV2__factory.connect(
  deployments[CHAIN_ID].registry.hash,
  PROVIDER,
);

const client = new NFTStorage({ token: NFT_STORAGE_API_KEY ?? '' });
const firestore = admin.firestore();

export const createOrderAndMaybeUpdateBestOrderToDisplay = async (
  signedOrder: SignedERC721OrderStruct,
) => {
  const metadataBlob = new Blob([JSON.stringify(signedOrder)]);

  const tokenId = BigNumber.from(signedOrder.erc721TokenId).toHexString();

  const hash = await hashRegistryCached.tokenIdToTxHash(tokenId);

  const cid = await client.storeBlob(metadataBlob);

  const orderRef = await firestore
    .collection(FIRESTORE_ROUTES.SIGNED_ORDERS)
    .doc(BigNumber.from(signedOrder.nonce).toHexString());

  const fbOrder = {
    ...signedOrder,
    maker: utils.getAddress(signedOrder.maker),
    erc721Token: utils.getAddress(signedOrder.erc721Token),
    erc20Token: utils.getAddress(signedOrder.erc20Token),
    cid,
    isFilled: false,
    orderStatus: OrderStatus.Fillable,
    hash,
    erc20AssetAmountNum: parseFloat(
      utils.formatEther(signedOrder.erc20TokenAmount),
    ),
    createdAt: FieldValue.serverTimestamp(),
    lastActivityAt: FieldValue.serverTimestamp(),
    isCheckedInvalidOrderStatusIsFilled: false,
  };

  const batch = firestore.batch();
  batch.set(orderRef, fbOrder);
  await batch.commit();
  await updateBestOrderToDisplay(tokenId, hash);
  return fbOrder;
};
