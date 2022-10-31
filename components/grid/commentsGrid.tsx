import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { utils } from 'ethers';
import React, { FC, useEffect, useMemo } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import styled from 'styled-components';
import { EmptyGridState } from '.';
import { fb } from '../../clients/firebase-app';
import { Comment } from '../../types/comments';
import { serializeComment } from '../../utils/serialize';
import { CommentCard } from '../comment/card';
import { UserFeedGridProps, UserFeedTabs } from '../user/feed';

export const CommentsGrid: FC<UserFeedGridProps> = ({
  account,
  setTotalCount,
}) => {
  return <CommentsGridInner account={account} setTotalCount={setTotalCount} />;
};

const CommentsGridInner: FC<UserFeedGridProps> = ({
  account,
  setTotalCount,
}) => {
  const commentsRef = useMemo(() => {
    if (!account) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.COMMENTS.ROOT)
      .orderBy('createdAt', 'desc')
      .where('isHidden', '==', false)
      .where('author', 'in', [
        account.toLowerCase(),
        utils.getAddress(account),
      ]);
  }, [account]);

  const [rawComments] = useCollectionData<Comment>(commentsRef, {
    idField: 'id',
  });

  const comments = useMemo(
    () => rawComments?.map(serializeComment),
    [rawComments],
  );

  useEffect(() => {
    setTotalCount((prevState) => ({
      ...(prevState ?? {}),
      [UserFeedTabs.COMMENTS]: comments?.length ?? 0,
    }));
  }, [comments]);

  return (
    <>
      <FeedContainer>
        {comments?.map((comment: Comment) => (
          <CommentCard key={`user-feed-comment-${comment.id}`} {...comment} />
        ))}
        {(!comments || comments?.length === 0) && <EmptyGridState walletMode />}
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
