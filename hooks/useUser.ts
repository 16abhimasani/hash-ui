import { utils } from 'ethers';
import { useMemo } from 'react';
import { shortenHexString } from '../utils/hex';
import { useENSLookup } from './useENS';
import { useUserMetadata } from './useUserMetadata';

export const useUser = (address: string | null | undefined) => {
  const normalizedAddress = useMemo(
    () => (!!address ? utils.getAddress(address) : undefined),
    [address],
  );

  const shortenedAddress = useMemo(
    () =>
      !!normalizedAddress ? shortenHexString(normalizedAddress) : undefined,
    [normalizedAddress],
  );
  const ens = useENSLookup(address);
  const [userMetadata, isLoading] = useUserMetadata(address);

  const bestName = useMemo(() => {
    if (!!userMetadata?.username) {
      return `@${userMetadata?.username}`;
    }
    if (!!ens && !isLoading) {
      return ens;
    }
    return shortenedAddress;
  }, [isLoading, userMetadata, ens, shortenedAddress]);

  const bestUserLink = useMemo(() => {
    if (!!userMetadata?.username) {
      return `https://twitter.com/${userMetadata?.username}`;
    }
    if (!!ens && !isLoading) {
      return `https://etherscan.io/enslookup-search?search=${ens}`;
    }
    return `https://etherscan.io/address/${normalizedAddress}`;
  }, [isLoading, userMetadata, ens, normalizedAddress]);

  return useMemo(() => {
    if (!normalizedAddress || !shortenedAddress) {
      return undefined;
    }
    return {
      address: normalizedAddress,
      shortenedAddress,
      ens,
      username: userMetadata?.username,
      profileImage: userMetadata?.profileImage,
      bestName,
      roles: userMetadata?.roles,
      bestUserLink,
    };
  }, [userMetadata, ens, normalizedAddress, shortenedAddress, bestName]);
};
