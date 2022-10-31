import { utils } from 'ethers';
import { POB_SUBGRAPH_LINK } from '../constants';
import { graphQlFetcher } from './fetcher';
import { getMintPrice } from './getMintPrice';

export const getAdditionalMintingMetadataForTokenForAlgolia = async (
  tokenId?: string,
) => {
  if (!tokenId) {
    return { isMinted: false };
  }

  const mintPrice = getMintPrice(tokenId);

  const res = await graphQlFetcher(
    POB_SUBGRAPH_LINK,
    `
    query {
      hash(id: "${tokenId}") {
        id
        createdAt
        createdBy
      }
    }
  `,
  );

  console.log(res);

  return {
    isMinted: true,
    mintPrice: mintPrice?.toString() ?? null,
    mintPriceNum: !!mintPrice ? parseFloat(utils.formatEther(mintPrice)) : null,
    minter: utils.getAddress(res.hash.createdBy),
    mintedAt: new Date(parseInt(res.hash.createdAt) * 1000),
  };
};
