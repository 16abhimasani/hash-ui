import { SEASON_TO_NUM, V2_SEASONS } from '@hash/seasons';
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ALGOLIA_HASH_INDEX } from '../constants';
import { FirestoreToken } from '../types/metadata';
import { OrderStatus, TradeDirection } from '../types/trader';
import { lowerCaseCheck } from '../utils/string';

export const ALGOLIA_HASH_INDEX_BY_FILTER_SORT_BY = {
  'recently-active': 'hash-tokens-recently-active',
  'recently-sold': 'hash-tokens-recently-sold',
  'price-low-high': 'hash-tokens-price-low-high',
  'price-high-low': 'hash-tokens-price-high-low',
  'recently-minted': ALGOLIA_HASH_INDEX,
};

export type FilterSortBy =
  | 'recently-active'
  | 'recently-sold'
  | 'price-low-high'
  | 'price-high-low'
  | 'recently-minted';

interface FilterSettingBase {
  type: string;
  label: string;
  isActive: boolean;
  isDefaultOpen?: boolean;
}

export interface SingleSelectFilterSetting extends FilterSettingBase {
  type: 'single-select-filter';
  options: string[];
  optionLabels?: string[];
  selectedOption?: string;
  getFilterString: (f: SingleSelectFilterSetting) => string | undefined;
  getIsValidFirestoreToken: (
    f: SingleSelectFilterSetting,
    t: FirestoreToken,
  ) => boolean;
}

export interface TagsFilterSetting extends FilterSettingBase {
  type: 'tags-filter';
  selectedTags: string[];
  getFilterString: (f: TagsFilterSetting) => string | undefined;
  getIsValidFirestoreToken: (
    f: TagsFilterSetting,
    t: FirestoreToken,
  ) => boolean;
}

export type FilterSetting = TagsFilterSetting | SingleSelectFilterSetting;

export interface FilterSettingsProviderContext {
  isFilterSettingsOpen: boolean;
  setIsFilterSettingsOpen?: Dispatch<SetStateAction<boolean>>;
  filterSortBy: FilterSortBy;
  filterSettings: { [key: string]: FilterSetting };
  setFilterSortBy?: Dispatch<SetStateAction<FilterSortBy>>;
  numActiveFilterSettings: number;
  clearSettings: () => void;
  updateFilterSetting?: (
    filterKey: string,
    updates: Partial<Exclude<Exclude<FilterSetting, 'type'>, 'label'>>,
  ) => void;
}

export type FilterSettingsProviderState = FilterSettingsProviderContext;

const initialState: FilterSettingsProviderState = {
  filterSortBy: 'recently-active',
  numActiveFilterSettings: 0,
  clearSettings: () => {},
  isFilterSettingsOpen: true,
  filterSettings: {
    status: {
      type: 'single-select-filter',
      label: 'Status',
      isActive: false,
      options: ['offers', 'selling', 'sold'],
      getFilterString: (f: SingleSelectFilterSetting) => {
        if (f.selectedOption === 'offers') {
          return `bestOrderToDisplay.orderStatus:${OrderStatus.Fillable} AND bestOrderToDisplay.direction:${TradeDirection.BuyNFT}`;
        }
        if (f.selectedOption === 'selling') {
          return `bestOrderToDisplay.orderStatus:${OrderStatus.Fillable}`;
        }
        if (f.selectedOption === 'sold') {
          return `bestOrderToDisplay.orderStatus:${OrderStatus.Unfillable} AND bestOrderToDisplay.isFilled:true`;
        }
        return undefined;
      },
      getIsValidFirestoreToken: (
        f: SingleSelectFilterSetting,
        t: FirestoreToken,
      ) => {
        if (f.selectedOption === 'offers') {
          return (
            t.bestOrderToDisplay?.orderStatus === OrderStatus.Fillable &&
            t?.bestOrderToDisplay?.direction === TradeDirection.BuyNFT
          );
        }
        if (f.selectedOption === 'selling') {
          return t.bestOrderToDisplay?.orderStatus === OrderStatus.Fillable;
        }
        if (f.selectedOption === 'sold') {
          return (
            t.bestOrderToDisplay?.orderStatus === OrderStatus.Unfillable &&
            t.bestOrderToDisplay.isFilled
          );
        }
        return false;
      },
    },
    season: {
      type: 'single-select-filter',
      label: 'Season',
      isActive: false,
      options: Object.keys(SEASON_TO_NUM),
      getFilterString: (f: SingleSelectFilterSetting) => {
        if (!f.selectedOption) {
          return undefined;
        }
        if (V2_SEASONS.includes(f.selectedOption)) {
          return `metadata.properties.season.value:${f.selectedOption}`;
        } else {
          return [f.selectedOption].map((t) => `tags:${t}`).join(' AND ');
        }
      },
      getIsValidFirestoreToken: (
        f: SingleSelectFilterSetting,
        t: FirestoreToken,
      ) => {
        if (!f.selectedOption) {
          return false;
        }
        return lowerCaseCheck(
          t.metadata?.properties?.season?.value,
          f.selectedOption,
        );
      },
    },
    tags: {
      type: 'tags-filter',
      label: 'Tags',
      isActive: false,
      isDefaultOpen: false,
      selectedTags: [],
      getFilterString: (f: TagsFilterSetting) => {
        if (f.selectedTags.length === 0) {
          return undefined;
        }
        return f.selectedTags.map((t) => `tags:${t}`).join(' AND ');
      },
      getIsValidFirestoreToken: (f: TagsFilterSetting, t: FirestoreToken) => {
        if (f.selectedTags.length === 0 || !t.tags) {
          return false;
        }
        console.log(f.selectedTags, t.tags);
        for (const tag of f.selectedTags) {
          console.log('tag', tag);
          if (!t.tags.includes(tag)) {
            return false;
          }
        }
        return true;
      },
    },
    // season: {
    //   type: 'single-select-filter',
    //   label: 'Season',
    // },
    // verdict: {
    //   type: 'single-select-filter',
    //   label: 'Verdict status',
    // },
  },
};

const FilterSettingsContext =
  createContext<FilterSettingsProviderState>(initialState);

export interface FilterSettingProviderProps {
  initialFilterSortBy?: FilterSortBy;
  initialIsFilterSettingsOpen?: boolean;
}

export const FilterSettingProvider: React.FC<FilterSettingProviderProps> = ({
  initialFilterSortBy,
  initialIsFilterSettingsOpen,
  children,
}) => {
  const [filterSortBy, setFilterSortBy] = useState(
    initialFilterSortBy ?? initialState.filterSortBy,
  );
  const [filterSettings, setFilterSettings] = useState(
    initialState.filterSettings,
  );
  const [isFilterSettingsOpen, setIsFilterSettingsOpen] = useState(
    initialIsFilterSettingsOpen ?? initialState.isFilterSettingsOpen,
  );

  const updateFilterSetting = useCallback(
    (
      filterKey: string,
      updates: Partial<Exclude<Exclude<FilterSetting, 'type'>, 'label'>>,
    ) => {
      setFilterSettings((s) => {
        if (!s[filterKey]) {
          return s;
        }
        return { ...s, [filterKey]: { ...s[filterKey], ...updates } } as {
          [key: string]: FilterSetting;
        };
      });
    },
    [],
  );

  const numActiveFilterSettings = useMemo(
    () =>
      Object.values(filterSettings).reduce(
        (a, c) => (c.isActive ? a + 1 : a),
        0,
      ),
    [filterSettings],
  );

  const clearSettings = useCallback(() => {
    setFilterSettings(initialState.filterSettings);
  }, []);

  const stateObject = useMemo(() => {
    return {
      filterSortBy,
      filterSettings,
      setFilterSortBy,
      updateFilterSetting,
      isFilterSettingsOpen,
      setIsFilterSettingsOpen,
      numActiveFilterSettings,
      clearSettings,
    };
  }, [
    filterSortBy,
    numActiveFilterSettings,
    isFilterSettingsOpen,
    filterSettings,
  ]);

  return (
    <FilterSettingsContext.Provider value={stateObject}>
      {children}
    </FilterSettingsContext.Provider>
  );
};

export const useFilterSettings = (): FilterSettingsProviderState => {
  return useContext(FilterSettingsContext);
};

export const useSettingsFilterSettings = () => {
  return useContext(FilterSettingsContext)?.filterSettings;
};

export const useUpdateSettingFilterSettings = () => {
  return useContext(FilterSettingsContext)?.updateFilterSetting;
};

export const useSortByFilterSettings = () => {
  return useContext(FilterSettingsContext)?.filterSortBy;
};

export const useSetSortByFilterSettings = () => {
  return useContext(FilterSettingsContext)?.setFilterSortBy;
};
