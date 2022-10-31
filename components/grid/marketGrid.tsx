import { BigNumber } from 'ethers';
import invert from 'lodash/invert';
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
import { TRADABLE_ASSETS } from '../../constants';
import {
  ALGOLIA_HASH_INDEX_BY_FILTER_SORT_BY,
  FilterSettingProvider,
  useFilterSettings,
  useUpdateSettingFilterSettings,
} from '../../contexts/filterSettings';
import {
  TokenPrefetchData,
  TokenPrefetchProvider,
} from '../../contexts/tokenPrefetch';
import {
  OrderStatus,
  SignedOrderWithCidAndOrderStatus,
  TradeDirection,
} from '../../types/trader';
import { getTotalErc20AmountInOrder } from '../../utils/trader';

export const MarketGrid: FC<{
  defaultTags?: string[];
  defaultSeasons?: string[];
}> = ({ defaultTags, defaultSeasons }) => {
  return (
    <FilterSettingProvider>
      <MarketGridInner
        defaultTags={defaultTags}
        defaultSeasons={defaultSeasons}
      />
    </FilterSettingProvider>
  );
};

const MarketGridInner: FC<{
  defaultTags?: string[];
  defaultSeasons?: string[];
}> = ({ defaultSeasons, defaultTags }) => {
  const [pages, setPages] = useState<{ [n: number]: any[] }>({});
  const [hashes, setHashes] = useState<string[]>([]);
  const [prefetchDatas, setPrefetchDatas] = useState<TokenPrefetchData[]>([]);
  const [priceFloor, setPriceFloor] = useState<BigNumber | undefined>(
    undefined,
  );
  const [priceFloorSymbol, setPriceFloorSymbol] = useState<string | undefined>(
    undefined,
  );

  const [pageIndex, setPageIndex] = useState<number>(0);
  const [numItems, setNumItems] = useState<number | undefined>(undefined);

  const filterSortBy = useFilterSettings()?.filterSortBy;
  const filterSettings = useFilterSettings()?.filterSettings;
  const updateFilterSetting = useUpdateSettingFilterSettings();

  useEffect(() => {
    if (!!defaultTags) {
      updateFilterSetting?.('tags', {
        isActive: defaultTags.length !== 0,
        selectedTags: defaultTags,
      });
    }
    if (!!defaultSeasons?.[0]) {
      updateFilterSetting?.('season', {
        isActive: true,
        selectedOption: defaultSeasons[0],
      });
    }
  }, [defaultSeasons, defaultTags]);

  const loadMore = useCallback(async () => {
    setPageIndex((i) => i + 1);
  }, []);

  const filterString = useMemo(() => {
    const filterComponents = Object.values(filterSettings)
      .filter((s) => s.isActive)
      .map((s) => s.getFilterString(s as any))
      .filter((s) => !!s)
      .map((s) => `(${s})`);
    return ['isMinted: true', ...filterComponents].join(' AND ');
  }, [filterSettings]);

  useEffect(() => {
    if (!filterSortBy) {
      return;
    }
    if (!ALGOLIA_HASH_INDEX_BY_FILTER_SORT_BY[filterSortBy]) {
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
    const getPriceFloorHash = async () => {
      const { results } = await algoliaClient.search([
        {
          indexName: ALGOLIA_HASH_INDEX_BY_FILTER_SORT_BY['price-low-high'],
          params: {
            hitsPerPage: 1,
            page: 0,
            filters: `bestOrderToDisplay.orderStatus:${
              OrderStatus.Fillable
            } AND bestOrderToDisplay.direction:${TradeDirection.SellNFT}${
              filterString.length !== 0 ? ' AND ' : ''
            }${filterString}`,
          },
        },
      ]);
      if (!!results[0].hits[0]) {
        const bestOrder = (results[0].hits[0] as any)
          .bestOrderToDisplay as SignedOrderWithCidAndOrderStatus;
        setPriceFloor(getTotalErc20AmountInOrder(bestOrder));
        setPriceFloorSymbol(invert(TRADABLE_ASSETS)[bestOrder.erc20Token]);
      }
    };

    getPriceFloorHash();
  }, [filterString]);

  useEffect(() => {
    setPageIndex(0);
    setNumItems(undefined);
    setPages({});
    setPriceFloor(undefined);
    setPriceFloorSymbol(undefined);
  }, [filterSortBy, filterSettings]);

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

  const hasMore = useMemo(
    () => hashes.length !== 0 && hashes.length % GRID_LOAD_MORE_PAGE_SIZE === 0,
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

  return (
    <TokenPrefetchProvider prefetchDatas={prefetchDatas}>
      <GridWithFilterContainer>
        <GridFilter
          priceFloor={priceFloor}
          priceFloorSymbol={priceFloorSymbol}
          numItems={numItems}
        />
        <FilterControls />
        {hashes.length === 0 && (
          <EmptyGridState
            actionText="Clear filters"
            onActionClick={clearSettings}
          />
        )}
        {hashes.length !== 0 && <InfiniteGrid {...gridProps} />}
      </GridWithFilterContainer>
    </TokenPrefetchProvider>
  );
};
