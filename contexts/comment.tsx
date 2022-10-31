import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import React, { useCallback, useMemo } from 'react';
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore';
import { fb } from '../clients/firebase-app';
import { usePriorityAccount } from '../connectors/priority';
import {
  Comment,
  CommentSettings,
  CommentVoteMetadata,
  DAO_ROLES_VOTE_WEIGHT,
  ShardedCommentVote,
  VoteDirection,
} from '../types/comments';
import { DAO_ROLES } from '../types/dao';
import { serializeCommentVoteMetadata } from '../utils/serialize';
import { useCommentVoteDirection, useCurrentUserBestRole } from './auth';

export interface CommentProviderContext {
  comment?: Comment;
  settings?: CommentSettings;
  downVotesByRole?: { [role: string]: string[] };
  upVotesByRole?: { [role: string]: string[] };
  voteValue?: number;
  setVoteDirection?: (voteDirection: VoteDirection) => Promise<void>;
  updateHiddenStatus?: (isHidden: boolean) => Promise<void>;
}

export type CommentProviderState = CommentProviderContext;

const initialAppState: CommentProviderState = {
  comment: undefined,
};

const Context = React.createContext<CommentProviderState>(initialAppState);

export interface CommentContextInterface {
  comment: Comment;
}

export const CommentProvider: React.FC<CommentContextInterface> = ({
  comment,
  children,
}) => {
  const account = usePriorityAccount();

  const settingsRef = useMemo(() => {
    if (!comment?.id) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.COMMENTS.ROOT)
      .doc(comment.id)
      .collection(FIRESTORE_ROUTES.COMMENTS.SETTINGS.ROOT)
      .doc(FIRESTORE_ROUTES.COMMENTS.SETTINGS.DOC_ID);
  }, [comment]);

  const [settings] = useDocumentData<CommentSettings>(settingsRef);

  const shardedUpvoteRef = useMemo(() => {
    if (!comment?.id) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.COMMENTS.ROOT)
      .doc(comment.id)
      .collection(FIRESTORE_ROUTES.COMMENTS.SHARDED_VOTE);
  }, [comment]);

  const [shardedVotes] =
    useCollectionData<ShardedCommentVote>(shardedUpvoteRef);

  const voteDirectionFromCurrentUser = useCommentVoteDirection(comment?.id);
  const role = useCurrentUserBestRole();
  const voteMetadataFromCurrentUser = useMemo(() => {
    if (!role) {
      return undefined;
    }
    return {
      role,
      voteDirection: voteDirectionFromCurrentUser,
    } as CommentVoteMetadata;
  }, [role, voteDirectionFromCurrentUser]);

  const latestVotes = useMemo(() => {
    if (!shardedVotes) {
      return undefined;
    }
    const currentUserVotesObj =
      !!account && !!voteMetadataFromCurrentUser
        ? { [account]: voteMetadataFromCurrentUser }
        : {};

    return {
      ...shardedVotes.reduce((a, c) => {
        const votes = Object.entries(c);
        return votes.reduce((a: any, c) => {
          const vote = serializeCommentVoteMetadata(c[1]);
          return {
            ...a,
            [c[0]]:
              vote.createdAt >= (a[c[0]]?.createdAt ?? -1) ? vote : a[c[0]],
          };
        }, a);
      }, {}),
      ...currentUserVotesObj,
    } as { [role: string]: CommentVoteMetadata };
  }, [account, shardedVotes, voteMetadataFromCurrentUser]);

  const upVotesByRole = useMemo(() => {
    if (!latestVotes) {
      return undefined;
    }
    const votes = Object.entries(latestVotes);
    return votes.reduce((a, c) => {
      if (c[1].voteDirection !== 'upvote') {
        return a;
      }
      return {
        ...a,
        [c[1].role]: (a[c[1].role] ?? []).concat(c[0]),
      };
    }, {} as { [role: string]: string[] });
  }, [latestVotes]);

  const downVotesByRole = useMemo(() => {
    if (!latestVotes) {
      return undefined;
    }
    const votes = Object.entries(latestVotes);
    return votes.reduce((a, c) => {
      if (c[1].voteDirection !== 'downvote') {
        return a;
      }
      return {
        ...a,
        [c[1].role]: (a[c[1].role] ?? []).concat(c[0]),
      };
    }, {} as { [role: string]: string[] });
  }, [latestVotes]);

  const voteDeltaByRole = useMemo(() => {
    return Object.keys(DAO_ROLES).reduce(
      (a, c) => ({
        ...a,
        [c]:
          (upVotesByRole?.[c]?.length ?? 0) -
          (downVotesByRole?.[c]?.length ?? 0),
      }),
      {} as { [role: string]: number },
    );
  }, [upVotesByRole, downVotesByRole]);

  const voteValue = useMemo(() => {
    return Object.entries(voteDeltaByRole).reduce(
      (a, c) => a + (DAO_ROLES_VOTE_WEIGHT[c[0]] ?? 0) * c[1],
      0,
    );
  }, [voteDeltaByRole]);

  const bestRole = useCurrentUserBestRole();

  const setVoteDirection = useCallback(
    async (voteDirection: VoteDirection) => {
      if (!account || !bestRole) {
        return;
      }
      const ref = fb
        .firestore()
        .collection(FIRESTORE_ROUTES.COMMENT_VOTES)
        .doc(account);
      await ref.set({ [comment.id]: voteDirection }, { merge: true });
    },
    [account, bestRole, comment],
  );

  const updateHiddenStatus = useCallback(
    async (isHidden: boolean) => {
      if (!account) {
        return;
      }
      if (!settingsRef) {
        return;
      }
      await settingsRef.set({ isHidden }, { merge: true });
    },
    [account, settingsRef],
  );

  const appStateObject = useMemo(() => {
    return {
      comment,
      settings,
      upVotesByRole,
      updateHiddenStatus,
      downVotesByRole,
      setVoteDirection,
      voteValue,
    };
  }, [
    comment,
    updateHiddenStatus,
    settings,
    downVotesByRole,
    voteValue,
    upVotesByRole,
    setVoteDirection,
  ]);

  return <Context.Provider value={appStateObject}>{children}</Context.Provider>;
};

export const useCommentContext = (): CommentProviderState => {
  return React.useContext(Context);
};
