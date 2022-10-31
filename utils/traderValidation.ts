import { deployments } from '@hash/protocol';
import { BigNumber } from 'ethers';
import {
  CHAIN_ID,
  HUNDRED_PERCENT_BPS,
  MARKET_FEE_AMOUNT_BPS,
  TRADABLE_ASSETS,
} from '../constants';
import { SignedERC721OrderStruct, TradeDirection } from '../types/trader';
import { getTotalErc20AmountInOrder } from './trader';

// TODO check valid expiry time
export const validateTraderBidOrder = (order: any) => {
  const isMakerTradableAsset = Object.values(TRADABLE_ASSETS).includes(
    order.erc20Token,
  );
  const isTakerTradableAsset =
    order.erc721Token === deployments[CHAIN_ID].nft.v2;

  const isTakerFeeAcceptable =
    !!order.fees[0] &&
    order.fees[0] === deployments[CHAIN_ID].pob.multisig &&
    validateFeeAmount(
      BigNumber.from(order.erc20TokenAmount),
      BigNumber.from(order.fees[0].amount),
    );
  const isValidTradeDirection = order.direction === TradeDirection.BuyNFT;
  return (
    isValidTradeDirection &&
    isMakerTradableAsset &&
    isTakerTradableAsset &&
    isTakerFeeAcceptable
  );
};

export const validateTraderSaleOrder = (order: any) => {
  const isTakerTradableAsset = Object.values(TRADABLE_ASSETS).includes(
    order.erc20Token,
  );
  const isMakerTradableAsset =
    order.erc721Token === deployments[CHAIN_ID].nft.v2;
  const isValidTradeDirection = order.direction === TradeDirection.SellNFT;

  const isMakerFeeAcceptable =
    !!order.fees[0] &&
    order.fees[0] === deployments[CHAIN_ID].pob.multisig &&
    validateFeeAmount(
      BigNumber.from(order.erc20TokenAmount),
      BigNumber.from(order.fees[0].amount),
    );
  // const isValidSignature = traderClient.verifyOrderSignature(
  //   order,
  //   order.signature,
  //   CHAIN_ID,
  //   traderClient.exchangeContractAddress,
  // );
  return (
    // isValidSignature &&
    isValidTradeDirection &&
    isMakerTradableAsset &&
    isTakerTradableAsset &&
    isMakerFeeAcceptable
  );
};

// since fees are a cut of the total bid amount, amount + feeAmount = bidAmount
export const validateFeeAmount = (amount: BigNumber, feeAmount: BigNumber) => {
  return feeAmount
    .mul(HUNDRED_PERCENT_BPS)
    .div(feeAmount.add(amount).mul(HUNDRED_PERCENT_BPS))
    .gte(MARKET_FEE_AMOUNT_BPS);
};

export const isNewBidOrderBetter = (
  order: SignedERC721OrderStruct,
  newOrder: SignedERC721OrderStruct,
) => {
  const orderBidAmount = getTotalErc20AmountInOrder(order);
  const newOrderBidAmount = getTotalErc20AmountInOrder(newOrder);
  return newOrderBidAmount.gte(orderBidAmount);
};

export const isNewSaleOrderBetter = (
  order: SignedERC721OrderStruct,
  newOrder: SignedERC721OrderStruct,
) => {
  const orderBidAmount = getTotalErc20AmountInOrder(order);
  const newOrderBidAmount = getTotalErc20AmountInOrder(newOrder);
  return newOrderBidAmount.lte(orderBidAmount);
};
