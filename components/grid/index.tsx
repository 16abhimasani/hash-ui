import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { BigNumber, utils } from 'ethers';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { ReactNode } from 'react-markdown';
import { animated, useSpring } from 'react-spring';
import useMeasure from 'react-use-measure';
import styled from 'styled-components';
import { fb } from '../../clients/firebase-app';
import { HEADER_HEIGHT } from '../../constants';
import {
  ALGOLIA_HASH_INDEX_BY_FILTER_SORT_BY,
  FilterSortBy,
  SingleSelectFilterSetting,
  TagsFilterSetting,
  useFilterSettings,
  useSettingsFilterSettings,
  useUpdateSettingFilterSettings,
} from '../../contexts/filterSettings';
import { useBreakPts } from '../../hooks/useBreakPts';
import { BREAKPTS } from '../../styles';
import { TagWithId } from '../../types/tag';
import { formatDecimalNumber } from '../../utils/string';
import {
  ActionDropdown,
  DropdownActionContainer,
  DropdownActionsListContainer,
  DropdownActionTitle,
} from '../actionsDropdown';
import { BaseButton, SecondaryButton } from '../button';
import { Flex, FlexCenter, FlexCenterColumn, FlexEnds } from '../flex';
import { CheckMarkIcon } from '../icons/checkMark';
import { ChevronDownIcon, ChevronUpIcon } from '../icons/chevron';
import { CloseIcon } from '../icons/close';
import { SelectedCheckMark } from '../icons/selectedCheckMark';
import { TextInput, TextInputContainer } from '../input';
import { TagContainer, Tags } from '../tag';
import { Text } from '../text';
import { GridItem, GRID_ROW_HEIGHT } from './items';

const GridWrapper = styled.div`
  overflow-y: auto;
`;

const GridContainer = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(
      0,
      1fr
    );
  /* grid-auto-rows: ${GRID_ROW_HEIGHT}px; */
  grid-gap: 40px;
  @media (max-width: ${BREAKPTS.MD}px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const GridStateContainer = styled(FlexCenterColumn)`
  margin: 200px 0;
  text-align: center;
`;

const StateText = styled(Text)`
  font-size: 14px;
`;

export const EmptyGridState: React.FC<{
  actionText?: string;
  onActionClick?: () => void;
  walletMode?: boolean;
}> = ({ actionText, onActionClick, walletMode }) => {
  const isFilterSettingsOpen = useFilterSettings()?.isFilterSettingsOpen;
  return (
    <GridStateContainer
      style={{ width: isFilterSettingsOpen ? '100%' : '100vw' }}
    >
      <StateText style={{ color: 'black', fontWeight: 'bold' }}>
        Nothing was found
      </StateText>
      <StateText style={{ width: 240, marginTop: 12, lineHeight: '20px' }}>
        {walletMode ? (
          <>We could not find any items for this wallet</>
        ) : (
          <>We could not find anything matching the criteria for this search</>
        )}
      </StateText>
      {!!onActionClick && (
        <SecondaryButton
          style={{ height: 'auto', padding: '16px 20px', marginTop: 12 }}
          onClick={onActionClick}
        >
          {actionText}
        </SecondaryButton>
      )}
    </GridStateContainer>
  );
};

export interface GridProps {
  hashes: string[];
}

export interface InfiniteGridProps extends GridProps {
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export const GRID_LOAD_MORE_PAGE_SIZE = 40;
export const COMMENTS_LOAD_MORE_PAGE_SIZE = 16;

// TODO: would be cool to show how many orders till a certain price floor
export const MEANINGFUL_ETH_PRICE_FLOORS = [
  utils.parseEther('0.02'),
  utils.parseEther('0.05'),
  utils.parseEther('0.1'),
  utils.parseEther('0.5'),
  utils.parseEther('0.8'),
  utils.parseEther('1'),
  utils.parseEther('2'),
  utils.parseEther('5'),
  utils.parseEther('8'),
  utils.parseEther('10'),
];

export const InfiniteGrid: FC<InfiniteGridProps> = ({
  hashes,
  loadMore,
  hasMore,
}) => {
  const [sentryRef, { rootRef }] = useInfiniteScroll({
    loading: false,
    hasNextPage: hasMore,
    onLoadMore: loadMore,
    rootMargin: '0px 0px 200px 0px',
  });

  const isFilterSettingsOpen = useFilterSettings()?.isFilterSettingsOpen;

  return (
    <GridWrapper
      ref={rootRef}
      style={{ gridColumn: isFilterSettingsOpen ? '2 / 3' : '1 / 3' }}
    >
      {hashes && (
        <GridContainer>
          {hashes.map((h, i) => {
            return <GridItem key={`grid-item-${h}`} hash={h} />;
          })}
        </GridContainer>
      )}
      {hasMore && <div ref={sentryRef}></div>}
    </GridWrapper>
  );
};

export const FILTER_HEIGHT = 80;
export const FILTER_CONTROLS_WIDTH = 350;

export const GridWithFilterContainer = styled.div`
  background-color: white;
  display: grid;
  grid-template-rows: ${FILTER_HEIGHT}px minmax(0, 1fr);
  grid-template-columns: ${FILTER_CONTROLS_WIDTH}px 1fr;
  max-height: calc(100vh - ${HEADER_HEIGHT}px);
  height: calc(100vh - ${HEADER_HEIGHT}px);
  position: relative;
`;

const FilterContainerRow = styled(FlexEnds)`
  height: 80px;
  padding: 0 20px;
  border-bottom: 1px solid #d9d9d9;
  grid-column: 1 / 3;
`;

const SortByButton = styled(BaseButton)<{ isOpen?: boolean }>`
  font-size: 14px;
  font-weight: bold;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  > svg {
    margin-left: 8px;
    width: 16px;
    height: 16px;
    transform: ${(p) => (p.isOpen ? 'rotate(0deg)' : 'rotate(180deg)')};
  }
`;

const StyledCheckMark = styled(CheckMarkIcon)`
  width: 16px;
  height: 16px;
`;

const SortByFilter: FC<{
  filterSortBy?: FilterSortBy;
  setFilterSortBy?: (s: FilterSortBy) => void;
}> = ({ setFilterSortBy, filterSortBy }) => {
  const prettierSortByLabel = useMemo(() => {
    return filterSortBy?.replace('-', ' ');
  }, [filterSortBy]);

  const button = (onClick: () => void, isOpen?: boolean) => (
    <SortByButton isOpen={isOpen} onClick={onClick}>
      {prettierSortByLabel}
      <ChevronDownIcon />
    </SortByButton>
  );

  if (!filterSortBy) {
    return null;
  }

  return (
    <ActionDropdown enable={true} button={button} dropdownWidth={200}>
      {(onClick: () => void) => {
        return (
          <DropdownActionsListContainer>
            {Object.keys(ALGOLIA_HASH_INDEX_BY_FILTER_SORT_BY).map((t) => {
              return (
                <DropdownActionContainer
                  key={`sort-by-hash-index-${t}`}
                  onClick={() => {
                    if (filterSortBy !== t) {
                      onClick();
                      setFilterSortBy?.(t as FilterSortBy);
                    }
                  }}
                >
                  <FlexEnds>
                    <DropdownActionTitle
                      key={`filter-sort-by-toggle-option-${t}`}
                    >
                      {t.replace('-', ' ')}
                    </DropdownActionTitle>
                    {filterSortBy === t && <StyledCheckMark />}
                  </FlexEnds>
                </DropdownActionContainer>
              );
            })}
          </DropdownActionsListContainer>
        );
      }}
    </ActionDropdown>
  );
};

const FilterControlsContainer = styled.div`
  padding: 20px 40px 0px 20px;
  overflow-y: scroll;
`;

const BottomFilterControlsContainer = styled.div`
  position: sticky;
  z-index: 1;
  bottom: 0px;
  right: 20px;
  left: 20px;
  border-top: 1px solid #d9d9d9;
  background: white;
`;

const BottomFilterControlsButton = styled(BaseButton)`
  width: 100%;
  height: 60px;
  font-size: 14px;
  font-weight: bold;
  :disabled {
    cursor: not-allowed;
  }
`;

export interface FilterDropdownProps {
  title: string;
  children?: ReactNode;
  defaultIsExpanded?: boolean;
}

const FilterDropdownContainer = styled.div`
  position: relative;
  border-bottom: 1px solid #d9d9d9;
`;

const FilterAlwaysShowContainer = styled(FlexEnds)`
  cursor: pointer;
  padding: 20px 0px;
  > svg {
    width: 18px;
    height: 18px;
  }
`;

const FilterDropdownTitle = styled.p`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  text-transform: capitalize;
  color: black;
  padding: 0;
  margin: 0;
`;

const FilterExpandoAbsoluteContainer = styled.div`
  position: absolute;
  width: 100%;
`;

const FilterExpandoContainer = styled(animated.div)`
  position: relative;
  will-change: transform, opacity, height;
  overflow: hidden;
`;

const FilterExpandoContent = styled.div`
  padding: 0 0 20px 0;
  width: 100%;
`;

export const FilterDropdown: FC<FilterDropdownProps> = ({
  title,
  children,
  defaultIsExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultIsExpanded);
  const [expandoContentRef, expandoContentBounds] = useMeasure();

  const { height, opacity } = useSpring({
    from: { height: 0, opacity: 0 },
    to: {
      height: isExpanded ? expandoContentBounds.height : 0,
      opacity: isExpanded ? 1 : 0,
    },
  });

  return (
    <FilterDropdownContainer>
      <FilterAlwaysShowContainer onClick={() => setIsExpanded((s) => !s)}>
        <FilterDropdownTitle>{title}</FilterDropdownTitle>
        {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </FilterAlwaysShowContainer>
      <FilterExpandoContainer style={{ opacity, height }}>
        <FilterExpandoAbsoluteContainer ref={expandoContentRef as any}>
          <FilterExpandoContent>{children}</FilterExpandoContent>
        </FilterExpandoAbsoluteContainer>
      </FilterExpandoContainer>
    </FilterDropdownContainer>
  );
};

const FilterPill = styled(TagContainer)<{ isActive?: boolean }>`
  margin-top: 10px;
  color: ${(p) => (p.isActive ? 'black' : 'rgba(0, 0, 0, 0.4)')};
  border: ${(p) =>
    p.isActive
      ? '1px solid rgba(17, 10, 10, 1)'
      : '1px solid rgba(17, 10, 10, 0.2)'};
  transition: all 150ms ease-in-out;
  :hover {
    color: black;
    border-color: black;
    background-color: rgba(0, 0, 0, 0.05);
    transform: scale(1.025);
  }
`;

const MultiSelectFilterIconContainer = styled.div<{ isActive?: boolean }>`
  /* background-color: ${(p) => (p.isActive ? 'black' : 'rgba(0, 0, 0, 0)')}; */
  box-sizing: border-box;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  > svg {
    border: ${(p) =>
      p.isActive
        ? '1px solid rgba(0,0,0,0)'
        : '1px solid rgba(17, 10, 10, 0.2)'};
    border-radius: 999px;
    width: 14px;
    height: 14px;
    * {
      fill: ${(p) => (p.isActive ? 'black' : 'white')};
    }
  }
`;

const MultiSelectFilterPill = styled(FilterPill)`
  display: flex;
  align-items: center;
  padding: 10px 16px 10px 12px;
  > ${MultiSelectFilterIconContainer} {
    margin-right: 6px;
  }
`;

const SingleSelectFilter: FC<SingleSelectFilterSetting & { id: string }> = ({
  isDefaultOpen,
  isActive,
  id,
  label,
  options,
  optionLabels,
  selectedOption,
}) => {
  const updateFilterSetting = useUpdateSettingFilterSettings();

  const handleOptionClick = useCallback(
    (o: string) => {
      if (o === selectedOption && isActive) {
        updateFilterSetting?.(id, { isActive: false });
      } else {
        updateFilterSetting?.(id, { isActive: true, selectedOption: o });
      }
    },
    [updateFilterSetting, isActive, selectedOption],
  );

  return (
    <FilterDropdown defaultIsExpanded={isDefaultOpen} title={label}>
      <Tags style={{ padding: '0 2px' }}>
        {options.map((o, i) => {
          return (
            <FilterPill
              key={`filter-pill-${o}-${i}`}
              isActive={isActive && selectedOption === o}
              onClick={() => handleOptionClick(o)}
            >
              {optionLabels?.[i] ?? o}
            </FilterPill>
          );
        })}
      </Tags>
    </FilterDropdown>
  );
};

const TagsFilter: FC<TagsFilterSetting & { id: string }> = ({
  isDefaultOpen,
  selectedTags,
  isActive,
  id,
  label,
}) => {
  const updateFilterSetting = useUpdateSettingFilterSettings();

  const [searchTagTerm, setSearchTagTerm] = useState('');

  const tagsRef = useMemo(() => {
    return fb.firestore().collection(FIRESTORE_ROUTES.TAGS);
  }, []);
  const [tags] = useCollectionData<TagWithId>(tagsRef, {
    idField: 'id',
  });
  const prunedTags = useMemo(
    () =>
      tags
        ?.filter(
          (t) =>
            searchTagTerm === '' ||
            t.key.toLowerCase().includes(searchTagTerm.toLowerCase()),
        )
        .sort((a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity)),
    [tags, searchTagTerm],
  );

  const handleOptionClick = useCallback(
    (o: string) => {
      if (selectedTags?.includes(o) && isActive) {
        updateFilterSetting?.(id, {
          isActive: selectedTags?.length !== 1,
          selectedTags: selectedTags?.filter((t) => t !== o),
        });
      } else {
        updateFilterSetting?.(id, {
          isActive: true,
          selectedTags: isActive ? selectedTags?.concat(o) : [o],
        });
      }
    },
    [updateFilterSetting, isActive, selectedTags],
  );

  return (
    <FilterDropdown defaultIsExpanded={isDefaultOpen} title={label}>
      <TextInputContainer style={{ padding: '10px 10px' }}>
        <TextInput
          onChange={(e) => setSearchTagTerm(e.target.value)}
          placeholder={'Search tags...'}
        />
      </TextInputContainer>
      <Tags style={{ padding: '0 2px', marginTop: 12 }}>
        {prunedTags?.map((o, i) => {
          const isSelected = isActive && selectedTags?.includes(o.key);
          return (
            <MultiSelectFilterPill
              key={`multi-select-filter-pill-${id}-${i}`}
              isActive={isSelected}
              onClick={() => handleOptionClick(o.key)}
            >
              <MultiSelectFilterIconContainer isActive={isSelected}>
                <SelectedCheckMark />
              </MultiSelectFilterIconContainer>
              {o.key}
            </MultiSelectFilterPill>
          );
        })}
      </Tags>
    </FilterDropdown>
  );
};

export const FilterControls: FC = () => {
  const filterSettings = useSettingsFilterSettings();

  const numActiveFilterSettings = useFilterSettings()?.numActiveFilterSettings;
  const clearSettings = useFilterSettings()?.clearSettings;
  const isFilterSettingsOpen = useFilterSettings()?.isFilterSettingsOpen;
  return (
    <FilterControlsContainer
      style={{ display: isFilterSettingsOpen ? 'block' : 'none' }}
    >
      {!!filterSettings &&
        Object.entries(filterSettings).map(([id, fs]) => {
          if (fs.type === 'single-select-filter') {
            return (
              <SingleSelectFilter
                key={`single-select-filter-${id}`}
                id={id}
                {...(fs as SingleSelectFilterSetting)}
              />
            );
          }
          if (fs.type === 'tags-filter') {
            return (
              <TagsFilter
                key={`tags-filter-${id}`}
                id={id}
                {...(fs as TagsFilterSetting)}
              />
            );
          }
          return null;
        })}
      <BottomFilterControlsContainer>
        <BottomFilterControlsButton
          onClick={clearSettings}
          disabled={numActiveFilterSettings === 0}
        >
          Clear filters
        </BottomFilterControlsButton>
      </BottomFilterControlsContainer>
    </FilterControlsContainer>
  );
};

const FilterToggle = styled(SecondaryButton)<{ isOpen?: boolean }>`
  position: relative;
  border-radius: 999px;
  height: auto;
  font-size: 14px;
  text-transform: capitalize;
  padding: 14px 18px 14px 10px;
  height: 36px;
  display: flex;
  align-items: center;
  > svg {
    width: 16px;
    height: 16px;
    transform: rotate(-90deg);
  }
`;

const FilterActiveIndicator = styled(FlexCenter)`
  height: 20px;
  width: 20px;
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: black;
  color: white;
  font-size: 10px;
  line-height: 10px;
  border-radius: 999px;
`;

const ActiveFiltersContainer = styled(Flex)`
  max-width: 400px;
  margin-left: 14px;
`;

const ClosableFilterPill = styled(FilterPill)`
  display: flex;
  align-items: center;
  padding: 11px 12px 9px 16px;
  border-color: black;
  color: black;
  margin-top: 0;
  height: 34px;
  font-size: 12px;
  line-height: 12px;
  > svg {
    margin-left: 6px;
    width: 12px;
    height: 12px;
  }
  /* > ${MultiSelectFilterIconContainer} {
    margin-right: 6px;
  } */
`;

export const FilterLeftSide: FC<{
  numItems?: number;
  priceFloor?: BigNumber;
  priceFloorSymbol?: string;
}> = ({ numItems, priceFloor, priceFloorSymbol }) => {
  const isFilterSettingsOpen = useFilterSettings()?.isFilterSettingsOpen;
  const setIsFilterSettingsOpen = useFilterSettings()?.setIsFilterSettingsOpen;
  const numActiveFilterSettings = useFilterSettings()?.numActiveFilterSettings;
  const filterSettings = useSettingsFilterSettings();
  const updateFilterSetting = useFilterSettings()?.updateFilterSetting;
  const activeFilterSettings = useMemo(
    () =>
      !!filterSettings
        ? Object.entries(filterSettings).filter((s) => s[1].isActive)
        : undefined,
    [filterSettings],
  );

  const breakPoint = useBreakPts();
  useEffect(() => {
    if (breakPoint == 'LG' || breakPoint == 'MD' || breakPoint == 'SM') {
      setIsFilterSettingsOpen?.(() => false);
    }
  }, [breakPoint, setIsFilterSettingsOpen]);

  return (
    <Flex>
      <FilterToggle
        isOpen={isFilterSettingsOpen}
        onClick={() => setIsFilterSettingsOpen?.((s) => !s)}
      >
        {isFilterSettingsOpen && <ChevronDownIcon />}
        <span style={{ marginLeft: 4 }}>Filters</span>
        {numActiveFilterSettings !== 0 && (
          <FilterActiveIndicator>
            {numActiveFilterSettings}
          </FilterActiveIndicator>
        )}
      </FilterToggle>
      {!!activeFilterSettings && activeFilterSettings.length !== 0 && (
        <ActiveFiltersContainer>
          {Object.entries(filterSettings)
            .filter((s) => s[1].isActive)
            .map(([id, fs]) => {
              const onClick = () =>
                updateFilterSetting?.(id, { isActive: false });

              if (fs.type === 'single-select-filter') {
                return (
                  <ClosableFilterPill
                    onClick={onClick}
                    key={`closable-filter-pill-${id}`}
                  >
                    {fs.selectedOption}
                    <CloseIcon />
                  </ClosableFilterPill>
                );
              }
              if (fs.type === 'tags-filter') {
                return (
                  <ClosableFilterPill
                    onClick={onClick}
                    key={`closable-filter-pill-${id}`}
                  >
                    {fs.selectedTags.length} tags
                    <CloseIcon />
                  </ClosableFilterPill>
                );
              }
              return null;
            })}
        </ActiveFiltersContainer>
      )}
      {numItems != undefined && (
        <Text style={{ fontSize: 14, marginLeft: 14 }}>
          {numItems} item{numItems === 1 ? '' : 's'}
        </Text>
      )}
      {!!priceFloor && (
        <Text style={{ fontSize: 14, marginLeft: 14 }}>
          Price floor: {formatDecimalNumber(utils.formatEther(priceFloor))}{' '}
          {priceFloorSymbol}
        </Text>
      )}
    </Flex>
  );
};

export const GridFilter: FC<{
  numItems?: number;
  priceFloor?: BigNumber;
  priceFloorSymbol?: string;
}> = ({ numItems, priceFloor, priceFloorSymbol }) => {
  const filterSortBy = useFilterSettings()?.filterSortBy;
  const setFilterSortBy = useFilterSettings()?.setFilterSortBy;
  return (
    <FilterContainerRow>
      <FilterLeftSide
        numItems={numItems}
        priceFloor={priceFloor}
        priceFloorSymbol={priceFloorSymbol}
      />
      <SortByFilter
        filterSortBy={filterSortBy}
        setFilterSortBy={setFilterSortBy}
      />
    </FilterContainerRow>
  );
};

export const ListFilter: FC<{
  numItems?: number;
}> = ({ numItems }) => {
  return (
    <FilterContainerRow>
      <FilterLeftSide numItems={numItems} />
      {/* <SortByFilter
        filterSortBy={filterSortBy}
        setFilterSortBy={setFilterSortBy}
      /> */}
      <SortByButton disabled>Manually sorted</SortByButton>
    </FilterContainerRow>
  );
};
