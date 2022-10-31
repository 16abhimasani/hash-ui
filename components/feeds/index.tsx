import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useSaveByByContext } from '../../contexts/token';
import {
  ActionDropdown,
  DropdownActionContainer,
  DropdownActionsListContainer,
  DropdownActionTitle,
} from '../actionsDropdown';
import { BaseButton } from '../button';
import { FlexEnds } from '../flex';
import { CheckMarkIcon } from '../icons/checkMark';
import { ChevronDownIcon } from '../icons/chevron';
import { MiddotSpan, Tab, TabsContainer, TabsGroup } from '../tabs';
import { DiscussionFeed } from './discussion';
import { SaveFeed } from './saved';

export type FeedsSortByFilter = 'newest';

export type FeedTab = 'discussion' | 'curation' | 'save';

const StyledTabsContainer = styled(TabsContainer)`
  padding: 0 20px;
  justify-content: space-between;
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
  width: 14px;
  height: 14px;
`;

const SortByFilter: FC<{
  filterSortBy?: FeedsSortByFilter;
  setFilterSortBy?: (s: FeedsSortByFilter) => void;
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
            {(['newest'] as FeedsSortByFilter[]).map((t) => {
              return (
                <DropdownActionContainer
                  key={`sort-by-hash-feeds-index-${t}`}
                  onClick={() => {
                    if (filterSortBy !== t) {
                      onClick();
                      setFilterSortBy?.(t as FeedsSortByFilter);
                    }
                  }}
                >
                  <FlexEnds>
                    <DropdownActionTitle
                      style={{ fontSize: 14 }}
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

export const Feeds: FC = () => {
  const [feedTab, setFeedTab] = useState<FeedTab>('discussion');
  const [filterSortBy, setFilterSortBy] = useState<FeedsSortByFilter>('newest');
  const saveBy = useSaveByByContext();
  return (
    <>
      <StyledTabsContainer>
        <TabsGroup>
          <Tab
            isActive={feedTab === 'discussion'}
            onClick={() => setFeedTab('discussion')}
          >
            Discussions <MiddotSpan>&middot;</MiddotSpan> 1
          </Tab>
          {/* <Tab
            isActive={feedTab === 'curation'}
            onClick={() => setFeedTab('curation')}
          >
            Curations <MiddotSpan>&middot;</MiddotSpan> 1
          </Tab> */}
          <Tab isActive={feedTab === 'save'} onClick={() => setFeedTab('save')}>
            Saves <MiddotSpan>&middot;</MiddotSpan> {saveBy?.length ?? '-'}
          </Tab>
        </TabsGroup>
        {/* <SortByFilter
          setFilterSortBy={setFilterSortBy}
          filterSortBy={filterSortBy}
        /> */}
      </StyledTabsContainer>
      {feedTab === 'save' && <SaveFeed />}
      {feedTab === 'discussion' && <DiscussionFeed />}
      {/* <div style={{ padding: 20 }}>
        <NftEmbed
          address={'0x7645eec8bb51862a5aa855c40971b2877dae81af'}
          id={'7833'}
        />
      </div> */}
    </>
  );
};
