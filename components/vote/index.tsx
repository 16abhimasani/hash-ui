import { FC, useMemo, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import useMeasure from 'react-use-measure';
import styled from 'styled-components';
import { useUser } from '../../hooks/useUser';
import { VoteDirection } from '../../types/comments';
import { UserAvatar } from '../avatar';
import { BaseButton } from '../button';
import { Flex, FlexEnds } from '../flex';
import { DownvoteIcon, UpvoteIcon } from '../icons/upvote';
import { LargeLabel } from '../text';
import { AddressPill } from '../web3Status';
import { VoterReel } from './reel';

const TotalVotersContainer = styled(Flex)`
  cursor: pointer;
`;

const TotalVotersWell = styled.div`
  background: #f2f2f2;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 12px;
  line-height: 12px;
`;

const VoteButton = styled(BaseButton)`
  :hover {
    background: #f6f6f6;
  }
  border-radius: 4px;
  padding: 4px 6px;
`;

const VoteValue = styled.p`
  font-family: Helvetica Neue;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  padding: 0 4px;
  margin: 0;
  transform: translateY(-1px);
`;

const AuthorLabel = styled.p`
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  padding: 0;
  margin: 0;
`;

const Voter: FC<{ user: string; voteValue?: number }> = ({
  user,
  voteValue,
}) => {
  const { bestName } = useUser(user) ?? {};

  return (
    <Flex style={{ paddingTop: 16 }}>
      <div>
        <UserAvatar user={user} />
      </div>
      <AuthorLabel as={'a'} style={{ paddingLeft: 6, textDecoration: 'none' }}>
        {bestName}
      </AuthorLabel>
      {!!voteValue && (
        <AddressPill style={{ marginLeft: 6, padding: '2px 8px' }}>
          {voteValue}
        </AddressPill>
      )}
    </Flex>
  );
};

const VotersExpandoContainer = styled(animated.div)`
  position: relative;
  will-change: transform, opacity, height;
  overflow: hidden;
`;

const VotersExpandoAbsoluteContainer = styled.div`
  position: absolute;
  width: 100%;
`;

const VotersExpandoContent = styled.div`
  padding: 24px 0px 0px 0px;
  width: 100%;
`;

const VotersContainer = styled(Flex)`
  flex-wrap: wrap;
  > div + div {
    padding-left: 16px;
  }
`;

export const VoteRow: FC<{
  handleDownvoteClick?: () => void;
  handleUpvoteClick?: () => void;
  voters: string[];
  voteValues?: number[];
  voteDirection?: VoteDirection;
  voteValue?: number;
}> = ({
  handleUpvoteClick,
  handleDownvoteClick,
  voteValue,
  voters,
  voteDirection,
  voteValues,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandoContentRef, expandoContentBounds] = useMeasure();

  const { height, opacity } = useSpring({
    from: { height: 0, opacity: 0 },
    to: {
      height: isExpanded ? expandoContentBounds.height : 0,
      opacity: isExpanded ? 1 : 0,
    },
  });

  const voteColor = useMemo(() => {
    if (voteDirection === 'upvote') {
      return '#FF4500';
    }
    if (voteDirection === 'downvote') {
      return '#9494FF';
    }
    return '#C6C6C6';
  }, [voteDirection]);

  const downVoteColor = useMemo(() => {
    if (voteDirection === 'downvote') {
      return '#9494FF';
    }
    return '#C6C6C6';
  }, [voteDirection]);

  const upVoteColor = useMemo(() => {
    if (voteDirection === 'upvote') {
      return '#FF4500';
    }
    return '#C6C6C6';
  }, [voteDirection]);

  return (
    <>
      <FlexEnds style={{ width: '100%' }}>
        <TotalVotersContainer
          onClick={() =>
            !!voters && voters.length !== 0 && setIsExpanded((s) => !s)
          }
        >
          {!!voters && voters.length !== 0 && <VoterReel users={voters} />}
          <TotalVotersWell
            style={{ marginLeft: !!voters && voters.length !== 0 ? 8 : 0 }}
          >
            {voters.length} Voters
          </TotalVotersWell>
        </TotalVotersContainer>
        <Flex>
          <VoteButton onClick={handleDownvoteClick}>
            <DownvoteIcon color={downVoteColor} />
          </VoteButton>
          <VoteValue style={{ color: voteColor }}>{voteValue ?? 0}</VoteValue>
          <VoteButton onClick={handleUpvoteClick}>
            <UpvoteIcon color={upVoteColor} />
          </VoteButton>
        </Flex>
      </FlexEnds>
      <VotersExpandoContainer style={{ opacity, height }}>
        <VotersExpandoAbsoluteContainer ref={expandoContentRef as any}>
          <VotersExpandoContent>
            <LargeLabel style={{ transform: 'translateY(4px)' }}>
              Votes from
            </LargeLabel>
            <VotersContainer>
              {voters.map((h, i) => (
                <Voter
                  key={`voter-row-${h}`}
                  user={h}
                  voteValue={voteValues?.[i]}
                />
              ))}
            </VotersContainer>
          </VotersExpandoContent>
        </VotersExpandoAbsoluteContainer>
      </VotersExpandoContainer>
    </>
  );
};
