import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import styled from 'styled-components';
import { COMMENTS_LOAD_MORE_PAGE_SIZE, EmptyGridState } from '.';
import { fb } from '../../clients/firebase-app';
import { Comment } from '../../types/comments';
import { getPaginatedArray } from '../../utils';
import { serializeComment } from '../../utils/serialize';
import { CommentCard } from '../comment/card';

export const CommentsStream: FC<{ horizontalMode: boolean }> = ({
  horizontalMode = false,
}) => {
  return (
    <CommentsStreamInner
      horizontalMode={horizontalMode}
      pageable={!horizontalMode}
    />
  );
};

const CommentsStreamInner: FC<{
  pageable: boolean;
  horizontalMode: boolean;
}> = ({ pageable, horizontalMode }) => {
  const commentsRef = useMemo(() => {
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.COMMENTS.ROOT)
      .orderBy('createdAt', 'desc')
      .where('isHidden', '==', false);
  }, []);

  const [rawComments] = useCollectionData<Comment>(commentsRef, {
    idField: 'id',
  });

  const allComments = useMemo(
    () => rawComments?.map(serializeComment),
    [rawComments],
  );

  const [comments, setComments] = useState<Comment[]>([]);
  const [pages, setPages] = useState<{ [n: number]: any[] }>({});
  const [pageIndex, setPageIndex] = useState<number>(0);
  const loadMore = useCallback(async () => {
    if (pageable) {
      setPageIndex((i) => i + 1);
    }
  }, [pageable]);
  const hasMore = useMemo(
    () =>
      comments?.length !== 0 &&
      (comments?.length ?? 0) % COMMENTS_LOAD_MORE_PAGE_SIZE === 0,
    [comments],
  );
  const infiniteStreamProps = useMemo(() => {
    return {
      loadMore,
      hasMore,
      comments,
    };
  }, [loadMore, hasMore, comments]);

  useEffect(() => {
    if (!allComments) {
      return;
    }
    if (pages[pageIndex] && pages[pageIndex].length > 0) {
      setComments(pages[pageIndex]);
      return;
    }
    const hits = getPaginatedArray(
      allComments,
      COMMENTS_LOAD_MORE_PAGE_SIZE,
      pageIndex + 1,
    );
    setPages((p) => ({ ...p, [pageIndex]: hits }));
    setComments(hits);
  }, [pages, pageIndex, allComments]);

  return (
    <>
      {horizontalMode && (
        <FeedTitleWrapper>
          <FeedTitle>Recent Comments</FeedTitle>
          {/* <Link href={`${ROUTES.EXPLORE.COMMENTS}`} passHref>
            <CleanAnchor>
              <FeedLink>View All</FeedLink>
            </CleanAnchor>
          </Link> */}
        </FeedTitleWrapper>
      )}
      <InfiniteStream
        horizontalMode={horizontalMode}
        {...infiniteStreamProps}
      />
    </>
  );
};

interface InfiniteStreamProps {
  comments: Comment[] | undefined;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  horizontalMode: boolean;
}
const InfiniteStream: FC<InfiniteStreamProps> = ({
  comments,
  loadMore,
  hasMore,
  horizontalMode = false,
}) => {
  const [sentryRef, { rootRef }] = useInfiniteScroll({
    loading: false,
    hasNextPage: hasMore,
    onLoadMore: loadMore,
    rootMargin: '0px 0px 200px 0px',
  });
  const FeedContainer = horizontalMode ? FeedContainerRow : FeedContainerColumn;
  return (
    <FeedWrapper ref={rootRef}>
      {comments && (
        <FeedContainer>
          {comments.map((comment, i) => {
            return (
              <CommentCard key={`stream-item-${comment.id}`} {...comment} />
            );
          })}
        </FeedContainer>
      )}
      {(!comments || comments?.length === 0) && <EmptyGridState walletMode />}
      {hasMore && <div ref={sentryRef}></div>}
    </FeedWrapper>
  );
};

const FeedContainerRow = styled.div`
  background-color: white;
  display: flex;
  gap: 32px;
  padding: 32px;
  width: max-content;
  justify-content: flex-start;
  align-items: flex-start;
`;

const FeedContainerColumn = styled.div`
  background-color: white;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 32px;
  align-items: center;
`;

const FeedWrapper = styled.div`
  width: 100%;
  max-width: 100vw;
  overflow-x: scroll;
`;

const FeedTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  padding: 32px;
  padding-left: 48px;
`;
const FeedTitle = styled.div`
  font-family: 'Helvetica Neue';
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  text-align: left;
  color: #000000;
`;
const FeedLink = styled.div`
  font-family: 'Helvetica Neue';
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  text-align: right;
  color: #000000;
  cursor: pointer;
`;
