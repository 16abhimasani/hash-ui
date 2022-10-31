import { deployments } from '@hash/protocol';
import { BigNumber } from 'ethers';
import qs from 'query-string';
import {
  CHAIN_ID,
  IPFS_LINK,
  PREVIEW_IMAGE_LINK,
  PRIVATE_GATEWAY_IPFS_LINK,
} from '../constants';
import { PREVIEW_ROUTES } from '../constants/routes';

export const getMirrorSplitUrl = (split: string) => {
  return `https://mirror.xyz/splits/${split}`;
};

export const getOpenSeaUrl = (
  tokenId: string,
  address: string = deployments[CHAIN_ID].nft.erc1155,
) => {
  return `https://${
    CHAIN_ID === 1 ? '' : 'testnets.'
  }opensea.io/assets/${address}/${BigNumber.from(tokenId).toString()}`;
};

export const getOpenSeaAccountUrl = (address: string) => {
  return `https://${
    CHAIN_ID === 1 ? '' : 'testnets.'
  }opensea.io/accounts/${address}`;
};

export const getEtherscanTxUrl = (txhash: string) => {
  return `https://${CHAIN_ID === 1 ? '' : 'rinkeby.'}etherscan.io/tx/${txhash}`;
};

export const getPrivateIpfsGatewayUrl = (hash: string) => {
  return `${PRIVATE_GATEWAY_IPFS_LINK}/${hash}`;
};

export const getIpfsUrl = (hash: string) => {
  return `${IPFS_LINK}/${hash}`;
};

export const getEtherscanAddressUrl = (address: string) => {
  return `https://${
    CHAIN_ID === 1 ? '' : 'rinkeby.'
  }etherscan.io/address/${address}`;
};
export const getArtworkPreviewUrl = (hash: string) => {
  return `${PREVIEW_IMAGE_LINK}${PREVIEW_ROUTES.ART}?hash=${hash}`;
};

export const getPrintedArtworkPreviewUrl = (id: string) => {
  return `${PREVIEW_IMAGE_LINK}${PREVIEW_ROUTES.PRINTED_ART}?id=${id}`;
};

export const getDefaultPreviewUrl = (
  hash: string,
  title: string,
  subtitle?: string,
) => {
  const qsObject = {
    hash,
    title,
    subtitle,
  };
  return `${PREVIEW_IMAGE_LINK}${PREVIEW_ROUTES.DEFAULT}?${qs.stringify(
    qsObject,
  )}`;
};

export const getPalletePreviewUrl = (address: string) => {
  return `${PREVIEW_IMAGE_LINK}${PREVIEW_ROUTES.PALETTE}?address=${address}`;
};
