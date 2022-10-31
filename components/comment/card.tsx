import React, { FC } from 'react';
import styled from 'styled-components';
import { CommentContent, CommentContentContainer } from '.';
import { Comment } from '../../types/comments';
import { HashResult, SearchResultContainer } from '../search';

export const CommentCard: FC<Comment> = (comment) => {
  return (
    <>
      <CommentCardContainer>
        <CommentCardTxHeader>
          <HashResult hash={comment.txHash} />
        </CommentCardTxHeader>
        <CommentContent {...comment} />
      </CommentCardContainer>
    </>
  );
};

const CommentCardContainer = styled.div`
  background: #ffffff;
  box-shadow: 0px 9px 20px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  ${CommentContentContainer} {
    padding: 20px;
  }
`;
const CommentCardTxHeader = styled.div`
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  ${SearchResultContainer} {
    padding: 20px;
  }
`;
