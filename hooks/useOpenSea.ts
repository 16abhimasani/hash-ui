import { deployments } from '@hash/protocol';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import useSWR from 'swr';
import { CHAIN_ID } from '../constants';
import { ROUTES } from '../constants/routes';
import { fetcher } from '../utils/fetcher';

export interface PrettyOrder {
  payment_token: {
    address: string;
    decimals: number;
    name: string;
    symbol: string;
  };
  current_price?: BigNumber;
  order_type: 'english_auction' | 'sale' | 'dutch_auction';
}

export const useLastPriceFromOS = (tokenId: string | undefined) => {
  const { data } = useSWR(
    useMemo(
      () =>
        false
          ? `${ROUTES.API.OPENSEA.METADATA}?&address=${deployments[CHAIN_ID].nft.erc1155}id=${tokenId}`
          : null,
      [tokenId],
    ),
    fetcher,
    {},
  );

  return useMemo(() => {
    if (!data) {
      return undefined;
    }
    if (!data.os?.last_sale) {
      return undefined;
    }
    const lastSale = data.os.last_sale;
    if (!lastSale?.total_price || !lastSale?.payment_token?.symbol) {
      return undefined;
    }
    return {
      price: BigNumber.from(lastSale.total_price),
      paymentAssetSymbol: lastSale.payment_token.symbol,
    };
  }, [data]);
};

// const OS_SINGLE_ASSET = (contract: string, token: string) =>
//   `https://api.opensea.io/api/v1/asset/${contract}/${token}`;
// const HASH_OS_ASSET = OS_SINGLE_ASSET(
//   '0xe18a32192ed95b0fe9d70d19e5025f103475d7ba',
//   '57896044618658097711785492504343953926975274699741220483192166611388333031425',
// );
// export const useOpenSeaStats = () => {
//   const { data } = useSWR(HASH_OS_ASSET, fetcher, {});
//   const stats = data?.collection?.stats;
//   const total_volume = stats?.total_volume;
//   const total_sales = stats?.total_sales;
//   const total_mints = stats?.total_supply;
//   const avg_price = stats?.average_price;
//   const num_owners = stats?.num_owners;
//   const floor_price = stats?.floor_price;
//   const market_cap = stats?.market_cap;
//   return useMemo(
//     () => ({
//       total_volume,
//       total_sales,
//       total_mints,
//       avg_price,
//       num_owners,
//       floor_price,
//       market_cap,
//     }),
//     [stats],
//   );
// };
