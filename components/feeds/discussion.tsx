import { FC } from 'react';
import styled from 'styled-components';
import { useCommentsByContext } from '../../contexts/token';
import { Comment } from '../../types/comments';
import { CommentContent } from '../comment';
import { CreateComment } from '../comment/create';
import { EmptyState } from '../state/empty';

const CommentContainer = styled.div`
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
`;

export const DiscussionFeed: FC = () => {
  const comments = useCommentsByContext();
  return (
    <div>
      <CreateComment />
      {comments?.length === 0 && (
        <EmptyState
          title="Begin the discussion!"
          description="Share NFTs, tweets, and other notes related to this moment of history."
        />
      )}
      {comments?.map((c: Comment) => (
        <CommentContainer key={`comment-feed-${c.id}`}>
          <CommentContent {...c} />
        </CommentContainer>
      ))}
    </div>
  );
};
