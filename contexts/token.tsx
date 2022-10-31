import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { Season } from '@hash/seasons';
import { BigNumber } from 'ethers';
import React, { useMemo, useState } from 'react';
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore';
import useSWR from 'swr';
import { fb } from '../clients/firebase-app';
import { ROUTES } from '../constants/routes';
import { useIsMigrated } from '../hooks/useIsMigrated';
import { MintState, useMintStateByTokenId } from '../hooks/useMintState';
import { useOwnerByTokenId } from '../hooks/useOwner';
import { useSeasonFromTokenId } from '../hooks/useSeason';
import { useTokenId } from '../hooks/useTokenId';
import { useOptimisticTokenMetadata } from '../hooks/useTokenMetadata';
import { TraderOrders, useTraderOrders } from '../hooks/useTrader';
import {
  UserAddedMetadata,
  useUserAddedMetadataByTokenMetadata,
} from '../hooks/useUserAddedMetadata';
import { Comment } from '../types/comments';
import {
  FirestoreToken,
  TokenMetadataWithDocumentsAndInfos,
} from '../types/metadata';
import { OrderStatus, SignedOrderWithCidAndOrderStatus } from '../types/trader';
import { fetcher, prerenderWithFailsafeFetcher } from '../utils/fetcher';
import { serializeComment, serializeFirestoreToken } from '../utils/serialize';
import { usePrefetchedTokenMetadataByContext } from './tokenPrefetch';

export interface TokenProviderContext {
  hash?: string | undefined | null;
  tokenId?: string | undefined | null;
  tokenMetadata?: Partial<TokenMetadataWithDocumentsAndInfos>;
  owner?: string | undefined | null;
  userAddedMetadata?: UserAddedMetadata;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setChosenSeason: React.Dispatch<React.SetStateAction<Season | undefined>>;
  prerenderPayload?: any;
  mintState?: MintState;
  preferredSeason: Season | undefined;
  traderOrders?: TraderOrders | undefined;
  tags?: string[] | undefined;
  bestOrderToDisplay?: SignedOrderWithCidAndOrderStatus;
  bestFilledOrderToDisplay?: SignedOrderWithCidAndOrderStatus;
  minter?: string | undefined | null;
  mintPrice?: BigNumber | undefined;
  isMigrated?: boolean;
  savedBy?: string[];
  comments?: Comment[];
}

export type TokenProviderState = TokenProviderContext;

const initialAppState: TokenProviderState = {
  isMigrated: undefined,
  owner: undefined,
  hash: undefined,
  tokenId: undefined,
  tokenMetadata: undefined,
  userAddedMetadata: undefined,
  isEditing: false,
  setIsEditing: (b) => true,
  prerenderPayload: undefined,
  mintState: undefined,
  setChosenSeason: (b) => '',
  preferredSeason: undefined,
  traderOrders: undefined,
  tags: undefined,
};

const Context = React.createContext<TokenProviderState>(initialAppState);

export interface TokenContextInterface {
  hash: string;
  shouldGetPrerenderPayload?: boolean;
  shouldNotFetchMetadataFromApi?: boolean;
  shouldNotFetchMetadataFromFirestore?: boolean;
  shouldNotFetchMetadataLive?: boolean;
  shouldFetchMarketData?: boolean;
  shouldFetchTags?: boolean;
  shouldFetchSaveCount?: boolean;
  shouldFetchComments?: boolean;
}

export const TokenProvider: React.FC<TokenContextInterface> = ({
  shouldGetPrerenderPayload,
  shouldNotFetchMetadataLive,
  shouldFetchMarketData,
  shouldFetchTags,
  shouldFetchSaveCount,
  hash,
  children,
  shouldNotFetchMetadataFromApi,
  shouldNotFetchMetadataFromFirestore,
  shouldFetchComments,
}) => {
  const { data: optimisticMetadataFromApi } = useSWR(
    useMemo(
      () =>
        !!hash && !shouldNotFetchMetadataFromApi
          ? `${ROUTES.API.TOKEN_METADATA.OPTIMISTIC}?txHash=${hash}`
          : null,
      [hash, shouldNotFetchMetadataFromApi],
    ),
    fetcher,
  );

  const fetchableHash = useMemo(() => {
    return !shouldNotFetchMetadataLive && !!hash ? hash : undefined;
  }, [hash, shouldNotFetchMetadataLive]);

  const tokenRef = useMemo(() => {
    if (!hash) {
      return undefined;
    }
    if (shouldNotFetchMetadataFromFirestore) {
      return undefined;
    }
    return fb.firestore().collection(FIRESTORE_ROUTES.TOKENS.ROOT).doc(hash);
  }, [hash, shouldNotFetchMetadataFromFirestore]);

  const shardedSavesRef = useMemo(() => {
    if (!hash) {
      return undefined;
    }
    if (!shouldFetchSaveCount) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.TOKENS.ROOT)
      .doc(hash)
      .collection(FIRESTORE_ROUTES.TOKENS.SHARDED_SAVE);
  }, [hash, shouldFetchSaveCount]);

  const [rawFirestoreToken] = useDocumentData<FirestoreToken>(tokenRef, {
    idField: 'hash',
  });

  const [shardedSaves] = useCollectionData<{ [account: string]: boolean }>(
    shardedSavesRef,
    {},
  );

  const savedBy = useMemo(
    () =>
      !!shardedSaves
        ? Object.entries(
            shardedSaves.reduce(
              (a, c) =>
                Object.entries(c).reduce(
                  (a, c) => ({
                    ...a,
                    [c[0]]: (a[c[0]] ?? 0) + (c[1] ? 1 : -1),
                  }),
                  a,
                ),
              {} as { [address: string]: number },
            ),
          )
            .filter((a) => a[1] > 0)
            .map((a) => a[0])
        : undefined,
    [shardedSaves],
  );

  const commentsRef = useMemo(() => {
    if (!hash) {
      return undefined;
    }
    if (!shouldFetchComments) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.COMMENTS.ROOT)
      .orderBy('createdAt', 'desc')
      .where('isHidden', '==', false)
      .where('txHash', '==', hash);
  }, [hash, shouldFetchComments]);

  const [rawComments] = useCollectionData<Comment>(commentsRef, {
    idField: 'id',
  });

  const comments = useMemo(
    () => rawComments?.map(serializeComment),
    [rawComments],
  );

  const firestoreToken = useMemo(
    () =>
      !!rawFirestoreToken
        ? serializeFirestoreToken(rawFirestoreToken)
        : undefined,
    [rawFirestoreToken],
  );
  const prefetchedTokenMetadata = usePrefetchedTokenMetadataByContext(
    hash ?? undefined,
  );

  const tokenIdFromProxy = useTokenId(hash);
  const tokenId = useMemo(() => {
    if (tokenIdFromProxy === undefined) {
      return (
        firestoreToken?.metadata?.tokenId ??
        prefetchedTokenMetadata?.metadata?.tokenId
      );
    }
    return tokenIdFromProxy;
  }, [prefetchedTokenMetadata, tokenIdFromProxy]);

  const ownerFromProxy = useOwnerByTokenId(tokenId ?? undefined);
  const owner = useMemo(
    () => ownerFromProxy ?? prefetchedTokenMetadata?.owner,
    [prefetchedTokenMetadata, ownerFromProxy],
  );

  const season = useSeasonFromTokenId(tokenId ?? undefined);
  const [chosenSeason, setChosenSeason] = useState<Season | undefined>(
    undefined,
  );
  const isMigrated = useIsMigrated(tokenId ?? undefined);

  const preferredSeason = useMemo(() => {
    return chosenSeason ?? season;
  }, [season, chosenSeason]);

  const localTokenMetadata = useOptimisticTokenMetadata(fetchableHash, {
    preferredSeason,
  });

  const tokenMetadata = useMemo(
    () =>
      Object.assign(
        {},
        prefetchedTokenMetadata?.metadata ?? {},
        optimisticMetadataFromApi ?? {},
        firestoreToken?.metadata ?? {},
        localTokenMetadata ?? {},
      ),
    [
      localTokenMetadata,
      optimisticMetadataFromApi,
      firestoreToken,
      prefetchedTokenMetadata,
    ],
  );

  const { data: tagsDataFromApi } = useSWR(
    useMemo(
      () =>
        !!hash && shouldFetchTags
          ? `${ROUTES.API.TOKEN_METADATA.TAGS}?hash=${hash}`
          : null,
      [hash, shouldFetchTags],
    ),
    fetcher,
  );

  const tags = useMemo(
    () =>
      prefetchedTokenMetadata?.tags ??
      (tagsDataFromApi?.tags as string[] | undefined),
    [prefetchedTokenMetadata, tagsDataFromApi],
  );

  const bestOrderToDisplay = useMemo(() => {
    if (!!firestoreToken) {
      return firestoreToken.bestOrderToDisplay;
    }
    return prefetchedTokenMetadata?.bestOrderToDisplay;
  }, [prefetchedTokenMetadata, firestoreToken]);
  const bestFilledOrderToDisplay = useMemo(
    () =>
      firestoreToken?.bestFilledOrderToDisplay ??
      prefetchedTokenMetadata?.bestFilledOrderToDisplay,
    [prefetchedTokenMetadata, firestoreToken],
  );

  const userAddedMetadata = useUserAddedMetadataByTokenMetadata(tokenMetadata);

  const [isEditing, setIsEditing] = useState(false);

  const { data: prerenderPayload, error } = useSWR(
    useMemo(
      () =>
        !!hash && shouldGetPrerenderPayload ? [preferredSeason, hash] : null,
      [preferredSeason, shouldGetPrerenderPayload, hash],
    ),
    prerenderWithFailsafeFetcher,
    {},
  );

  const mintState = useMintStateByTokenId(tokenId ?? undefined);

  const hashForTrader = useMemo(
    () => (shouldFetchMarketData ? hash : undefined),
    [hash, shouldFetchMarketData],
  );
  const traderOrders = useTraderOrders(hashForTrader, owner);

  const minter = useMemo(() => firestoreToken?.minter, [firestoreToken]);
  const mintPrice = useMemo(
    () =>
      !!firestoreToken?.mintPrice
        ? BigNumber.from(firestoreToken.mintPrice)
        : undefined,
    [firestoreToken],
  );

  const appStateObject = useMemo(() => {
    return {
      isMigrated,
      owner,
      isEditing,
      hash,
      tokenId,
      tokenMetadata,
      setIsEditing,
      userAddedMetadata,
      prerenderPayload,
      mintState,
      setChosenSeason,
      preferredSeason,
      traderOrders,
      tags,
      bestOrderToDisplay,
      bestFilledOrderToDisplay,
      minter,
      mintPrice,
      savedBy,
      comments,
    };
  }, [
    isMigrated,
    bestOrderToDisplay,
    bestFilledOrderToDisplay,
    firestoreToken,
    owner,
    prerenderPayload,
    mintState,
    userAddedMetadata,
    hash,
    tokenId,
    setIsEditing,
    isEditing,
    setChosenSeason,
    preferredSeason,
    traderOrders,
    tags,
    savedBy,
    comments,
  ]);

  return <Context.Provider value={appStateObject}>{children}</Context.Provider>;
};

export const useTokenContext = (): TokenProviderState => {
  return React.useContext(Context);
};

export const useCommentsByContext = () => {
  return useTokenContext()?.comments;
};

export const useSaveByByContext = () => {
  return useTokenContext()?.savedBy;
};

export const useIsMigratedByContext = () => {
  return useTokenContext()?.isMigrated;
};

export const useMinterByContext = () => {
  return useTokenContext()?.minter;
};

export const useMintPriceByContext = () => {
  return useTokenContext()?.mintPrice;
};

export const useBestOrderToDisplayByContext = () => {
  return useTokenContext()?.bestOrderToDisplay;
};

export const useBestFilledOrderToDisplayByContext = () => {
  return useTokenContext()?.bestFilledOrderToDisplay;
};

export const useTagsByContext = () => {
  return useTokenContext()?.tags;
};

export const useTraderOrdersByContext = () => {
  return useTokenContext()?.traderOrders;
};

export const useBestSaleByContext = () => {
  const trades = useTraderOrdersByContext();
  return useMemo(() => {
    if (!trades) {
      return undefined;
    }
    return trades.sales?.find((o) => o.orderStatus === OrderStatus.Fillable);
  }, [trades]);
};

export const useBestOfferByContext = () => {
  const trades = useTraderOrdersByContext();
  return useMemo(() => {
    if (!trades) {
      return undefined;
    }
    return trades.offers?.find((o) => o.orderStatus === OrderStatus.Fillable);
  }, [trades]);
};

export const useLastTraderFilledOrderByContext = () => {
  const trades = useTraderOrdersByContext();
  return useMemo(() => {
    if (!trades) {
      return undefined;
    }
    if (!trades.filledOrders || trades.filledOrders.length === 0) {
      return undefined;
    }
    return trades.filledOrders[0];
  }, [trades]);
};

export const usePreferredSeasonByContext = () => {
  return useTokenContext()?.preferredSeason;
};

export const useSetChosenSeasonByContext = () => {
  return useTokenContext()?.setChosenSeason;
};

export const useOwnerByContext = () => {
  return useTokenContext()?.owner;
};

export const useMintStateByContext = () => {
  return useTokenContext()?.mintState;
};

export const useTokenIdByContext = () => {
  return useTokenContext()?.tokenId;
};

export const useHashByContext = () => {
  return useTokenContext()?.hash;
};

export const useTokenMetadataByContext = () => {
  return useTokenContext()?.tokenMetadata;
};

export const useIsEditingByContext = () => {
  return useTokenContext()?.isEditing;
};

export const useSetIsEditingByContext = () => {
  return useTokenContext()?.setIsEditing;
};

export const usePrerenderPayloadByContext = () => {
  return useTokenContext()?.prerenderPayload;
};

export const useUserAddedMetadataByContext = () => {
  return useTokenContext()?.userAddedMetadata;
};
