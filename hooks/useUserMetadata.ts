import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { utils } from 'ethers';
import { useCallback, useEffect, useMemo } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { fb } from '../clients/firebase-app';
import { useUserMetadataStore } from '../stores/userMetadata';
import { UserMetadataWithAddress } from '../types/user';
import { ADDRESS_REGEX } from '../utils/regex';

export const useUserMetadata = (address?: string | undefined | null) => {
  const userMetadataFromStore = useUserMetadataStore(
    useCallback(
      (s) => (!!address ? s.addressToUserMetadata[address] : undefined),
      [address],
    ),
  );
  const normalizedAddress = useMemo(
    () => (!!address ? utils.getAddress(address) : undefined),
    [address],
  );
  const userMetadataRef = useMemo(() => {
    if (!normalizedAddress) {
      return undefined;
    }
    if (!ADDRESS_REGEX.test(normalizedAddress)) {
      return undefined;
    }
    return fb
      .firestore()
      .collection(FIRESTORE_ROUTES.USER_METADATAS)
      .doc(normalizedAddress);
  }, [normalizedAddress, userMetadataFromStore]);

  const [userMetadata, isLoading] = useDocumentData<UserMetadataWithAddress>(
    userMetadataRef,
    {
      idField: 'address',
    },
  );
  const setUserMetadata = useUserMetadataStore((s) => s.setUserMetadata);

  useEffect(() => {
    if (!!userMetadata && !!address) {
      setUserMetadata(address, userMetadata);
    }
  }, [setUserMetadata, userMetadata, address]);

  return useMemo(
    () =>
      [userMetadataFromStore, isLoading] as [
        UserMetadataWithAddress | undefined,
        boolean,
      ],
    [isLoading, userMetadataFromStore],
  );
};
