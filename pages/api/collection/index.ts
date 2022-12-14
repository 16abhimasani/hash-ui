import { deployments } from '@hash/protocol';
import { BigNumber } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { MAINNET_PROVIDER } from '../../../clients/provider';
import {
  CHAIN_ID,
  COVALENT_API_KEY,
  OPENSEA_API_KEY,
} from '../../../constants';
import { ADDRESS_REGEX } from '../../../utils/regex';

const FETCH_LAST_TXS = (account: string) =>
  `https://api.covalenthq.com/v1/1/address/${account}/transactions_v2/?no-logs=true&page-number=0&page-size=1000&key=${COVALENT_API_KEY}`;

const handleCollectionNeeds = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { id, blockNum } = req.query;

  if (typeof id !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'id is not a valid value' });
    return;
  }

  if (typeof blockNum !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'blockNum is not a valid value' });
    return;
  }

  if (parseInt(blockNum) === NaN || parseInt(blockNum) < 0) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'blockNum is not a valid value' });
    return;
  }

  if (id === 'gas-station') {
    const { numTx } = req.query;

    if (typeof numTx !== 'string') {
      res
        .status(422)
        .json({ statusCode: 422, message: 'numTx is not a valid value' });
      return;
    }

    const { transactions } = await MAINNET_PROVIDER.getBlock(
      parseInt(blockNum),
    );
    if (!transactions) {
      // TODO should this just throw an error?
      res.status(200).json({
        statusCode: 200,
        hashes: [],
      });
    }
    const txs = transactions.slice(0, parseInt(numTx));
    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
    );
    res.status(200).json({
      statusCode: 200,
      hashes: txs,
    });
  } else if (id === 'account') {
    const { owner } = req.query;
    if (typeof owner !== 'string') {
      res
        .status(422)
        .json({ statusCode: 422, message: 'owner is not a valid value' });
      return;
    }
    if (!ADDRESS_REGEX.test(owner as string)) {
      res
        .status(422)
        .json({ statusCode: 422, message: 'owner is not a valid value' });
      return;
    }
    let hashes: string[] = [];
    let shouldTryNextPage = true;
    let page = 0;
    while (shouldTryNextPage) {
      const headers = new Headers({
        'X-API-KEY': OPENSEA_API_KEY ?? '',
      });

      const openseaRes = await fetch(
        `https://${
          CHAIN_ID === 1 ? '' : 'rinkeby-'
        }api.opensea.io/api/v1/assets?owner=${owner}&limit=50&offset=${page}&asset_contract_address=${
          deployments[CHAIN_ID].nft.erc1155
        }`,
        {
          headers,
        },
      );
      if (openseaRes.ok) {
        const { assets } = await openseaRes.json();
        hashes = [
          ...hashes,
          ...assets.map((a: any) => BigNumber.from(a.token_id).toHexString()),
        ];
        if (assets.length < 50) {
          shouldTryNextPage = false;
        } else {
          page += 50;
        }
      } else {
        shouldTryNextPage = false;
        res.status(500).json({
          statusCode: 500,
          message: 'internal error fetching account balance',
        });
        return;
      }
    }
    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
    );
    res.status(200).json({
      statusCode: 200,
      hashes,
    });
    return;
  } else if (id === 'my-txs') {
    const { account } = req.query;
    if (typeof account !== 'string') {
      res
        .status(422)
        .json({ statusCode: 422, message: 'owner is not a valid value' });
      return;
    }
    if (!ADDRESS_REGEX.test(account as string)) {
      res
        .status(422)
        .json({ statusCode: 422, message: 'owner is not a valid value' });
      return;
    }

    const etherscanRes = await fetch(FETCH_LAST_TXS(account));
    if (etherscanRes.ok) {
      const { data } = await etherscanRes.json();
      const hashes = data.items.map((tx: any) => tx.tx_hash);
      res.setHeader(
        'Cache-Control',
        `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
      );
      res.status(200).json({
        statusCode: 200,
        hashes,
      });
    } else {
      res.status(500).json({
        statusCode: 500,
        message: 'internal error fetching account txns',
      });
      return;
    }
  } else {
    res.status(501).json({
      statusCode: 501,
      message: 'collection id is not supported by API at this point',
    });
    return;
  }
};

export default handleCollectionNeeds;
