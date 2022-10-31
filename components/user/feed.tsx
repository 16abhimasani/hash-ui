import { useRouter } from 'next/router';
import { FC, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ROUTES } from '../../constants/routes';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { CommentsGrid } from '../grid/commentsGrid';
import { MintedGrid } from '../grid/mintedGrid';
import { OwnedGrid } from '../grid/ownedGrid';
import { SavesGrid } from '../grid/savesGrid';
import { MiddotSpan, Tab, TabsContainer, TabsGroup } from '../tabs';

export enum UserFeedTabs {
  OWNED = 'owned',
  MINTS = 'mints',
  COMMENTS = 'comments',
  SAVES = 'saves',
}
export type UserFeedCount = {
  [key in UserFeedTabs]: number | string;
};

export const DEFAULT_USER_FEED_COUNT = (() => {
  const keys = Object.values(UserFeedTabs);
  const obj = {} as UserFeedCount;
  keys.forEach((val) => (obj[val as UserFeedTabs] = '?'));
  return obj;
})();

export const UserFeed: FC<{ account: string; queryTab: string }> = ({
  account,
  queryTab,
}) => {
  const router = useRouter();
  const [feedTabState, setFeedTabState] = useState<any>();
  const feedTab = useMemo(() => {
    if (feedTabState) {
      return feedTabState;
    }
    if (queryTab) {
      if ((Object.values(UserFeedTabs) as string[]).includes(queryTab)) {
        return queryTab;
      }
    }
    return UserFeedTabs.OWNED;
  }, [feedTabState, queryTab]);
  const setFeedTab = useCallback(
    (tab: UserFeedTabs) => {
      setFeedTabState(tab);
      router.push(`${ROUTES.USER}/${account}?tab=${tab}`, undefined, {
        shallow: true,
      });
    },
    [account],
  );
  const [freshFeedCount, setFeedCount] = useState<
    UserFeedCount | undefined | Object
  >(undefined);
  const [feedCountCookie, setFeedCountCookie] = useLocalStorage(
    `user-feed-count-${account.toLowerCase()}`,
    DEFAULT_USER_FEED_COUNT,
    3600000 * 24 * 7 * 365 * 10,
  );
  const feedCount = useMemo((): UserFeedCount => {
    if (!!freshFeedCount) {
      const count = {
        ...DEFAULT_USER_FEED_COUNT,
        ...feedCountCookie,
        ...freshFeedCount,
      };
      setFeedCountCookie(count);
      return count;
    }
    if (!!feedCountCookie) {
      return { ...DEFAULT_USER_FEED_COUNT, ...feedCountCookie };
    }
    return DEFAULT_USER_FEED_COUNT;
  }, [JSON.stringify(feedCountCookie), JSON.stringify(freshFeedCount)]);
  return (
    <>
      <StyledTabsContainer>
        <TabsGroup>
          <Tab
            isActive={feedTab === UserFeedTabs.OWNED}
            onClick={() => setFeedTab(UserFeedTabs.OWNED)}
          >
            Collected <MiddotSpan>&middot;</MiddotSpan> {feedCount.owned}
          </Tab>
          <Tab
            isActive={feedTab === UserFeedTabs.MINTS}
            onClick={() => setFeedTab(UserFeedTabs.MINTS)}
          >
            Minted <MiddotSpan>&middot;</MiddotSpan> {feedCount.mints}
          </Tab>
          <Tab
            isActive={feedTab === UserFeedTabs.COMMENTS}
            onClick={() => setFeedTab(UserFeedTabs.COMMENTS)}
          >
            Comments <MiddotSpan>&middot;</MiddotSpan> {feedCount.comments}
          </Tab>
          <Tab
            isActive={feedTab === UserFeedTabs.SAVES}
            onClick={() => setFeedTab(UserFeedTabs.SAVES)}
          >
            Saves <MiddotSpan>&middot;</MiddotSpan> {feedCount.saves}
          </Tab>
        </TabsGroup>
      </StyledTabsContainer>
      {feedTab === UserFeedTabs.OWNED && (
        <OwnedGrid account={account} setTotalCount={setFeedCount} />
      )}
      {feedTab === UserFeedTabs.MINTS && (
        <MintedGrid account={account} setTotalCount={setFeedCount} />
      )}
      {feedTab === UserFeedTabs.COMMENTS && (
        <CommentsGrid account={account} setTotalCount={setFeedCount} />
      )}
      {feedTab === UserFeedTabs.SAVES && (
        <SavesGrid account={account} setTotalCount={setFeedCount} />
      )}
    </>
  );
};

export interface UserFeedGridProps {
  account: string;
  setTotalCount: React.Dispatch<
    React.SetStateAction<UserFeedCount | undefined | Object>
  >;
}

const StyledTabsContainer = styled(TabsContainer)`
  padding-top: 10px;
  justify-content: center;
`;
