import { utils } from 'ethers';
import { invert } from 'lodash';
import { useMemo } from 'react';
import { TRADABLE_ASSETS } from '../constants';
import {
  useBestOrderToDisplayByContext,
  useTokenIdByContext,
} from '../contexts/token';
import { OrderStatus, TradeDirection } from '../types/trader';
import { formatDecimalNumber } from '../utils/string';
import { getTotalErc20AmountInOrder } from '../utils/trader';
import { useMintPrice } from './useMintPrice';
import { useLastPriceFromOS } from './useOpenSea';

export const useBestPriceStatisticByContext = () => {
  const tokenId = useTokenIdByContext();
  const openseaLastPrice = useLastPriceFromOS(tokenId ?? undefined);
  const bestOrder = useBestOrderToDisplayByContext();
  const mintPrice = useMintPrice(tokenId ?? undefined);

  const isMarketLive = useMemo(
    () => bestOrder?.orderStatus === OrderStatus.Fillable,
    [bestOrder],
  );

  const listingAssetSymbol = useMemo(() => {
    if (!!bestOrder && bestOrder.direction === TradeDirection.SellNFT) {
      const tokenSymbol = invert(TRADABLE_ASSETS)[bestOrder.erc20Token];
      return tokenSymbol === 'WETH' ? 'ETH' : tokenSymbol;
    }
    if (!!bestOrder && bestOrder.direction === TradeDirection.BuyNFT) {
      const tokenSymbol = invert(TRADABLE_ASSETS)[bestOrder.erc20Token];
      return tokenSymbol;
    }
    if (!!openseaLastPrice) {
      return openseaLastPrice.paymentAssetSymbol;
    }
    if (
      !!bestOrder &&
      bestOrder?.orderStatus === OrderStatus.Unfillable &&
      bestOrder?.isFilled
    ) {
      return invert(TRADABLE_ASSETS)[bestOrder.erc20Token];
    }
    if (!!mintPrice) {
      return 'ETH';
    }
    return null;
  }, [mintPrice, bestOrder, openseaLastPrice]);

  const listingValue = useMemo(() => {
    if (!!bestOrder && bestOrder.direction === TradeDirection.SellNFT) {
      const value = getTotalErc20AmountInOrder(bestOrder);
      return formatDecimalNumber(utils.formatEther(value));
    }
    if (!!bestOrder && bestOrder.direction === TradeDirection.BuyNFT) {
      const value = getTotalErc20AmountInOrder(bestOrder);
      return formatDecimalNumber(utils.formatEther(value));
    }
    if (!!openseaLastPrice) {
      return formatDecimalNumber(utils.formatEther(openseaLastPrice.price));
    }
    if (
      !!bestOrder &&
      bestOrder?.orderStatus === OrderStatus.Unfillable &&
      bestOrder?.isFilled
    ) {
      const value = getTotalErc20AmountInOrder(bestOrder);
      return formatDecimalNumber(utils.formatEther(value));
    }
    if (!!mintPrice) {
      return formatDecimalNumber(utils.formatEther(mintPrice));
    }
    return '-';
  }, [mintPrice, bestOrder, openseaLastPrice]);

  const priceText = useMemo(() => {
    if (listingValue !== '-') {
      return `${listingValue} ${listingAssetSymbol}`;
    }
    return `-`;
  }, [listingValue, listingAssetSymbol]);

  const priceLabel = useMemo(() => {
    if (isMarketLive) {
      return bestOrder?.direction === TradeDirection.SellNFT
        ? 'Price'
        : 'Highest Bid';
    }
    if (
      !!openseaLastPrice ||
      (bestOrder?.orderStatus === OrderStatus.Unfillable && bestOrder?.isFilled)
    ) {
      return 'Last Price';
    }
    if (!!mintPrice) {
      return 'Mint price';
    }
    return '-';
  }, [mintPrice, openseaLastPrice, isMarketLive, bestOrder]);

  return useMemo(() => {
    return {
      priceText,
      priceLabel,
      listingValue,
      listingAssetSymbol,
      isMarketLive,
    };
  }, [priceText, priceLabel, listingValue, isMarketLive, listingAssetSymbol]);
};
