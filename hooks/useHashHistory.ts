import { useQuery } from '@apollo/client';
import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { BigNumber } from 'ethers';
import { invert } from 'lodash';
import { useMemo } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { fb } from '../clients/firebase-app';
import { TRADABLE_ASSETS } from '../constants';
import { GET_RICH_TOKEN_METADATA_BY_HASH_BLOCK_BASED_QUERY } from '../queries';
import { useBlockchainStore } from '../stores/blockchain';
import {
  TokenMetadataKey,
  TOKEN_METADATA_HASH_TO_READABLE_KEYS_MAP,
} from '../types/metadata';
import { SignedTextWithMetadata } from '../types/signing';
import {
  OrderStatus,
  SignedOrderWithCidAndOrderStatus,
  TradeDirection,
} from '../types/trader';
import { SignedVerdictMetadataFromFirebase } from '../types/verdict';
import { getBlockNumFromStoreWithDelay } from '../utils/blockNum';
import { serializeSignedOrderFromFirebase } from '../utils/serialize';
import { getTotalErc20AmountInOrder } from '../utils/trader';
import { useLastTruthyValue } from './useLastTruthyValue';
import { useSignedOrdersWithUpToDateOrderStatusNoFilter } from './useTrader';

export interface HashMintedHistory {
  type: 'minted';
  createdAt: number;
  minter: string;
}

export interface HashUpdatedOptimisticMetadata {
  type: 'optimistic-metadata';
  createdAt: number;
  writer: string;
  contentHash: string;
}

export interface HashUpdatedOptimisticVerdict {
  type: 'optimistic-verdict';
  createdAt: number;
  writer: string;
}

export interface HashUpdatedOnChainMetadata {
  type: 'onchain-metadata';
  createdAt: number;
  writer: string;
  contentHash: string;
}

export interface HashUpdatedOnChainVerdict {
  type: 'onchain-verdict';
  createdAt: number;
  writer: string;
}

export interface HashMadeOrder {
  type: 'hash-made-order';
  createdAt: number;
  maker: string;
  amount: BigNumber;
  amountSymbol: string;
  direction: TradeDirection;
  contentHash: string;
}

export interface HashFilledOrder {
  type: 'hash-filled-order';
  createdAt: number;
  taker: string;
  amount: BigNumber;
  amountSymbol: string;
  direction: TradeDirection;
  txHash: string;
}

export type HashHistory =
  | HashUpdatedOnChainMetadata
  | HashUpdatedOnChainVerdict
  | HashUpdatedOptimisticVerdict
  | HashUpdatedOptimisticMetadata
  | HashMintedHistory
  | HashMadeOrder
  | HashFilledOrder;

const VALID_HISTORY_ORDER_STATUS = [
  OrderStatus.Fillable,
  OrderStatus.Unfillable,
  OrderStatus.Expired,
];

export const useHashHistory = (hash: string | undefined) => {
  const filledOrdersRef = useMemo(() => {
    if (!hash) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.SIGNED_ORDERS)
      .orderBy('filledAtBlockNum', 'desc')
      .where('hash', '==', hash)
      .where('orderStatus', '==', OrderStatus.Unfillable)
      .where('filledAtBlockNum', '>=', 0);
  }, [hash]);

  const [rawFilledOrders, ...rest] =
    useCollectionData<SignedOrderWithCidAndOrderStatus>(filledOrdersRef);

  const serializedFilledOrders = useMemo(
    () => rawFilledOrders?.map(serializeSignedOrderFromFirebase),
    [rawFilledOrders],
  );

  const filledOrders = useSignedOrdersWithUpToDateOrderStatusNoFilter(
    serializedFilledOrders,
  );

  const hashFilledOrderHistory = useMemo((): HashFilledOrder[] => {
    return (
      (filledOrders
        ?.map((o) => {
          const tokenAddress = o.erc20Token;
          const amount = getTotalErc20AmountInOrder(o);
          const amountSymbol = invert(TRADABLE_ASSETS)[tokenAddress];
          if (!o.filledTakerAddress || !o.filledTxHash || !o.filledAtBlockNum) {
            return undefined;
          }

          return {
            type: 'hash-filled-order',
            createdAt: o.filledAt,
            taker: o.filledTakerAddress,
            amount,
            amountSymbol,
            direction: o.direction,
            txHash: o.filledTxHash,
          } as HashFilledOrder;
        })
        .filter((h) => !!h) as HashFilledOrder[]) ?? []
    );
  }, [filledOrders]);

  const offersRef = useMemo(() => {
    if (!hash) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.SIGNED_ORDERS)
      .orderBy('erc20AssetAmountNum', 'desc')
      .where('hash', '==', hash)
      .where('direction', '==', TradeDirection.BuyNFT)
      .where('orderStatus', 'in', VALID_HISTORY_ORDER_STATUS);
  }, [hash]);

  const [rawOffers] =
    useCollectionData<SignedOrderWithCidAndOrderStatus>(offersRef);

  const serializedRawOffers = useMemo(
    () => rawOffers?.map(serializeSignedOrderFromFirebase),
    [rawOffers],
  );

  const offers =
    useSignedOrdersWithUpToDateOrderStatusNoFilter(serializedRawOffers);

  const hashMadeOfferOrderHistory = useMemo((): HashMadeOrder[] => {
    return (
      offers?.map((o) => {
        const tokenAddress = o.erc20Token;
        const amount = getTotalErc20AmountInOrder(o);
        const amountSymbol = invert(TRADABLE_ASSETS)[tokenAddress];
        return {
          type: 'hash-made-order',
          createdAt: o.createdAt,
          maker: o.maker,
          amount,
          amountSymbol,
          direction: o.direction,
          contentHash: o.cid,
        } as HashMadeOrder;
      }) ?? []
    );
  }, [offers]);

  const salesRef = useMemo(() => {
    if (!hash) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.SIGNED_ORDERS)
      .orderBy('erc20AssetAmountNum', 'desc')
      .where('hash', '==', hash)
      .where('direction', '==', TradeDirection.SellNFT)
      .where('orderStatus', 'in', VALID_HISTORY_ORDER_STATUS);
  }, [hash]);

  const [rawSales] =
    useCollectionData<SignedOrderWithCidAndOrderStatus>(salesRef);
  const serializedRawSales = useMemo(
    () => rawSales?.map(serializeSignedOrderFromFirebase),
    [rawSales],
  );
  const sales =
    useSignedOrdersWithUpToDateOrderStatusNoFilter(serializedRawSales);

  const hashMadeSaleOrderHistory = useMemo((): HashMadeOrder[] => {
    return (
      sales?.map((o) => {
        const tokenAddress = o.erc20Token;
        const amount = getTotalErc20AmountInOrder(o);
        const amountSymbol = invert(TRADABLE_ASSETS)[tokenAddress];
        return {
          type: 'hash-made-order',
          createdAt: o.createdAt,
          maker: o.maker,
          amount,
          amountSymbol,
          direction: o.direction,
          contentHash: o.cid,
        } as HashMadeOrder;
      }) ?? []
    );
  }, [sales]);

  const blockNum = useBlockchainStore(getBlockNumFromStoreWithDelay);
  const results = useQuery(GET_RICH_TOKEN_METADATA_BY_HASH_BLOCK_BASED_QUERY, {
    variables: {
      hash,
      blockNum,
    },
  });

  const data = useLastTruthyValue(results.data);

  const mintedHistory = useMemo(() => {
    if (!hash) {
      return undefined;
    }
    if (!data) {
      return undefined;
    }
    if (!data.hashes) {
      return undefined;
    }
    if (!data.hashes[0]) {
      return undefined;
    }
    return {
      type: 'minted',
      createdAt: parseInt(data.hashes[0].createdAt),
      minter: data.hashes[0].createdBy,
    } as HashMintedHistory;
  }, [hash, data]);

  const onChainHistory = useMemo(() => {
    if (!hash) {
      return [];
    }
    if (!data) {
      return [];
    }
    if (!data.hashes) {
      return [];
    }
    if (!data.hashes[0]) {
      return [];
    }
    const invertedMap = invert(TOKEN_METADATA_HASH_TO_READABLE_KEYS_MAP);

    return data.hashes[0].metadataHistory.map((h: any) => {
      if (invertedMap[h.key] === 'metadataCID') {
        return {
          type: 'onchain-metadata',
          createdAt: parseInt(h.createdAt),
          writer: h.writer,
          contentHash: h.text,
        } as HashUpdatedOnChainMetadata;
      }
      return {
        type: 'onchain-verdict',
        createdAt: parseInt(h.createdAt),
        writer: h.writer,
      } as HashUpdatedOnChainVerdict;
    });
  }, [hash, data]);

  // get firebase history
  const signedTextsCollectionRef = useMemo(() => {
    if (!hash) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.SIGNED_TEXTS)
      .where('hash', '==', hash)
      .where('key', '==', 'metadataCID' as TokenMetadataKey);
  }, [hash]);

  const [signedTexts] = useCollectionData<SignedTextWithMetadata>(
    signedTextsCollectionRef,
    { idField: 'id' },
  );

  const optimisticMetadataHistory = useMemo(
    () =>
      signedTexts?.map(
        (v) =>
          ({
            type: 'optimistic-metadata',
            createdAt: v.createdAt,
            writer: v.writer,
            contentHash: v.text,
          } as HashUpdatedOptimisticMetadata),
      ) ?? [],
    [signedTexts],
  );

  const verdictsCollectionRef = useMemo(() => {
    if (!hash) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.VERDICT_METADATAS.ROOT)
      .where('verdict.txHash', '==', hash);
  }, [hash]);

  const [signedVerdicts] = useCollectionData<SignedVerdictMetadataFromFirebase>(
    verdictsCollectionRef,
    { idField: 'id' },
  );

  const contentHashes = useMemo(
    () =>
      signedTexts
        ?.map((t) => t.text)
        .concat(
          onChainHistory
            .filter((o: any) => o.type === 'onchain-metadata')
            .map((o: any) => o.contentHash),
        ),
    [signedTexts, optimisticMetadataHistory],
  );

  const optimisticVerdictHistory = useMemo(
    () =>
      signedVerdicts
        ?.filter((v) => contentHashes?.includes(v.verdict.contentHash))
        ?.map(
          (v) =>
            ({
              type: 'optimistic-verdict',
              createdAt: v.verdict.createdAt ?? -1,
              writer: v.signer,
            } as HashUpdatedOptimisticVerdict),
        )
        .filter((v) => v.createdAt !== -1) ?? [],
    [contentHashes, signedVerdicts],
  );

  return useMemo(() => {
    return (
      [
        mintedHistory,
        ...onChainHistory,
        ...optimisticVerdictHistory,
        ...optimisticMetadataHistory,
        ...hashFilledOrderHistory,
        ...hashMadeOfferOrderHistory,
        ...hashMadeSaleOrderHistory,
      ].filter((h) => !!h) as HashHistory[]
    ).sort((a: HashHistory, b: HashHistory) => b?.createdAt - a?.createdAt);
  }, [
    mintedHistory,
    onChainHistory,
    optimisticVerdictHistory,
    optimisticMetadataHistory,
    hashFilledOrderHistory,
    hashMadeOfferOrderHistory,
    hashMadeSaleOrderHistory,
  ]);
};
