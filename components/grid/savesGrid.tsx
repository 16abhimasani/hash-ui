import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { utils } from 'ethers';
import React, { FC, useEffect, useMemo } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import styled from 'styled-components';
import { EmptyGridState } from '.';
import { fb } from '../../clients/firebase-app';
import { HashResult } from '../search';
import { UserFeedGridProps, UserFeedTabs } from '../user/feed';

export const SavesGrid: FC<UserFeedGridProps> = ({
  account,
  setTotalCount,
}) => {
  return <SavesGridInner account={account} setTotalCount={setTotalCount} />;
};

const SavesGridInner: FC<UserFeedGridProps> = ({ account, setTotalCount }) => {
  const savedRef = useMemo(() => {
    if (!account) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.SAVES)
      .doc(utils.getAddress(account));
  }, [account]);

  const [savedHashesObject] = useDocumentData(savedRef, {});

  const savedHashes = useMemo(
    () =>
      !!savedHashesObject
        ? Object.keys(savedHashesObject).filter((s) => savedHashesObject[s])
        : undefined,
    [savedHashesObject],
  );

  useEffect(() => {
    setTotalCount((prevState) => ({
      ...(prevState ?? {}),
      [UserFeedTabs.SAVES]: savedHashes?.length ?? 0,
    }));
  }, [savedHashes]);

  return (
    <>
      <FeedContainer>
        {savedHashes?.map((hash) => (
          <HashCell>
            <HashResult key={hash} hash={hash} />
          </HashCell>
        ))}
        {(!savedHashes || savedHashes?.length === 0) && (
          <EmptyGridState walletMode />
        )}
      </FeedContainer>
    </>
  );
};

const FeedContainer = styled.div`
  background-color: white;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 32px;
  align-items: center;
`;

const HashCell = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  width: 100%;
`;
