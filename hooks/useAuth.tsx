import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { getUnixTime } from 'date-fns';
import qs from 'query-string';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore';
import useSWR from 'swr';
import { fb } from '../clients/firebase-app';
import {
  usePriorityAccount,
  usePriorityProvider,
} from '../connectors/priority';
import { ROUTES } from '../constants/routes';
import { WalletActionStatus } from '../types/transaction';
import { UserMetadata } from '../types/user';
import { fetcher } from '../utils/fetcher';
import { ADDRESS_REGEX } from '../utils/regex';
import {
  getSignedAccountSignedMessage,
  getVerificationTweetWithSignature,
} from '../utils/signing';
import { lowerCaseCheck } from '../utils/string';
import { useLocalStorage } from './useLocalStorage';
import { useSignMessage } from './useSignMessage';

const auth = fb.auth();

export const useTwitterLink = (address: string | undefined | null) => {
  const sigsRef = useMemo(() => {
    if (!address) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.USER_SIGNATURES)
      .orderBy('createdAt', 'desc')
      .where('account', '==', address)
      .limit(1);
  }, [address]);

  const [signatures] = useCollectionData<{
    signature: string;
    account: string;
    createdAt: number;
  }>(sigsRef, {
    idField: 'signature',
  });

  const userMetadataRef = useMemo(() => {
    if (!address) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.USER_METADATAS)
      .doc(address);
  }, [address]);

  const [userMetadata] = useDocumentData<UserMetadata>(userMetadataRef, {
    idField: 'address',
  });

  const isTwitterLinked = useMemo(() => {
    return userMetadata?.isTwitterLinked;
  }, [userMetadata]);

  const [isTwitterPolling, setIsTwitterPolling] = useState(false);

  const twitterPollingLink = useMemo(
    () =>
      isTwitterPolling &&
      !!address &&
      !isTwitterLinked &&
      !!signatures?.[0]?.signature
        ? `${ROUTES.API.AUTH.TWITTER}?signature=${signatures?.[0]?.signature}`
        : null,
    [isTwitterLinked, isTwitterPolling, address, signatures],
  );

  const { data } = useSWR(twitterPollingLink, fetcher, {
    refreshInterval: 15 * 1000,
  });

  const tweetSignatureHref = useMemo(() => {
    if (!signatures || !signatures[0]) {
      return;
    }

    const params = {
      text: `${getVerificationTweetWithSignature(signatures[0].signature)}`,
    };
    return `https://twitter.com/intent/tweet?${qs.stringify(params, {
      arrayFormat: 'comma',
    })}`;
  }, [signatures]);

  return useMemo(
    () => ({
      tweetSignatureHref,
      isTwitterLinked,
      togglePollingTwitter: () => setIsTwitterPolling((s) => !s),
      isTwitterPolling,
    }),
    [tweetSignatureHref, isTwitterPolling, isTwitterLinked],
  );
};

export const useAuth = () => {
  const account = usePriorityAccount();
  const library = usePriorityProvider();

  const [status, setStatus] = useState<WalletActionStatus>('unknown');
  const [userToken, setUserToken, removeUserToken] = useLocalStorage(
    account?.toLowerCase() ?? '0x0',
    '',
    3600000, // 1 hour in ms
  );
  const signMessage = useSignMessage();

  const [triedUserTokens, setTriedUserTokens] = useState<string[]>([]);

  const getSignatureMetadata = useCallback(async () => {
    if (!account || !library) {
      return undefined;
    }
    const createdAt = getUnixTime(Date.now());
    const message = getSignedAccountSignedMessage({ account, createdAt });
    const signature = (await signMessage(message)) ?? '0x00';
    return {
      account,
      signature,
      createdAt,
    };
  }, [account, library]);

  const authWithSignedMetadata = useCallback(async () => {
    console.log('logging in', account);
    if (!account || !library) {
      return;
    }
    setStatus('in-progress');

    try {
      const payload = await getSignatureMetadata();
      const res = await fetch(`${ROUTES.API.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const { token } = await res.json();
        await fb.auth().signInWithCustomToken(token);
        setUserToken(token);
        setStatus('success');
        await fetch(`${ROUTES.API.AUTH.TWITTER_HYDRATE}?account=${account}`);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    setStatus('failed');
  }, [account, library, getSignatureMetadata]);

  const [currentUser] = useAuthState(auth);

  const signOut = useCallback(async () => {
    try {
      await fb.auth().signOut();
      removeUserToken();
      setStatus('require-full-auth');
    } catch (e) {
      console.error(e);
      setStatus('failed');
    }
  }, [removeUserToken]);

  const clearAuth = useCallback(async () => {
    try {
      console.log('signing out');
      await fb.auth().signOut();
    } catch (e) {
      console.error(e);
    }
    setStatus('unknown');
  }, [account]);

  const authWithCachedToken = useCallback(async () => {
    if (!!account && ADDRESS_REGEX.test(account)) {
      if (!!userToken && userToken !== '') {
        setTriedUserTokens((u) =>
          !u.includes(userToken) ? [...u, userToken] : u,
        );
        try {
          const userCredential = await fb
            .auth()
            .signInWithCustomToken(userToken as string);
          if (lowerCaseCheck(userCredential?.user?.uid ?? '', account)) {
            setStatus('success');
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    setStatus('failed');
  }, [account, userToken]);

  useEffect(() => {
    if (!account || !library) {
      return;
    }

    if (currentUser) {
      if (lowerCaseCheck(currentUser.uid, account)) {
        setStatus('success');
      } else {
        clearAuth();
      }
      return;
    }

    // if (status === 'init') {
    //   clearAuth();
    // }

    if (status === 'unknown') {
      authWithCachedToken();
    }

    if (status === 'failed') {
      setStatus('require-full-auth');
      return;
    }
    if (
      !!userToken &&
      userToken !== '' &&
      !triedUserTokens.includes(userToken)
    ) {
      setStatus('unknown');
    }
  }, [
    account,
    status,
    userToken,
    triedUserTokens,
    currentUser,
    clearAuth,
    authWithCachedToken,
  ]);

  return useMemo(
    () => ({
      currentUser,
      authWithSignedMetadata,
      signOut,
      authStatus: status,
    }),
    [currentUser, authWithSignedMetadata, signOut, status],
  );
};
