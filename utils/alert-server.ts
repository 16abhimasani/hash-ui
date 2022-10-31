import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { deployments, HashRegistryV2__factory } from '@hash/protocol';
import { utils } from 'ethers';
import { FieldValue } from 'firebase-admin/firestore';
import { invert } from 'lodash';
import { admin } from '../clients/firebase-server';
import { PROVIDER } from '../clients/provider';
import { CHAIN_ID, HASH_PROD_LINK, TRADABLE_ASSETS } from '../constants';
import { ROUTES } from '../constants/routes';
import { AlertWithoutCreatedAt } from '../types/alert';
import { ERC721OrderStruct } from '../types/trader';
import { formatDecimalNumber, lowerCaseCheck } from './string';
import { getTotalErc20AmountInOrder } from './trader';

const firestore = admin.firestore();

const registry = HashRegistryV2__factory.connect(
  deployments[CHAIN_ID].registry.hash,
  PROVIDER,
);

export const createAlert = async (alert: AlertWithoutCreatedAt) => {
  await firestore
    .collection(FIRESTORE_ROUTES.ALERTS)
    .doc()
    .set({ ...alert, createdAt: FieldValue.serverTimestamp() });
};

export const createMadeOfferAlert = async (
  hash: string,
  order: ERC721OrderStruct,
) => {
  const makerSymbol = invert(TRADABLE_ASSETS)[order.erc20Token];
  const tokenId = order.erc721TokenId;
  const owner = await registry.ownerOf(tokenId);

  const alert: AlertWithoutCreatedAt = {
    action: 'made-offer',
    actor: order.maker,
    description: `placed offer for ${formatDecimalNumber(
      utils.formatEther(getTotalErc20AmountInOrder(order)),
    )} ${makerSymbol}`,
    link: `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${hash}`,
    isDismissed: false,
    for: owner,
    hash,
  };
  await createAlert(alert);
};

export const createListedSaleAlert = async (
  hash: string,
  order: ERC721OrderStruct,
) => {
  const takerSymbol = invert(TRADABLE_ASSETS)[order.erc20Token];
  const tokenId = order.erc721TokenId;
  const owner = await registry.ownerOf(tokenId);

  const alert: AlertWithoutCreatedAt = {
    action: 'list-sale',
    actor: order.maker,
    description: `listed for sale for ${formatDecimalNumber(
      utils.formatEther(getTotalErc20AmountInOrder(order)),
    )} ${takerSymbol}`,
    link: `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${hash}`,
    isDismissed: true,
    for: owner,
    hash,
  };
  await createAlert(alert);
};

export const createOfferAcceptedAlert = async (
  hash: string,
  filler: string,
  order: ERC721OrderStruct,
) => {
  const makerSymbol = invert(TRADABLE_ASSETS)[order.erc20Token];
  const alert: AlertWithoutCreatedAt = {
    action: 'accepted-offer',
    actor: filler,
    description: `accepted offer for ${formatDecimalNumber(
      utils.formatEther(getTotalErc20AmountInOrder(order)),
    )} ${makerSymbol}`,
    link: `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${hash}`,
    isDismissed: false,
    for: order.maker,
    hash,
  };
  await createAlert(alert);
};

export const createUpdatedMetadataAlert = async (
  hash: string,
  writer: string,
  owner: string,
) => {
  const alert: AlertWithoutCreatedAt = {
    action: 'updated-metadata',
    actor: writer,
    description: `updated metadata`,
    link: `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${hash}`,
    isDismissed: lowerCaseCheck(writer, owner),
    for: owner,
    hash,
  };
  await createAlert(alert);
};

export const createSaleAcceptedAlert = async (
  hash: string,
  filler: string,
  order: ERC721OrderStruct,
) => {
  const makerSymbol = invert(TRADABLE_ASSETS)[order.erc20Token];
  const alert: AlertWithoutCreatedAt = {
    action: 'accepted-sale',
    actor: filler,
    description: `bought for ${formatDecimalNumber(
      utils.formatEther(getTotalErc20AmountInOrder(order)),
    )} ${makerSymbol}`,
    link: `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${hash}`,
    isDismissed: false,
    for: order.maker,
    hash,
  };
  await createAlert(alert);
};
