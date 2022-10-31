import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import firebase from 'firebase';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { fb } from '../../clients/firebase-app';
import { usePriorityAccount } from '../../connectors/priority';
import {
  useAuthContext,
  useCurrentUserHasEitherRoles,
} from '../../contexts/auth';
import { useHashByContext } from '../../contexts/token';
import { useUser } from '../../hooks/useUser';
import {
  Comment,
  EmbedMetadata,
  NftEmbedMetadata,
  TwitterEmbedMetadata,
  VerdictEmbedMetadata,
} from '../../types/comments';
import {
  ActionDropdown,
  DropdownAction,
  DropdownActionDescription,
  DropdownActionsListContainer,
  DropdownRoleRow,
} from '../actionsDropdown';
import { UserAvatar } from '../avatar';
import {
  RoundIconButton,
  SmallPrimaryActionButton,
  SmallSecondaryActionButton,
} from '../button';
import { Flex, FlexEnds } from '../flex';
import { EllipsisIcon } from '../icons/ellipsis';
import { EmbedNFTModal } from '../modals/embedNft';
import { EmbedTweetModal } from '../modals/embedTweet';
import { AddressPill } from '../web3Status';
import { CommentRenderContent } from './content';

const CommentContentContainer = styled.div`
  padding: 24px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
`;

const AuthorLabel = styled.p`
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  padding: 0;
  margin: 0;
`;

const manageButton = (onClick: () => void, isOpen?: boolean) => (
  <RoundIconButton onClick={onClick}>
    <EllipsisIcon />
  </RoundIconButton>
);

export const EditComment: FC<Comment> = ({ embed, html, markdown }) => {
  const hash = useHashByContext();
  const account = usePriorityAccount();
  const { bestName } = useUser(account) ?? {};
  const isAuthenticated = useAuthContext()?.isAuthenticated;
  const isValidRole = useCurrentUserHasEitherRoles([
    'historian',
    'scribe',
    'hunter',
  ]);

  const [isEmbedNFTOpen, setIsEmbedNFTOpen] = useState(false);
  const [isEmbedTweetOpen, setIsEmbedTweetOpen] = useState(false);

  const [tweetEmbedMetadata, setTweetEmbedMetadata] = useState<
    TwitterEmbedMetadata | undefined
  >(undefined);

  const [nftEmbedMetadata, setNftEmbedMetadata] = useState<
    NftEmbedMetadata | undefined
  >(undefined);

  const [verdictEmbedMetadata, setVerdictEmbedMetadata] = useState<
    VerdictEmbedMetadata | undefined
  >(undefined);

  const [editedCommentHtml, setEditedCommentHtml] = useState<
    string | undefined
  >(undefined);

  const [editedCommentText, setEditedCommentText] = useState<
    string | undefined
  >(undefined);

  // key used to refresh the editor instance; needed sometimes.
  const [commentTipTapKey, setCommentTipTapKey] = useState<string | undefined>(
    Date.now().toString(),
  );

  useEffect(() => {
    const tem = embed?.find((e) => e.type === 'twitter-tweet') as
      | TwitterEmbedMetadata
      | undefined;
    const nem = embed?.find((e) => e.type === 'nft') as
      | NftEmbedMetadata
      | undefined;
    const vem = embed?.find((e) => e.type === 'verdict-status') as
      | VerdictEmbedMetadata
      | undefined;
    setTweetEmbedMetadata(tem);
    setNftEmbedMetadata(nem);
    setVerdictEmbedMetadata(vem);
  }, [embed]);

  useEffect(() => {
    setEditedCommentText(markdown);
    setEditedCommentHtml(html);
    setCommentTipTapKey(Date.now().toString());
  }, [html, markdown]);

  const handleClear = useCallback(() => {
    setEditedCommentHtml(undefined);
    setEditedCommentText(undefined);
    setVerdictEmbedMetadata(undefined);
    setNftEmbedMetadata(undefined);
    setTweetEmbedMetadata(undefined);
    setCommentTipTapKey(Date.now().toString());
  }, []);

  const handleCommentOnChange = useCallback((html: string, text: string) => {
    console.log(html, text);
    setEditedCommentHtml(html);
    setEditedCommentText(text);
  }, []);

  const updatedEmbeds = useMemo(() => {
    return [
      verdictEmbedMetadata,
      tweetEmbedMetadata ?? nftEmbedMetadata,
    ].filter((e) => !!e) as EmbedMetadata[];
  }, [verdictEmbedMetadata, tweetEmbedMetadata, nftEmbedMetadata]);

  const handleUpdateComment = useCallback(async () => {
    if (!account) {
      return;
    }
    if (!hash) {
      return;
    }
    const ref = fb.firestore().collection(FIRESTORE_ROUTES.COMMENTS.ROOT).doc();
    await ref.set({
      embed,
      txHash: hash,
      markdown: editedCommentText ?? '',
      html: editedCommentHtml ?? '',
      author: account,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastEditedAt: firebase.firestore.FieldValue.serverTimestamp(),
      isHidden: false,
    });
    handleClear();
  }, [account, handleClear, hash, editedCommentHtml, editedCommentText, embed]);

  const isCommentChanged = useMemo(() => {
    return (
      !!verdictEmbedMetadata ||
      !!nftEmbedMetadata ||
      !!tweetEmbedMetadata ||
      (!!editedCommentText && editedCommentText !== '')
    );
  }, [
    verdictEmbedMetadata,
    nftEmbedMetadata,
    tweetEmbedMetadata,
    editedCommentText,
  ]);

  const isCommentAddable = useMemo(
    () => isValidRole && isAuthenticated,
    [isValidRole, isAuthenticated],
  );

  const isVerdictAddable = useCurrentUserHasEitherRoles([
    'historian',
    'hunter',
  ]);

  return (
    <>
      <EmbedNFTModal
        isOpen={isEmbedNFTOpen}
        setIsOpen={setIsEmbedNFTOpen}
        onSubmit={(e) => {
          setNftEmbedMetadata(e);
          setTweetEmbedMetadata(undefined);
        }}
      />
      <EmbedTweetModal
        isOpen={isEmbedTweetOpen}
        setIsOpen={setIsEmbedTweetOpen}
        onSubmit={(e) => {
          setNftEmbedMetadata(undefined);
          setTweetEmbedMetadata(e);
        }}
      />
      <CommentContentContainer>
        <FlexEnds style={{ paddingBottom: 20 }}>
          <Flex>
            <div>
              <UserAvatar user={account} />
            </div>
            <AuthorLabel style={{ paddingLeft: 6 }}>{bestName}</AuthorLabel>
            {!!account && (
              <AddressPill style={{ marginLeft: 10 }}>
                {account?.slice(0, 6)}
              </AddressPill>
            )}
          </Flex>
          {isCommentAddable && (
            <ActionDropdown enable={true} button={manageButton}>
              {(onClick: () => void, isOpen?: boolean) => (
                <DropdownActionsListContainer>
                  <DropdownAction
                    onClick={() => {
                      setIsEmbedTweetOpen((s) => !s);
                      onClick();
                    }}
                    title={'Embed Tweet'}
                  >
                    <DropdownActionDescription>
                      Enter the status ID of a tweet
                    </DropdownActionDescription>
                  </DropdownAction>
                  <DropdownAction
                    onClick={() => {
                      setIsEmbedNFTOpen((s) => !s);
                      onClick();
                    }}
                    title={'Embed NFT'}
                  >
                    <DropdownActionDescription>
                      Enter the Contract Address & Token ID
                    </DropdownActionDescription>
                  </DropdownAction>
                  <DropdownAction
                    onClick={() => {
                      setVerdictEmbedMetadata({
                        type: 'verdict-status',
                        opinionType: 'verified',
                      });
                      onClick();
                    }}
                    title={'Verify Metadata'}
                    disabled={!isVerdictAddable}
                  >
                    <DropdownActionDescription>
                      Create a verdict marking the metadata associated with this
                      txn as valid.
                    </DropdownActionDescription>
                  </DropdownAction>
                  <DropdownAction
                    onClick={() => {
                      setVerdictEmbedMetadata({
                        type: 'verdict-status',
                        opinionType: 'disputed',
                      });
                      onClick();
                    }}
                    title={'Dispute Metadata'}
                    disabled={!isVerdictAddable}
                  >
                    <DropdownActionDescription>
                      Create a verdict marking the metadata associated with this
                      txn as incorrect or invalid.
                    </DropdownActionDescription>
                  </DropdownAction>
                  <DropdownRoleRow />
                </DropdownActionsListContainer>
              )}
            </ActionDropdown>
          )}
        </FlexEnds>
        <CommentRenderContent
          embed={embed}
          shouldShowEmptyState={false}
          editable={true}
          commentHtml={isCommentAddable ? html ?? markdown : undefined}
          commentTipTapKey={commentTipTapKey}
          onChange={handleCommentOnChange}
        />
        <FlexEnds style={{ paddingTop: 20 }}>
          <div></div>
          <Flex>
            {isCommentChanged && (
              <SmallSecondaryActionButton onClick={handleClear}>
                Revert
              </SmallSecondaryActionButton>
            )}
            <SmallPrimaryActionButton
              onClick={handleUpdateComment}
              style={{ marginLeft: 12 }}
            >
              Update Comment
            </SmallPrimaryActionButton>
          </Flex>
        </FlexEnds>
      </CommentContentContainer>
    </>
  );
};
