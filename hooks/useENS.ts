import { invert } from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { ROUTES } from '../constants/routes';
import { useEnsStore } from '../stores/ens';
import { fetcher } from '../utils/fetcher';
import { shortenHexString } from '../utils/hex';
import { ADDRESS_REGEX } from '../utils/regex';

export const useENSLookup = (address?: string | undefined | null) => {
  const ensNameFromStore = useEnsStore(
    useCallback(
      (s) => (!!address ? s.addressToEnsMap[address] : undefined),
      [address],
    ),
  );
  const setEns = useEnsStore((s) => s.setEns);
  const { data } = useSWR(
    useMemo(
      () =>
        !ensNameFromStore && !!address && ADDRESS_REGEX.test(address)
          ? `${ROUTES.API.PROXY.LOOKUP_ADDRESS}?address=${address}`
          : null,
      [ensNameFromStore, address],
    ),
    fetcher,
    {},
  );

  useEffect(() => {
    if (!!data?.address && !!data?.name && data?.name.endsWith('.eth')) {
      setEns(data.address, data.name);
    }
  }, [setEns, data]);

  return useMemo(() => ensNameFromStore, [ensNameFromStore]);
};

export const useResolveToEnsLookup = (name?: string | undefined | null) => {
  const ensNameFromStore = useEnsStore(
    useCallback(
      (s) => (!!name ? invert(s.addressToEnsMap)[name] : undefined),
      [name],
    ),
  );
  const isValidEnsSearch = useMemo(() => {
    return !!name && name.endsWith('.eth');
  }, [name]);

  const setEns = useEnsStore((s) => s.setEns);
  const { data } = useSWR(
    useMemo(
      () =>
        isValidEnsSearch
          ? `${ROUTES.API.PROXY.RESOLVE_ENS}?name=${name}`
          : null,
      [isValidEnsSearch, name],
    ),
    fetcher,
    {},
  );

  useEffect(() => {
    if (!!data?.address && !!data?.name && data?.name.endsWith('.eth')) {
      setEns(data.address, data.name);
    }
  }, [setEns, data]);

  return useMemo(() => ensNameFromStore, [ensNameFromStore]);
};

export const useENSorHex = (
  address?: string | undefined | null,
  defaultText?: string,
): string => {
  const ens = useENSLookup(address);
  return useMemo(() => {
    if (!address) {
      return defaultText ?? '';
    }
    return ens ?? shortenHexString(address ?? '');
  }, [address, defaultText, ens]);
};
