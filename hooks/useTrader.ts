import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { deployments } from '@hash/protocol';
import {
  MAX_APPROVAL,
  NftSwapV4,
  UserFacingERC20AssetDataSerialized,
  UserFacingERC721AssetDataSerialized,
} from '@traderxyz/nft-swap-sdk';
import { BigNumber, utils } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import useSWR from 'swr';
import { fb } from '../clients/firebase-app';
import { usePriorityAccount } from '../connectors/priority';
import {
  CHAIN_ID,
  NULL_ADDRESS,
  RELAYER_DOMAIN_HASH,
  TradableAssetSymbol,
  TRADABLE_ASSETS,
  ZERO,
} from '../constants';
import { ROUTES } from '../constants/routes';
import { useTraderClientByContext } from '../contexts/trader';
import { useBlockchainStore } from '../stores/blockchain';
import { useTransactionsStore } from '../stores/transaction';
import {
  OrderStatus,
  SignedOrderWithCidAndOrderStatus,
  TradeDirection,
} from '../types/trader';
import { TransactionStatus } from '../types/transaction';
import { fetcher } from '../utils/fetcher';
import { serializeSignedOrderFromFirebase } from '../utils/serialize';
import { lowerCaseCheck } from '../utils/string';
import {
  getTotalErc20AmountInOrder,
  getTraderFeeStruct,
} from '../utils/trader';
import { useErc20Contract, useHashV2Contract } from './useContracts';
import { useTxn } from './useTxn';

const POLL_EVER_X_BLOCKS = 5;

export const getTraderAssetFromFungibleAsset = (
  tokenSymbol: TradableAssetSymbol,
  amount: BigNumber,
): UserFacingERC20AssetDataSerialized => ({
  tokenAddress: TRADABLE_ASSETS[tokenSymbol],
  amount: amount.toString(),
  type: 'ERC20',
});

export const getTraderAssetFromHash = (
  tokenId: string,
): UserFacingERC721AssetDataSerialized => ({
  tokenAddress: deployments[CHAIN_ID].nft.v2,
  tokenId,
  type: 'ERC721',
});

export const getOrderNonce = (
  tokenId: string,
  salt: number = new Date().getTime(),
) => {
  return utils.solidityKeccak256(
    ['bytes4', 'address', 'uint256', 'uint256'],
    [RELAYER_DOMAIN_HASH, deployments[CHAIN_ID].nft.v2, tokenId, salt],
  );
};

export const getUnsignedBidOrderFromTrader = (
  client: NftSwapV4,
  bidder: string,
  bidAsset: TradableAssetSymbol,
  bidAmount: BigNumber,
  bidExpiryTime: number | undefined,
  forTokenId: string,
  nonce: string = getOrderNonce(forTokenId),
) => {
  const feeStruct = getTraderFeeStruct(bidAmount);
  return client.buildNftAndErc20Order(
    getTraderAssetFromHash(forTokenId),
    getTraderAssetFromFungibleAsset(bidAsset, bidAmount.sub(feeStruct.amount)),
    'buy',
    bidder,
    {
      expiry: bidExpiryTime,
      nonce,
      fees: [feeStruct],
    },
  );
};

export const getUnsignedSaleOrderFromTrader = (
  client: NftSwapV4,
  maker: string,
  receivingAsset: TradableAssetSymbol,
  receivingAmount: BigNumber,
  saleExpiryTime: number | undefined,
  forTokenId: string,
  nonce: string = getOrderNonce(forTokenId),
) => {
  const feeStruct = getTraderFeeStruct(receivingAmount);
  return client.buildNftAndErc20Order(
    getTraderAssetFromHash(forTokenId),
    getTraderAssetFromFungibleAsset(
      receivingAsset,
      receivingAmount.sub(feeStruct.amount),
    ),
    'sell',
    maker,
    {
      expiry: saleExpiryTime,
      nonce,
      fees: [feeStruct],
    },
  );
};

export const useIsHashApproved = (address: string | null | undefined) => {
  const transactionMap = useTransactionsStore((s) => s.transactionMap);
  const hashV2 = useHashV2Contract();
  const [isApproved, setIsApproved] = useState<undefined | boolean>(undefined);

  useEffect(() => {
    if (!hashV2) {
      return;
    }
    if (!address) {
      return;
    }
    if (isApproved) {
      return;
    }
    hashV2
      .isApprovedForAll(address, deployments[CHAIN_ID].misc.zeroEx)
      .then((approvalStatus) => {
        setIsApproved(approvalStatus);
      });
  }, [hashV2, transactionMap, address]);
  return isApproved;
};

export const useIsFungibleAssetApproved = (
  tokenSymbol: TradableAssetSymbol | undefined,
  address: string | null | undefined,
  amount: BigNumber | undefined,
) => {
  const transactionMap = useTransactionsStore((s) => s.transactionMap);
  const client = useTraderClientByContext();
  const [isApproved, setIsApproved] = useState<undefined | boolean>(undefined);
  useEffect(() => {
    if (!client) {
      return;
    }
    if (!tokenSymbol) {
      return;
    }
    if (!amount) {
      return;
    }
    if (!address) {
      return;
    }
    if (isApproved) {
      return;
    }
    client
      .loadApprovalStatus(
        getTraderAssetFromFungibleAsset(tokenSymbol, amount),
        address,
      )
      .then((approvalStatus) => {
        setIsApproved(approvalStatus.contractApproved);
      });
  }, [client, tokenSymbol, amount, transactionMap, address]);
  return isApproved;
};

export const useFungibleAssetBalance = (
  tokenSymbol: TradableAssetSymbol | undefined,
  address: string | undefined | null,
) => {
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const [balance, setBalance] = useState<undefined | BigNumber>(undefined);
  const erc20 = useErc20Contract(
    useMemo(
      () => (!!tokenSymbol ? TRADABLE_ASSETS[tokenSymbol] : undefined),
      [tokenSymbol],
    ),
  );

  useEffect(() => {
    if (!tokenSymbol) {
      return;
    }
    if (!blockNumber) {
      return;
    }
    if (!erc20) {
      return;
    }
    if (!address) {
      return;
    }
    if (blockNumber % POLL_EVER_X_BLOCKS !== 0 && !!balance) {
      return;
    }

    erc20.balanceOf(address).then(setBalance);
  }, [tokenSymbol, erc20, blockNumber, address]);
  return balance;
};

export interface TraderOrders {
  offers?: SignedOrderWithCidAndOrderStatus[];
  sales?: SignedOrderWithCidAndOrderStatus[];
  filledOrders?: SignedOrderWithCidAndOrderStatus[];
}

export const useSignedOrdersWithUpToDateOrderStatus = (
  orders: SignedOrderWithCidAndOrderStatus[] | undefined,
  filterFor: OrderStatus = OrderStatus.Fillable,
) => {
  const orderStatuses = useTraderOrderStatuses(orders);
  return useMemo(
    () =>
      orders
        ?.map((o) => ({
          ...o,
          orderStatus: orderStatuses?.[o.cid] ?? o.orderStatus,
        }))
        .filter((o) => o.orderStatus === filterFor),
    [orderStatuses, orders],
  );
};

export const useSignedOrdersWithUpToDateOrderStatusNoFilter = (
  orders: SignedOrderWithCidAndOrderStatus[] | undefined,
) => {
  const orderStatuses = useTraderOrderStatuses(orders);
  return useMemo(
    () =>
      orders?.map((o) => ({
        ...o,
        orderStatus: orderStatuses?.[o.cid] ?? o.orderStatus,
      })),
    [orderStatuses, orders],
  );
};

export const useTraderOrders = (
  txHash?: string,
  owner?: string | null,
): TraderOrders => {
  const normalizedOwner = useMemo(
    () => (!!owner ? utils.getAddress(owner) : undefined),
    [owner],
  );

  const offersRef = useMemo(() => {
    if (!txHash) {
      return undefined;
    }
    if (!normalizedOwner) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.SIGNED_ORDERS)
      .where('hash', '==', txHash)
      .where('direction', '==', TradeDirection.BuyNFT)
      .where('orderStatus', '==', OrderStatus.Fillable)
      .orderBy('maker', 'desc')
      .where('maker', '!=', normalizedOwner)
      .orderBy('erc20AssetAmountNum', 'desc');
  }, [txHash, normalizedOwner]);

  const [rawOffers] =
    useCollectionData<SignedOrderWithCidAndOrderStatus>(offersRef);

  const serializedRawOffers = useMemo(
    () => rawOffers?.map(serializeSignedOrderFromFirebase),
    [rawOffers],
  );

  const offers = useSignedOrdersWithUpToDateOrderStatus(serializedRawOffers);

  const salesRef = useMemo(() => {
    if (!txHash) {
      return undefined;
    }
    if (!normalizedOwner) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.SIGNED_ORDERS)
      .orderBy('erc20AssetAmountNum', 'asc')
      .where('hash', '==', txHash)
      .where('direction', '==', TradeDirection.SellNFT)
      .where('orderStatus', '==', OrderStatus.Fillable)
      .where('maker', '==', normalizedOwner);
  }, [txHash, normalizedOwner]);

  const [rawSales] =
    useCollectionData<SignedOrderWithCidAndOrderStatus>(salesRef);

  const serializedRawSales = useMemo(
    () => rawSales?.map(serializeSignedOrderFromFirebase),
    [rawSales],
  );

  const sales = useSignedOrdersWithUpToDateOrderStatus(serializedRawSales);

  const filledOrdersRef = useMemo(() => {
    if (!txHash) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.SIGNED_ORDERS)
      .orderBy('filledAtBlockNum', 'desc')
      .where('hash', '==', txHash)
      .where('orderStatus', '==', OrderStatus.Unfillable)
      .where('isFilled', '==', true)
      .where('filledAtBlockNum', '>=', 0);
  }, [txHash]);

  const [rawFilledOrders] =
    useCollectionData<SignedOrderWithCidAndOrderStatus>(filledOrdersRef);

  const serializedFilledOrders = useMemo(
    () => rawFilledOrders?.map(serializeSignedOrderFromFirebase),
    [rawFilledOrders],
  );

  const filledOrders = useSignedOrdersWithUpToDateOrderStatus(
    serializedFilledOrders,
    OrderStatus.Unfillable,
  );

  return useMemo(() => {
    return {
      offers: offers,
      sales: sales,
      filledOrders,
    };
  }, [offers, sales, filledOrders, normalizedOwner]);
};

export const useTraderFillOrder = (
  order: SignedOrderWithCidAndOrderStatus | undefined,
) => {
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const client = useTraderClientByContext();
  const account = usePriorityAccount();
  const [error, setError] = useState<any | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);

  const tx = useTxn(
    useMemo(
      () => ({
        cid: !!order ? order.cid : NULL_ADDRESS,
        type: 'accept-trader-order',
      }),
      [order],
    ),
  );

  const fill = useCallback(async () => {
    if (!order) {
      return;
    }
    if (!client) {
      return;
    }

    if (!account) {
      return;
    }

    try {
      setIsLoading(true);

      const isOrderFillableByNativeToken =
        order.direction === TradeDirection.SellNFT &&
        order.erc20Token === TRADABLE_ASSETS.ETH;

      const res = await client.fillSignedOrder(
        order,
        {},
        {
          value: isOrderFillableByNativeToken
            ? getTotalErc20AmountInOrder(order)
            : ZERO,
        },
      );

      if (!!res) {
        addTransaction(res.hash, {
          cid: order.cid,
          type: 'accept-trader-order',
        });
        setError(undefined);
      }
    } catch (e) {
      console.error(e);
      setError(e);
    }
    setIsLoading(false);
  }, [setIsLoading, client, account, order]);

  return useMemo(() => {
    return {
      error,
      tx,
      txStatus: tx?.status,
      fill,
      isLoading,
    };
  }, [isLoading, error, tx, fill]);
};

export const useTraderCancelOrder = (
  order: SignedOrderWithCidAndOrderStatus | undefined,
) => {
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const client = useTraderClientByContext();
  const account = usePriorityAccount();
  const [error, setError] = useState<any | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);

  const tx = useTxn(
    useMemo(
      () => ({
        cid: !!order ? order.cid : NULL_ADDRESS,
        type: 'cancel-trader-order',
      }),
      [order],
    ),
  );

  const cancel = useCallback(async () => {
    if (!order) {
      return;
    }
    if (!client) {
      return;
    }
    if (!account) {
      return;
    }

    if (!lowerCaseCheck(order.maker, account)) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await client.cancelOrder(order.nonce, 'ERC721');
      if (!!res) {
        addTransaction(res.hash, {
          cid: order.cid,
          type: 'cancel-trader-order',
        });
        setError(undefined);
      }
    } catch (e) {
      console.error(e);
      setError(e);
    }
    setIsLoading(false);
  }, [setIsLoading, client, account, order]);

  return useMemo(() => {
    return {
      error,
      tx,
      txStatus: tx?.status,
      cancel,
      isLoading,
    };
  }, [isLoading, error, tx, cancel]);
};

export const useTraderApproveHash = () => {
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const client = useTraderClientByContext();
  const hash = useHashV2Contract();
  const account = usePriorityAccount();
  const [error, setError] = useState<any | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);

  const tx = useTxn(
    useMemo(
      () => ({
        tokenAddress: deployments[CHAIN_ID].nft.v2,
        type: 'approve-for-trader',
      }),
      [],
    ),
  );

  const txStatus: TransactionStatus | undefined = useMemo(
    () => tx?.status,
    [tx],
  );

  const approve = useCallback(async () => {
    if (!hash) {
      return;
    }
    if (!client) {
      return;
    }
    if (!account) {
      return;
    }
    try {
      setIsLoading(true);
      const res = await hash.setApprovalForAll(
        client.exchangeProxy.address,
        true,
      );
      if (!!res) {
        addTransaction(res.hash, {
          tokenAddress: deployments[CHAIN_ID].nft.v2,
          type: 'approve-for-trader',
        });
        setError(undefined);
      }
    } catch (e) {
      console.error(e);
      setError(e);
    }
    setIsLoading(false);
  }, [hash, setIsLoading, client, account]);

  return useMemo(() => {
    return {
      error,
      tx,
      txStatus,
      approve,
      isLoading,
    };
  }, [isLoading, error, tx, txStatus, approve]);
};

export const useTraderApproveTradableAsset = (
  asset: TradableAssetSymbol | undefined,
) => {
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const client = useTraderClientByContext();
  const account = usePriorityAccount();
  const [error, setError] = useState<any | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);

  const tx = useTxn(
    useMemo(
      () => ({
        tokenAddress: !!asset ? TRADABLE_ASSETS[asset] : NULL_ADDRESS,
        type: 'approve-for-trader',
      }),
      [asset],
    ),
  );

  const txStatus: TransactionStatus | undefined = useMemo(
    () => tx?.status,
    [tx],
  );

  const approve = useCallback(async () => {
    if (!asset) {
      return;
    }
    if (!client) {
      return;
    }
    if (!account) {
      return;
    }
    try {
      setIsLoading(true);
      const res = await client.approveTokenOrNftByAsset(
        getTraderAssetFromFungibleAsset(asset, MAX_APPROVAL),
        account,
      );
      if (!!res) {
        addTransaction(res.hash, {
          tokenAddress: TRADABLE_ASSETS[asset],
          type: 'approve-for-trader',
        });
        setError(undefined);
      }
    } catch (e) {
      console.error(e);
      setError(e);
    }
    setIsLoading(false);
  }, [setIsLoading, client, account, asset]);

  return useMemo(() => {
    return {
      error,
      tx,
      txStatus,
      approve,
      isLoading,
    };
  }, [isLoading, error, tx, txStatus, approve]);
};

export const useTraderPlaceBid = (
  tokenId: string | null | undefined,
): [
  (
    bidAsset: TradableAssetSymbol,
    bidAmount: BigNumber,
    bidExpiryTime: number | undefined,
  ) => Promise<boolean>,
  boolean,
] => {
  const account = usePriorityAccount();

  const client = useTraderClientByContext();

  const [isLoading, setIsLoading] = useState(false);

  const placeBid = useCallback(
    async (
      bidAsset: TradableAssetSymbol,
      bidAmount: BigNumber,
      bidExpiryTime: number | undefined,
    ) => {
      if (!client) {
        return false;
      }
      if (!account) {
        return false;
      }
      if (!tokenId) {
        return false;
      }
      setIsLoading(true);
      const order = getUnsignedBidOrderFromTrader(
        client,
        account,
        bidAsset,
        bidAmount,
        bidExpiryTime,
        tokenId,
      );
      try {
        const signedOrder = await client.signOrder(order);
        const res = await fetch(ROUTES.API.TRADER.BID, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(signedOrder),
        });
        if (res.ok) {
          setIsLoading(false);
          console.log('Order placed:', (await res.json())?.cid);
          return true;
        } else {
          throw new Error(res.statusText);
        }
      } catch (e) {
        console.log('Error signing order:', e);
        setIsLoading(false);
        return false;
      }
    },
    [client, account, tokenId],
  );
  return [placeBid, isLoading];
};

export const useTraderListSale = (
  tokenId: string | null | undefined,
): [
  (
    receivingAsset: TradableAssetSymbol,
    receivingAmount: BigNumber,
    saleExpiryTime: number | undefined,
    nonce: string | undefined,
  ) => Promise<boolean>,
  boolean,
] => {
  const account = usePriorityAccount();

  const client = useTraderClientByContext();

  const [isLoading, setIsLoading] = useState(false);

  const listSale = useCallback(
    async (
      receivingAsset: TradableAssetSymbol,
      receivingAmount: BigNumber,
      saleExpiryTime: number | undefined,
      nonce: string | undefined,
    ) => {
      if (!client) {
        return false;
      }
      if (!account) {
        return false;
      }
      if (!tokenId) {
        return false;
      }
      setIsLoading(true);
      const order = getUnsignedSaleOrderFromTrader(
        client,
        account,
        receivingAsset,
        receivingAmount,
        saleExpiryTime,
        tokenId,
        nonce,
      );
      try {
        const signedOrder = await client.signOrder(order);
        console.log(signedOrder);
        const res = await fetch(ROUTES.API.TRADER.LIST, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(signedOrder),
        });
        if (res.ok) {
          setIsLoading(false);
          console.log('Order placed:', (await res.json())?.cid);
          return true;
        } else {
          throw new Error(res.statusText);
        }
      } catch (e) {
        console.log('Error signing order:', e);
        setIsLoading(false);
        return false;
      }
    },
    [client, account, tokenId],
  );
  return [listSale, isLoading];
};

export const useTraderOrderStatus = (
  order: SignedOrderWithCidAndOrderStatus | undefined,
) => {
  const orderArr = useMemo(() => (!!order ? [order] : undefined), []);

  const orderStatuses = useTraderOrderStatuses(orderArr);

  return useMemo(() => {
    if (!order) {
      return undefined;
    }
    return orderStatuses?.[order.cid];
  }, [order, orderStatuses]);
};

export const useTraderOrderStatuses = (
  orders: SignedOrderWithCidAndOrderStatus[] | undefined,
) => {
  const transactionMap = useTransactionsStore((s) => s.transactionMap);
  const { data } = useSWR(
    useMemo(
      () =>
        !!orders && orders.length !== 0
          ? `${ROUTES.API.TRADER.ORDER_STATUS}?orderNonces=${orders
              .map((o) => BigNumber.from(o.nonce).toHexString())
              .join(',')}`
          : null,
      [orders, transactionMap],
    ),
    fetcher,
  );

  return useMemo(() => {
    if (!data) {
      return undefined;
    }
    if (!data.orderStatuses) {
      return undefined;
    }
    return data.orderStatuses;
  }, [data, orders]);
};
