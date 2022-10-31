import { deployments } from '@hash/protocol';
import { BigNumber } from 'ethers';
import {
  CHAIN_ID,
  HUNDRED_PERCENT_BPS,
  MARKET_FEE_AMOUNT_BPS,
  ZERO,
} from '../constants';
import {
  ERC721OrderStruct,
  OrderStatus,
  TradeDirection,
} from '../types/trader';

export const getTraderFeeAmount = (amount: BigNumber) =>
  amount.mul(MARKET_FEE_AMOUNT_BPS).div(HUNDRED_PERCENT_BPS);

export const getTraderFeeStruct = (amount: BigNumber) => {
  return {
    recipient: deployments[CHAIN_ID].pob.multisig,
    amount: getTraderFeeAmount(amount),
    feeData: '0x',
  };
};

export const FILLABLE_BUY_ORDER_STATUS = [
  OrderStatus.Fillable,
  OrderStatus.Unfillable,
];

export const FILLABLE_SELL_ORDER_STATUS = [OrderStatus.Fillable];

export const isOrderStatusPotentiallyChanging = (
  direction: TradeDirection,
  orderStatus: OrderStatus,
) =>
  (direction === TradeDirection.SellNFT
    ? FILLABLE_SELL_ORDER_STATUS
    : FILLABLE_BUY_ORDER_STATUS
  ).includes(orderStatus);

export const getTotalErc20AmountInOrder = (order: ERC721OrderStruct) =>
  BigNumber.from(order.erc20TokenAmount).add(
    order.fees.reduce((a, c) => a.add(c.amount), ZERO),
  );
