import { format } from 'date-fns';
import Link from 'next/link';
import { FC, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { usePriorityAccount } from '../../connectors/priority';
import { ROUTES } from '../../constants/routes';
import {
  useAuthContext,
  useCommentVoteDirection,
  useCurrentUserBestRole,
} from '../../contexts/auth';
import { CommentProvider, useCommentContext } from '../../contexts/comment';
import { useUser } from '../../hooks/useUser';
import { useModalStore } from '../../stores/modal';
import {
  Comment,
  DAO_ROLES_VOTE_WEIGHT,
  VerdictEmbedMetadata,
} from '../../types/comments';
import { DaoRole } from '../../types/dao';
import { getIpfsUrl } from '../../utils/urls';
import {
  ActionDropdown,
  DropdownAction,
  DropdownActionDescription,
  DropdownActionsListContainer,
  DropdownRoleRow,
} from '../actionsDropdown';
import { CleanAnchor, MonoAnchorWithIcon } from '../anchor';
import { UserAvatar } from '../avatar';
import { RoundIconButton } from '../button';
import { Flex, FlexEnds } from '../flex';
import { EllipsisIcon } from '../icons/ellipsis';
import { VoteRow } from '../vote';
import { CommentRenderContent } from './content';

export const CommentContentContainer = styled.div`
  padding: 24px 20px;
`;

const AuthorLabel = styled.p`
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  padding: 0;
  margin: 0;
`;

const CreatedAtLabel = styled.p`
  font-family: Helvetica Neue;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  margin: 0;
  line-height: 12px;
  color: rgba(0, 0, 0, 0.4);
`;

const MiddotSpan = styled.span`
  padding: 0 6px;
`;

export const CommentContent: FC<Comment> = (comment) => {
  return (
    <CommentProvider comment={comment}>
      <CommentContentWithoutProvider {...comment} />
    </CommentProvider>
  );
};

const manageButton = (onClick: () => void, isOpen?: boolean) => (
  <RoundIconButton onClick={onClick}>
    <EllipsisIcon />
  </RoundIconButton>
);

const CommentContentWithoutProvider: FC<Comment> = ({
  author,
  createdAt,
  markdown,
  html,
  id,
  embed,
  cid,
}) => {
  const account = usePriorityAccount();
  const { bestName, address } = useUser(author) ?? {};
  const updateHiddenStatus = useCommentContext()?.updateHiddenStatus;
  const settings = useCommentContext()?.settings;
  const upVotesByRole = useCommentContext()?.upVotesByRole;
  const downVotesByRole = useCommentContext()?.downVotesByRole;
  const voteValue = useCommentContext()?.voteValue;
  const setVoteDirection = useCommentContext()?.setVoteDirection;

  const flattenVoters = useMemo(
    () => [
      ...(upVotesByRole?.['historian' as DaoRole] ?? []),
      ...(upVotesByRole?.['scribe' as DaoRole] ?? []),
      ...(upVotesByRole?.['hunter' as DaoRole] ?? []),
      ...(downVotesByRole?.['historian' as DaoRole] ?? []),
      ...(downVotesByRole?.['scribe' as DaoRole] ?? []),
      ...(downVotesByRole?.['hunter' as DaoRole] ?? []),
    ],
    [upVotesByRole, downVotesByRole],
  );

  // key used to refresh the editor instance; needed sometimes.
  const [commentTipTapKey, setCommentTipTapKey] = useState<string | undefined>(
    Date.now().toString(),
  );

  const flattenVoteValues = useMemo(
    () => [
      ...(upVotesByRole?.['historian' as DaoRole]?.map(
        () => DAO_ROLES_VOTE_WEIGHT['historian'],
      ) ?? []),
      ...(upVotesByRole?.['scribe' as DaoRole]?.map(
        () => DAO_ROLES_VOTE_WEIGHT['scribe'],
      ) ?? []),
      ...(upVotesByRole?.['hunter' as DaoRole]?.map(
        () => DAO_ROLES_VOTE_WEIGHT['hunter'],
      ) ?? []),
      ...(downVotesByRole?.['historian' as DaoRole]?.map(
        () => DAO_ROLES_VOTE_WEIGHT['historian'],
      ) ?? []),
      ...(downVotesByRole?.['scribe' as DaoRole]?.map(
        () => DAO_ROLES_VOTE_WEIGHT['scribe'],
      ) ?? []),
      ...(downVotesByRole?.['hunter' as DaoRole]?.map(
        () => DAO_ROLES_VOTE_WEIGHT['hunter'],
      ) ?? []),
    ],
    [upVotesByRole, downVotesByRole],
  );

  const voteDirection = useCommentVoteDirection(id);
  const isAuthenticated = useAuthContext()?.isAuthenticated;
  const toggleLoginModal = useModalStore((s) => s.toggleIsLoginModalOpen);
  const toggleIsTwitterModalOpen = useModalStore(
    (s) => s.toggleIsTwitterModalOpen,
  );
  const bestRole = useCurrentUserBestRole();

  const handleUpvoteClick = useCallback(() => {
    if (isAuthenticated) {
      if (!bestRole) {
        toggleIsTwitterModalOpen();
      } else {
        setVoteDirection?.(voteDirection === 'upvote' ? 'neutral' : 'upvote');
      }
    } else {
      toggleLoginModal();
    }
  }, [
    bestRole,
    voteDirection,
    toggleLoginModal,
    isAuthenticated,
    setVoteDirection,
  ]);

  const handleDownvoteClick = useCallback(() => {
    if (isAuthenticated) {
      if (!bestRole) {
        toggleIsTwitterModalOpen();
      } else {
        setVoteDirection?.(
          voteDirection === 'downvote' ? 'neutral' : 'downvote',
        );
      }
    } else {
      if (!bestRole) {
        toggleIsTwitterModalOpen();
      } else {
        toggleLoginModal();
      }
    }
  }, [
    bestRole,
    voteDirection,
    isAuthenticated,
    toggleLoginModal,
    setVoteDirection,
  ]);

  const verdictEmbedMetadata = useMemo(
    () =>
      embed?.find((e) => e.type === 'verdict-status') as
        | VerdictEmbedMetadata
        | undefined,
    [embed],
  );

  const isCommentVerdict = useMemo(
    () => !!verdictEmbedMetadata,
    [verdictEmbedMetadata],
  );
  const isCommentAuthor = useMemo(() => author === account, [account, author]);

  const onHideClick = useCallback(() => {
    const shouldHide = confirm(
      'Hiding will remove this comment from this HASH. Are you sure?',
    );
    if (shouldHide) {
      updateHiddenStatus?.(true);
    }
  }, [updateHiddenStatus]);

  const tipTapContent = useMemo(() => {
    if (!!html && html !== '') {
      return html;
    }
    if (!!markdown && markdown !== '') {
      return markdown;
    }
    return undefined;
  }, [html, markdown]);

  if (settings?.isHidden) {
    return null;
  }

  return (
    <CommentContentContainer>
      <FlexEnds style={{ paddingBottom: 20 }}>
        <Flex>
          <div>
            <UserAvatar user={author} />
          </div>
          <Link href={`${ROUTES.USER}/${address}`}>
            <CleanAnchor>
              <AuthorLabel style={{ paddingLeft: 6 }}>{bestName}</AuthorLabel>
            </CleanAnchor>
          </Link>
          <CreatedAtLabel>
            <MiddotSpan>&middot;</MiddotSpan>
            {format(new Date(createdAt * 1000), 'yyyy-MM-dd hh:mm')}
          </CreatedAtLabel>
        </Flex>
        <ActionDropdown enable={true} button={manageButton}>
          {(onClick: () => void, isOpen?: boolean) => (
            <DropdownActionsListContainer>
              {/* <DropdownAction
                disabled={!isCommentAuthor}
                title={`Edit ${isCommentVerdict ? 'Verdict' : 'Comment'}`}
              >
                <DropdownActionDescription>
                  Edit this {isCommentVerdict ? 'verdict' : 'comment'} with new
                  information
                </DropdownActionDescription>
              </DropdownAction> */}
              <DropdownAction
                onClick={onHideClick}
                disabled={bestRole !== 'historian' || !isCommentAuthor}
                title={`Hide ${isCommentVerdict ? 'Verdict' : 'Comment'}`}
              >
                <DropdownActionDescription>
                  Remove this {isCommentVerdict ? 'verdict' : 'comment'} from
                  the page
                </DropdownActionDescription>
              </DropdownAction>
              <DropdownAction
                title={`Share ${isCommentVerdict ? 'Verdict' : 'Comment'}`}
              >
                <DropdownActionDescription>
                  Get a shareable link to this{' '}
                  {isCommentVerdict ? 'verdict' : 'comment'}
                </DropdownActionDescription>
              </DropdownAction>
              <DropdownRoleRow>
                {!!cid && (
                  <MonoAnchorWithIcon target={'_blank'} href={getIpfsUrl(cid)}>
                    IPFS
                  </MonoAnchorWithIcon>
                )}
              </DropdownRoleRow>
            </DropdownActionsListContainer>
          )}
        </ActionDropdown>
      </FlexEnds>
      <CommentRenderContent
        embed={embed}
        shouldShowEmptyState={false}
        editable={false}
        commentHtml={tipTapContent}
        commentTipTapKey={commentTipTapKey}
      />
      <div style={{ paddingTop: 36 }}>
        <VoteRow
          voteValue={voteValue}
          voteDirection={voteDirection}
          voters={flattenVoters}
          voteValues={flattenVoteValues}
          handleUpvoteClick={handleUpvoteClick}
          handleDownvoteClick={handleDownvoteClick}
        />
      </div>
    </CommentContentContainer>
  );
};
