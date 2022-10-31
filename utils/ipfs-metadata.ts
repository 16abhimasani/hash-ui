import { IPFS_FALLBACK_LINKS } from '../constants';
import { ROUTES } from '../constants/routes';
import { IPFS_CACHE } from '../data/ipfs';
import { fetcher } from './fetcher';

export const pinIPFSMetadataByAPI = async (metadata: any) => {
  const result = await fetch(ROUTES.API.TOKEN_METADATA.CREATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });
  if (!result.ok) {
    return;
  }
  const { cid } = await result.json();
  return cid;
};

export const getIPFSMetadata = async (hash: string) => {
  const rootHash =
    hash.indexOf('/') !== -1 ? hash.slice(0, hash.indexOf('/')) : hash;
  const url = hash.indexOf('/') !== -1 ? hash.slice(hash.indexOf('/') + 1) : '';
  for (const urlGenerator of IPFS_FALLBACK_LINKS) {
    const results = await fetch(urlGenerator(rootHash, url));
    if (results.ok) {
      return { cid: hash, ...(await results.json()) };
    }
  }
  return undefined;
};

export const getIPFSMetadataWithCache = async (hash: string) => {
  if (!!IPFS_CACHE[hash]) {
    return IPFS_CACHE[hash];
  }
  return await getIPFSMetadata(hash);
};

export const getObjectFromURI = async (s: string) => {
  if (s.length === 0) {
    return {};
  }
  if (s.startsWith('https://')) {
    return await fetcher(s);
  } else if (s.startsWith('ipfs://')) {
    const metadata = await getIPFSMetadataWithCache(s.slice(7));
    return { ...metadata, cid: s.slice(7) };
  } else if (s.startsWith('baf')) {
    const metadata = await getIPFSMetadataWithCache(s);
    return { ...metadata, cid: s };
  } else if (s.startsWith('Om')) {
    const metadata = await getIPFSMetadataWithCache(s);
    return { ...metadata, cid: s };
  } else {
    try {
      const obj = JSON.parse(s);
      return obj;
    } catch (e) {
      return {};
    }
  }
};
