import { useMemo } from 'react';
import useSWR from 'swr';
import { getIPFSMetadata } from '../utils/ipfs-metadata';

export const useIPFSJson = (hash: string | undefined) => {
  const { data } = useSWR(
    useMemo(() => {
      if (!hash) {
        return null;
      }
      return hash;
    }, [hash]),
    getIPFSMetadata,
    {},
  );
  return useMemo(() => {
    if (!data) {
      return undefined;
    }
    return data;
  }, [data]);
};
