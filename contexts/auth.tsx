import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { every, some } from 'lodash';
import React, { createContext, useContext, useMemo } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { fb } from '../clients/firebase-app';
import { usePriorityAccount } from '../connectors/priority';
import { useAuth } from '../hooks/useAuth';
import { VoteDirection } from '../types/comments';
import { DaoRole } from '../types/dao';
import { WalletActionStatus } from '../types/transaction';
import { UserMetadataWithAddress } from '../types/user';

export interface AuthProviderContext {
  isAuthenticated: boolean;
  needsAuth: boolean;
  login: () => void;
  signOut: () => void;
  authStatus: WalletActionStatus;
  savedHashes: string[] | undefined;
  upvotedComments: string[] | undefined;
  downvotedComments: string[] | undefined;
  userMetadata?: UserMetadataWithAddress;
}

export type AuthProviderState = AuthProviderContext;

const auth = fb.auth();

const initialAuthState: AuthProviderState = {
  isAuthenticated: false,
  needsAuth: true,
  login: () => new Error('Missing AuthProviderState'),
  signOut: () => new Error('Missing AuthProviderState'),
  authStatus: 'unknown',
  savedHashes: undefined,
  upvotedComments: undefined,
  downvotedComments: undefined,
};

const AuthContext = createContext<AuthProviderState>(initialAuthState);

const AuthProvider: React.FC = ({ children }) => {
  const { authWithSignedMetadata, authStatus, signOut } = useAuth();
  const account = usePriorityAccount();
  const userMetadataRef = useMemo(() => {
    if (!account) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.USER_METADATAS)
      .doc(account);
  }, [account]);

  const [userMetadata] = useDocumentData<UserMetadataWithAddress>(
    userMetadataRef,
    {
      idField: 'address',
    },
  );

  const savedRef = useMemo(() => {
    if (!account) {
      return undefined;
    }
    return fb.firestore().collection(FIRESTORE_ROUTES.SAVES).doc(account);
  }, [account]);

  const [savedHashesObject] = useDocumentData(savedRef, {});

  const savedHashes = useMemo(
    () =>
      !!savedHashesObject
        ? Object.keys(savedHashesObject).filter((s) => savedHashesObject[s])
        : undefined,
    [savedHashesObject],
  );

  const votesRef = useMemo(() => {
    if (!account) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.COMMENT_VOTES)
      .doc(account);
  }, [account]);

  const [votedCommentsObject] = useDocumentData(votesRef, {});

  const upvotedComments = useMemo(
    () =>
      !!votedCommentsObject
        ? Object.keys(votedCommentsObject).filter(
            (s) => votedCommentsObject[s] === ('upvote' as VoteDirection),
          )
        : undefined,
    [votedCommentsObject],
  );

  const downvotedComments = useMemo(
    () =>
      !!votedCommentsObject
        ? Object.keys(votedCommentsObject).filter(
            (s) => votedCommentsObject[s] === ('downvote' as VoteDirection),
          )
        : undefined,
    [votedCommentsObject],
  );

  const authStateObject = useMemo(() => {
    return {
      authStatus,
      isAuthenticated: authStatus === 'success',
      needsAuth: authStatus === 'require-full-auth',
      login: authWithSignedMetadata,
      signOut,
      savedHashes,
      upvotedComments,
      downvotedComments,
      userMetadata,
    };
  }, [
    userMetadata,
    authStatus,
    downvotedComments,
    upvotedComments,
    authWithSignedMetadata,
    savedHashes,
    signOut,
  ]);

  return (
    <AuthContext.Provider value={authStateObject}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuthContext = (): AuthProviderState => {
  return useContext(AuthContext);
};

const useCurrentUserBestRole = (): DaoRole | undefined => {
  const userMetadata = useContext(AuthContext)?.userMetadata;
  return useMemo(() => {
    if (!userMetadata || !userMetadata?.roles) {
      return undefined;
    }
    if (userMetadata.roles?.['historian' as DaoRole]) {
      return 'historian';
    }
    if (userMetadata.roles?.['scribe' as DaoRole]) {
      return 'scribe';
    }
    if (userMetadata.roles?.['hunter' as DaoRole]) {
      return 'hunter';
    }
    return undefined;
  }, [userMetadata]);
};

const useCurrentUserHasAllRoles = (roles: DaoRole[]) => {
  const userMetadata = useContext(AuthContext)?.userMetadata;
  return useMemo(() => {
    return every(roles.map((r) => userMetadata?.roles?.[r] ?? false));
  }, [roles, userMetadata]);
};

const useCurrentUserHasEitherRoles = (roles: DaoRole[]) => {
  const userMetadata = useContext(AuthContext)?.userMetadata;
  return useMemo(() => {
    return some(roles.map((r) => userMetadata?.roles?.[r] ?? false));
  }, [roles, userMetadata]);
};

const useSignOutByContext = () => {
  return useContext(AuthContext)?.signOut;
};

const useIsHashSaved = (hash: string | undefined | null) => {
  const savedHashes = useContext(AuthContext)?.savedHashes;
  return !!hash && savedHashes?.includes(hash);
};

const useCommentVoteDirection = (
  commentId: string | undefined | null,
): VoteDirection => {
  const upvotedComments = useContext(AuthContext)?.upvotedComments;
  const downvotedComments = useContext(AuthContext)?.downvotedComments;
  return useMemo(() => {
    if (!commentId) {
      return 'neutral';
    }
    if (upvotedComments?.includes(commentId)) {
      return 'upvote';
    }
    if (downvotedComments?.includes(commentId)) {
      return 'downvote';
    }
    return 'neutral';
  }, [commentId, upvotedComments, downvotedComments]);
};

const useLoginByContext = () => {
  return useContext(AuthContext)?.login;
};

const useNeedsAuthByContext = () => {
  return useContext(AuthContext)?.needsAuth;
};

const useAuthStatusByContext = () => {
  return useContext(AuthContext)?.authStatus;
};

const useIsAuthenticatedByContext = () => {
  return useContext(AuthContext)?.isAuthenticated;
};

export {
  useCommentVoteDirection,
  AuthProvider,
  useAuthStatusByContext,
  useAuthContext,
  useIsHashSaved,
  useLoginByContext,
  useSignOutByContext,
  useIsAuthenticatedByContext,
  useNeedsAuthByContext,
  useCurrentUserHasEitherRoles,
  useCurrentUserHasAllRoles,
  useCurrentUserBestRole,
};
