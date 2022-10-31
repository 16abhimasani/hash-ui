import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  EmptyGridState,
  FilterControls,
  GridFilter,
  GridWithFilterContainer,
  GRID_LOAD_MORE_PAGE_SIZE,
  InfiniteGrid,
} from '.';
import { algoliaClient } from '../../clients/algolia';
import {
  ALGOLIA_HASH_INDEX_BY_FILTER_SORT_BY,
  FilterSettingProvider,
  useFilterSettings,
} from '../../contexts/filterSettings';
import {
  TokenPrefetchData,
  TokenPrefetchProvider,
} from '../../contexts/tokenPrefetch';
import { useHashOwned } from '../../hooks/useHashOwned';
import { UserFeedGridProps, UserFeedTabs } from '../user/feed';

export const OwnedGrid: FC<UserFeedGridProps> = ({
  account,
  setTotalCount,
}) => {
  return (
    <FilterSettingProvider>
      <OwnedGridInner account={account} setTotalCount={setTotalCount} />
    </FilterSettingProvider>
  );
};

const OwnedGridInner: FC<UserFeedGridProps> = ({ account, setTotalCount }) => {
  const allHashOwned = useHashOwned(account);

  const [pages, setPages] = useState<{ [n: number]: any[] }>({});
  const [hashes, setHashes] = useState<string[]>([]);
  const [prefetchDatas, setPrefetchDatas] = useState<TokenPrefetchData[]>([]);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [numItems, setNumItems] = useState<number | undefined>(undefined);

  const filterSortBy = useFilterSettings()?.filterSortBy;
  const filterSettings = useFilterSettings()?.filterSettings;
  const setIsFilterSettingsOpen = useFilterSettings()?.setIsFilterSettingsOpen;
  const filterActive = useMemo(() => {
    return Object.values(filterSettings).some((s) => s.isActive);
  }, [filterSettings]);
  const hashOwnedFilterString = useMemo(() => {
    if (!allHashOwned) {
      return 'objectID:0';
    }
    return allHashOwned.map((tx) => `objectID:${tx}`).join(' OR ');
  }, [allHashOwned]);
  const filterString = useMemo(() => {
    const filterComponents = Object.values(filterSettings)
      .filter((s) => s.isActive)
      .map((s) => s.getFilterString(s as any))
      .filter((s) => !!s)
      .map((s) => `(${s})`);
    return [hashOwnedFilterString, 'isMinted: true', ...filterComponents].join(
      ' AND ',
    );
  }, [filterSettings, hashOwnedFilterString]);

  const loadMore = useCallback(async () => {
    setPageIndex((i) => i + 1);
  }, []);
  const hasMore = useMemo(
    () =>
      hashes?.length !== 0 && hashes?.length % GRID_LOAD_MORE_PAGE_SIZE === 0,
    [hashes],
  );
  const gridProps = useMemo(() => {
    return {
      loadMore,
      hasMore,
      hashes,
    };
  }, [loadMore, hasMore, hashes]);
  const clearSettings = useFilterSettings()?.clearSettings;

  useEffect(() => {
    setPageIndex(0);
    setNumItems(undefined);
    setPages({});
  }, [filterSortBy, filterSettings, account]);

  useEffect(() => {
    if (!filterSortBy || !allHashOwned) {
      return;
    }

    const loadPages = async () => {
      for (let i = 0; i <= pageIndex; ++i) {
        if (!!pages[i]) {
          continue;
        }
        const { results } = await algoliaClient.search([
          {
            indexName: ALGOLIA_HASH_INDEX_BY_FILTER_SORT_BY[filterSortBy],
            params: {
              hitsPerPage: GRID_LOAD_MORE_PAGE_SIZE,
              page: pageIndex,
              filters: filterString,
            },
          },
        ]);
        const hits = results[0].hits;
        setNumItems(results[0].nbHits);
        setPages((p) => ({ ...p, [i]: hits }));
      }
    };
    loadPages();
  }, [pages, pageIndex, filterSortBy, filterString]);

  useEffect(() => {
    let tokenMetadatas: any[] = [];
    for (let i = 0; i <= pageIndex; ++i) {
      if (!!pages[i]) {
        tokenMetadatas = tokenMetadatas.concat(pages[i]);
      } else {
        return;
      }
    }
    setPrefetchDatas(
      tokenMetadatas.map((p) => ({ hash: p.objectID, metadata: p })),
    );
    setHashes(tokenMetadatas.map((p) => p.objectID));
  }, [pageIndex, pages]);

  useEffect(() => {
    setTotalCount((prevState) => ({
      ...(prevState ?? {}),
      [UserFeedTabs.OWNED]: allHashOwned?.length ?? numItems ?? '?',
    }));
  }, [allHashOwned, numItems]);

  useEffect(() => {
    setIsFilterSettingsOpen?.((s) => false);
  }, [setIsFilterSettingsOpen]);

  return (
    <TokenPrefetchProvider prefetchDatas={prefetchDatas}>
      <GridWithFilterContainer>
        <GridFilter numItems={numItems} />
        <FilterControls />
        {hashes.length === 0 && (
          <>
            {filterActive ? (
              <EmptyGridState
                actionText="Clear filters"
                onActionClick={clearSettings}
              />
            ) : (
              <EmptyGridState walletMode />
            )}
          </>
        )}
        {hashes.length !== 0 && <InfiniteGrid {...gridProps} />}
      </GridWithFilterContainer>
    </TokenPrefetchProvider>
  );
};
