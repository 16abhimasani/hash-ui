import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import some from 'lodash/some';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import {
  EmptyGridState,
  FilterControls,
  GridWithFilterContainer,
  InfiniteGrid,
  ListFilter,
} from '.';
import { fb } from '../../clients/firebase-app';
import {} from '../../constants';
import {
  FilterSettingProvider,
  useFilterSettings,
} from '../../contexts/filterSettings';
import {
  TokenPrefetchData,
  TokenPrefetchProvider,
} from '../../contexts/tokenPrefetch';
import { ListPrefetchData, ListWithId } from '../../types/list';
import { FirestoreToken } from '../../types/metadata';
import { serializeFirestoreToken, serializeList } from '../../utils/serialize';
import { ListHeader } from './header/list';

/**
 * This is List powered down for v3 which means a few design assumptions:
 * - only one hash group exist
 * - no title + description in hash groups are interpreted
 * - single author?
 */
const firestore = fb.firestore();

const PAGE_SIZE = 20;

export interface ListGridProps {
  listId?: string;
  prefetchData?: ListPrefetchData;
}

export const ListGrid: React.FC<ListGridProps> = ({ children, listId }) => {
  return (
    <FilterSettingProvider initialIsFilterSettingsOpen={false}>
      <ListGridInner listId={listId} />
    </FilterSettingProvider>
  );
};

const ListGridInner: React.FC<ListGridProps> = ({
  children,
  listId,
  prefetchData,
}) => {
  const listRef = useMemo(() => {
    if (!listId) return undefined;
    return firestore.collection(FIRESTORE_ROUTES.CURATIONS.ROOT).doc(listId);
  }, [listId]);

  const listSettingsRef = useMemo(() => {
    if (!listId) return undefined;
    return firestore
      .collection(FIRESTORE_ROUTES.CURATIONS.ROOT)
      .doc(listId)
      .collection(FIRESTORE_ROUTES.CURATIONS.SETTINGS.ROOT)
      .doc(FIRESTORE_ROUTES.CURATIONS.SETTINGS.DOC_ID);
  }, [listId]);

  const [rawList] = useDocumentData<ListWithId>(listRef, {
    idField: 'id',
  });

  const list = useMemo(
    () => (!!rawList ? serializeList(rawList) : prefetchData?.list),
    [prefetchData, rawList],
  );

  // const [rawListSettings] =
  //   useDocumentData<ListHistorianControlledSettings>(listSettingsRef);
  // const listSettings = useMemo(
  //   () => rawListSettings ?? prefetchData?.settings,
  //   [prefetchData, rawListSettings],
  // );

  const [currentHashesLength, setHashesLength] = useState(PAGE_SIZE);

  const loadMore = useCallback(async () => {
    setHashesLength((s) => s + PAGE_SIZE);
  }, []);

  const hashes = useMemo(
    () => list?.hashGroup?.[0].hashes.slice(0, currentHashesLength) ?? [],
    [list],
  );

  const filterSettings = useFilterSettings()?.filterSettings;

  const tokensReferences = useMemo(() => {
    return hashes.map((h) => {
      return firestore.collection(FIRESTORE_ROUTES.TOKENS.ROOT).doc(h);
    });
  }, [hashes]);

  const [prefetchDatas, setPrefetchDatas] = useState<TokenPrefetchData[]>([]);

  useEffect(() => {
    const fetchTokens = async () => {
      const snapshots = await Promise.all(tokensReferences.map((t) => t.get()));
      setPrefetchDatas(
        snapshots
          .map((s) => {
            if (!s.exists) return undefined;
            return {
              hash: s.id,
              metadata: serializeFirestoreToken(s.data()),
            };
          })
          .filter((s) => !!s) as TokenPrefetchData[],
      );
    };
    fetchTokens();
  }, [tokensReferences]);

  const filteredHashes = useMemo(() => {
    const activeFilterSettings = Object.values(filterSettings).filter(
      (f) => f.isActive,
    );

    if (activeFilterSettings.length === 0) {
      return hashes;
    }

    const pfd = hashes
      .map((h) => prefetchDatas.find((t) => t.hash === h))
      .filter((t) => !!t) as TokenPrefetchData[];
    return pfd
      .filter(({ metadata: t }) =>
        some(
          activeFilterSettings.map((f) =>
            f.getIsValidFirestoreToken(f as any, t as FirestoreToken),
          ),
        ),
      )
      .map((t) => t.hash);
  }, [hashes, prefetchDatas, filterSettings]);

  const hasMore = useMemo(
    () => hashes.length !== 0 && hashes.length % PAGE_SIZE === 0,
    [hashes],
  );

  const gridProps = useMemo(() => {
    return {
      loadMore,
      hasMore,
      hashes: filteredHashes,
    };
  }, [loadMore, hasMore, filteredHashes]);

  const clearSettings = useFilterSettings()?.clearSettings;

  return (
    <TokenPrefetchProvider prefetchDatas={prefetchDatas}>
      <ListHeader {...(list ?? {})} />
      <GridWithFilterContainer>
        {/* <MarketFilter
          priceFloor={priceFloor}
          priceFloorSymbol={priceFloorSymbol}
          numItems={numItems}
        /> */}
        <ListFilter numItems={filteredHashes?.length} />
        <FilterControls />
        {filteredHashes.length === 0 && (
          <EmptyGridState
            actionText="Clear filters"
            onActionClick={clearSettings}
          />
        )}
        {filteredHashes.length !== 0 && <InfiniteGrid {...gridProps} />}
      </GridWithFilterContainer>
    </TokenPrefetchProvider>
  );
};
