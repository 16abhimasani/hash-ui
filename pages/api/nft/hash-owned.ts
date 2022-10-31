import { deployments } from '@hash/protocol';
import { NextApiRequest, NextApiResponse } from 'next';
import { ALCHEMY_KEY } from '../../../constants';
import {
  AlchemyGetNftsFetchParams,
  AlchemyGetNftsResponse,
  AlchemyNftResponseData,
} from '../../../types/alchemy';
import { hashRegistryCached } from '../../../utils/hash-registry';
import { lowerCaseCheck } from '../../../utils/string';

// ownedNfts: list of objects that represent NFTs owned by the address. Max results per response = 100.
// pageKey : (optional) UUID for pagination - returned if there are more NFTs to fetch. Max NFTs per page = 100.
// Setting withMetadata parameter to False will reduce payload size and may result in a faster API call.

// Example Response:
// {
//   "ownedNfts": [
//     {
//       "contract": {
//         "address": "0x34d77a17038491a2a9eaa6e690b7c7cd39fc8392"
//       },
//       "id": {
//         "tokenId": "0x0000000000000000000000000000000000000000000000000000000000000277"
//       },
//       "balance": "1"
//     }
//      ...
//   ],
//   "pageKey": "88434286-7eaa-472d-8739-32a0497c2a18",
//   "totalCount": 277,
//   "blockHash": "0x94d5ab52b8a6571733f6b183ef89f31573b82a4e78f8129b0ce90ef0beaf208b"
// }

const TOKENS_OWNED_URL = ({
  owner,
  contracts = [deployments[1].nft.erc1155, deployments[1].nft.v2],
  pageKey,
}: AlchemyGetNftsFetchParams) => {
  const baseUrl = `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}/getNFTs/`;
  const contractQueryString =
    contracts.length > 0
      ? contracts.reduce((previousValue, currentValue, index) => {
          return index === 0
            ? `${previousValue}contractAddresses[]=${currentValue}`
            : `${previousValue}&contractAddresses[]=${currentValue}`;
        }, `&`)
      : ``;
  const fullUrl = `${baseUrl}?owner=${owner}${contractQueryString}&withMetadata=false`;
  return pageKey ? `${fullUrl}&pageKey=${pageKey}` : fullUrl;
};

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { owner } = req.query;

  if (typeof owner !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'address is not a valid value' });
    return;
  }

  // fetch from Alchemy first time => add data to accumulateOwnedNfts array
  // check if pageKey exists top level Alchemy response
  // loop call until it doesn't OR totalCount === accumulateOwnedNfts.length
  // finally => append HASH txn to every "id" object via hashRegistryCached to look up tokenId quickly

  let accumulateOwnedHashNfts: AlchemyNftResponseData[] = [];
  let shouldTryNextPage = true;
  let pageKey = undefined;
  let iterations = 0;

  while (shouldTryNextPage && iterations < 8) {
    const alchemyUrl = TOKENS_OWNED_URL({ owner, pageKey });
    const alchemyResponse = await fetch(alchemyUrl);
    // console.log(
    //   ALCHEMY_KEY
    //     ? alchemyUrl.replace(ALCHEMY_KEY, '<<redacted>>')
    //     : alchemyUrl,
    //   'alchemyUrl',
    // );
    // console.log(pageKey, 'current pageKey');
    if (alchemyResponse.ok) {
      const data = (await alchemyResponse.json()) as AlchemyGetNftsResponse;
      pageKey = data.pageKey;
      const alchemyResponseWithHashTxn: AlchemyNftResponseData[] =
        await Promise.all(
          data.ownedNfts.map(async (ownedNft: AlchemyNftResponseData) => {
            const hash = await hashRegistryCached.tokenIdToTxHash(
              ownedNft.id.tokenId,
            );
            return {
              ...ownedNft,
              id: {
                tokenId: ownedNft.id.tokenId,
                hashTxn: hash,
              },
            };
          }),
        );
      alchemyResponseWithHashTxn.forEach((ownedNft: AlchemyNftResponseData) => {
        if (
          accumulateOwnedHashNfts.some((accumulated) =>
            lowerCaseCheck(accumulated.id.hashTxn, ownedNft.id.hashTxn),
          )
        ) {
          return;
        } else {
          accumulateOwnedHashNfts.push(ownedNft);
        }
      });
      // --------
      // console.log(data.ownedNfts, 'data.ownedNfts');
      // console.log(data.pageKey, 'pageKey');
      // console.log(data.totalCount, 'totalCount');
      // console.log(
      //   accumulateOwnedHashNfts.length,
      //   'accumulateOwnedHashNfts.length',
      // );
      // --------
      shouldTryNextPage =
        pageKey && accumulateOwnedHashNfts.length !== Number(data.totalCount)
          ? true
          : false;
      iterations++;
    } else {
      shouldTryNextPage = false;
      res.status(404).json({
        statusCode: 404,
        message: 'unable to fetch HASH NFTs for Owner',
      });
      return;
    }
  }

  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, stale-while-revalidate, s-maxage=120, max-age=120`,
  );
  res.status(200).json({
    ownedNfts: accumulateOwnedHashNfts,
    statusCode: 200,
  });
  return;
};

export default handle;
