import { BigNumber } from 'ethers';
import { flatten } from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';
import { MAINNET_PROVIDER } from '../../../clients/provider';
import { ETHERSCAN_API_KEY, HASH_PROD_LINK, ZERO } from '../../../constants';
import { ROUTES } from '../../../constants/routes';
import { HashCarouselData } from '../../../stores/carousel';
import {
  AnnotatedHash,
  CollectionContentMetadata,
  DynamicGridBlockMetadata,
} from '../../../types/content';
import { graphQlFetcher } from '../../../utils/fetcher';
import { shortenHexString } from '../../../utils/hex';
import { ADDRESS_REGEX } from '../../../utils/regex';

const MIN_BLOCKS = 3;
const MIN_UNIQUE_HASHES = 4;

const FETCH_FIRST_TXS = (account: string) =>
  `https://api.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`;

const FETCH_FIRST_ERC_20_TXS = (account: string) =>
  `https://api.etherscan.io/api?module=account&action=tokentx&address=${account}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`;

const FETCH_FIRST_ERC_721_TXS = (account: string) =>
  `https://api.etherscan.io/api?module=account&action=tokennfttx&address=${account}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`;

const ERC1155_GRAPH_QL_URL =
  'https://api.thegraph.com/subgraphs/name/alexvorobiov/eip1155subgraph';
const UNISWAP_GRAPH_QL_URL =
  'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
const COMPOUND_GRAPH_QL_URL =
  'https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2';

const APPROVAL_INPUT_DATA_PREFIX = {
  ERC20: '0x095ea7b3',
  ERC721: '0x095ea7b3',
  ERC1155: '0xa22cb465',
};

const OPENSEA_INPUT_DATA_PREFIX = {
  ATOMIC_MATCH: '0xab834bab',
};

const UNISWAP_INPUT_DATA_PREFIX = {
  CLAIM: '0x2e7ba6ef',
};

const handleLabelingFromEtherscan = async (account: string) => {
  const res = await fetch(FETCH_FIRST_TXS(account.toLowerCase()));
  if (res.ok) {
    const { result } = await res.json();

    const { txs } = result.reduce(
      (a: any, tx: any) => {
        const { txs, acc } = a;
        // first tx (zero-nonce)
        if (tx.nonce === '0' && tx.from.toLowerCase() === account) {
          return {
            acc,
            txs: {
              ...txs,
              'zero-nonce': {
                type: 'hash',
                id: tx.hash,
                title: 'The first tx',
                description: `${shortenHexString(
                  account,
                )}, your story begins at nonce zero.`,
              },
            },
          };
        }
        // first contract
        if (
          tx.contractAddress !== '' &&
          (!acc['first-contract'] ||
            parseInt(tx.timeStamp) < acc['first-contract'])
        ) {
          return {
            acc: { ...acc, 'first-contract': parseInt(tx.timeStamp) },
            txs: {
              ...txs,
              'first-contract': {
                type: 'hash',
                id: tx.hash,
                title: 'First contract',
                description: `In many ways, your first contract deployed represents a deep desire to be free.`,
              },
            },
          };
        }
        // first inbound eth tx
        if (
          tx.to === account &&
          BigNumber.from(tx.value).gt(ZERO) &&
          (!acc['first-eth-inbound'] ||
            parseInt(tx.timeStamp) < acc['first-eth-inbound'])
        ) {
          return {
            acc: { ...acc, 'first-eth-inbound': parseInt(tx.timeStamp) },
            txs: {
              ...txs,
              'first-eth-inbound': {
                type: 'hash',
                id: tx.hash,
                title: 'First eth inbound',
                description: `Whether from an exchange or income, this is your ETH.`,
              },
            },
          };
        }
        // highest value transferred tx
        if (
          BigNumber.from(tx.value).gt(ZERO) &&
          (!acc['highest-value-transferred'] ||
            BigNumber.from(tx.value).gt(acc['highest-value-transferred']))
        ) {
          return {
            acc: {
              ...acc,
              'highest-value-transferred': BigNumber.from(tx.value),
            },
            txs: {
              ...txs,
              'highest-value-transferred': {
                type: 'hash',
                id: tx.hash,
                title: 'Biggest ETH transfer',
                description: `Moving value so freely.`,
              },
            },
          };
        }
        // highest gasUsed
        if (
          BigNumber.from(tx.gasUsed).gt(ZERO) &&
          (!acc['highest-gas-used'] ||
            BigNumber.from(tx.gasUsed).gt(acc['highest-gas-used']))
        ) {
          return {
            acc: {
              ...acc,
              'highest-gas-used': BigNumber.from(tx.gasUsed),
            },
            txs: {
              ...txs,
              'highest-gas-used': {
                type: 'hash',
                id: tx.hash,
                title: 'Highest gas guzzler',
                description: `Who will stop you ever again doing such amazing things?`,
              },
            },
          };
        }
        // highest gasPrice
        if (
          BigNumber.from(tx.gasPrice).gt(ZERO) &&
          (!acc['highest-gas-price'] ||
            BigNumber.from(tx.gasPrice).gt(acc['highest-gas-price']))
        ) {
          return {
            acc: {
              ...acc,
              'highest-gas-price': BigNumber.from(tx.gasPrice),
            },
            txs: {
              ...txs,
              'highest-gas-price': {
                type: 'hash',
                id: tx.hash,
                title: 'Highest gas price',
                description: `Somethings we need speed, REAL speed.`,
              },
            },
          };
        }
        // lowest gasPrice
        if (
          BigNumber.from(tx.gasPrice).gt(ZERO) &&
          (!acc['lowest-gas-price'] ||
            BigNumber.from(tx.gasPrice).lt(acc['lowest-gas-price']))
        ) {
          return {
            acc: {
              ...acc,
              'lowest-gas-price': BigNumber.from(tx.gasPrice),
            },
            txs: {
              ...txs,
              'lowest-gas-price': {
                type: 'hash',
                id: tx.hash,
                title: 'Lowest gas price',
                description: `Either you were early or willing to wait.`,
              },
            },
          };
        }
        // first error
        if (
          tx.isError === '1' &&
          (!acc['first-error'] || parseInt(tx.timeStamp) < acc['first-error'])
        ) {
          return {
            acc: {
              ...acc,
              'first-error': parseInt(tx.timeStamp),
            },
            txs: {
              ...txs,
              'first-error': {
                type: 'hash',
                id: tx.hash,
                title: 'First error',
                description: `Oopsies, something went wrong. Can you try again?`,
              },
            },
          };
        }
        // first approve
        if (
          ((tx.input as string).startsWith(APPROVAL_INPUT_DATA_PREFIX.ERC20) ||
            (tx.input as string).startsWith(
              APPROVAL_INPUT_DATA_PREFIX.ERC721,
            ) ||
            (tx.input as string).startsWith(
              APPROVAL_INPUT_DATA_PREFIX.ERC1155,
            )) &&
          (!acc['first-approve'] ||
            parseInt(tx.timeStamp) < acc['first-approve'])
        ) {
          return {
            acc: {
              ...acc,
              'first-approve': parseInt(tx.timeStamp),
            },
            txs: {
              ...txs,
              'first-approve': {
                type: 'hash',
                id: tx.hash,
                title: 'First approve',
                description: `Power OVERWHELMING`,
              },
            },
          };
        }
        // first atomic match opensea
        if (
          (tx.input as string).startsWith(
            OPENSEA_INPUT_DATA_PREFIX.ATOMIC_MATCH,
          ) &&
          (!acc['first-trade-opensea'] ||
            parseInt(tx.timeStamp) < acc['first-trade-opensea'])
        ) {
          return {
            acc: {
              ...acc,
              'first-trade-opensea': parseInt(tx.timeStamp),
            },
            txs: {
              ...txs,
              'first-trade-opensea': {
                type: 'hash',
                id: tx.hash,
                title: 'First OpenSea trade',
                description: `Be the whale in the sea, not the minnows.`,
              },
            },
          };
        }
        // first uniswap airdrop
        if (
          (tx.input as string).startsWith(UNISWAP_INPUT_DATA_PREFIX.CLAIM) &&
          tx.to.toLowerCase() ===
            '0x090d4613473dee047c3f2706764f49e0821d256e' &&
          (!acc['first-airdrop-uniswap'] ||
            parseInt(tx.timeStamp) < acc['first-airdrop-uniswap'])
        ) {
          return {
            acc: {
              ...acc,
              'first-airdrop-uniswap': parseInt(tx.timeStamp),
            },
            txs: {
              ...txs,
              'first-airdrop-uniswap': {
                type: 'hash',
                id: tx.hash,
                title: 'UNI airdrop',
                description: `Receiving a part of the future because you are the future.`,
              },
            },
          };
        }
        return a;
      },
      { txs: {} as { [id: string]: AnnotatedHash }, acc: {} } as any,
    );

    return txs;
  }
  return {};
};

const handleLabelingFromErc20TransfersEtherscan = async (account: string) => {
  const res = await fetch(FETCH_FIRST_ERC_20_TXS(account.toLowerCase()));
  if (res.ok) {
    const { result } = await res.json();

    const { txs } = result.reduce(
      (a: any, tx: any) => {
        const { txs, acc } = a;
        // first erc20 transfer
        if (
          !acc['first-erc20-transfer'] ||
          parseInt(tx.timeStamp) < acc['first-erc20-transfer']
        ) {
          return {
            acc: { ...acc, 'first-erc20-transfer': parseInt(tx.timeStamp) },
            txs: {
              ...txs,
              'first-erc20-transfer': {
                hash: tx.hash,
                title: 'First erc20 transfer',
                description: `Transfer value built on top of the coolest network`,
              },
            },
          };
        }
        if (
          !acc['largest-erc20-transfer'] ||
          BigNumber.from(tx.value).gt(acc['largest-erc20-transfer'])
        ) {
          return {
            acc: { ...acc, 'largest-erc20-transfer': BigNumber.from(tx.value) },
            txs: {
              ...txs,
              'largest-erc20-transfer': {
                type: 'hash',
                id: tx.hash,
                title: 'Largest erc20 transfer',
                description: `Are you a whale or is this a shitcoin?`,
              },
            },
          };
        }
        return a;
      },
      { txs: {}, acc: {} } as any,
    );

    return txs;
  }
  return {};
};

const handleLabelingFromErc721TransfersEtherscan = async (account: string) => {
  const res = await fetch(FETCH_FIRST_ERC_721_TXS(account.toLowerCase()));
  if (res.ok) {
    const { result } = await res.json();

    const { txs } = result.reduce(
      (a: any, tx: any) => {
        const { txs, acc } = a;
        // first erc20 transfer
        if (
          !acc['first-erc721-transfer'] ||
          parseInt(tx.timeStamp) < acc['first-erc721-transfer']
        ) {
          return {
            acc: { ...acc, 'first-erc721-transfer': parseInt(tx.timeStamp) },
            txs: {
              ...txs,
              'first-erc721-transfer': {
                type: 'hash',
                id: tx.hash,
                title: 'First ERC721 transferred',
                description: `Whether from an exchange or minting, welcome to the new culture.`,
              },
            },
          };
        }
        return a;
      },
      { txs: {}, acc: {} } as any,
    );

    return txs;
  }
  return {};
};

const handleLabelingFromErc1155Subgraph = async (account: string) => {
  const res = await graphQlFetcher(
    ERC1155_GRAPH_QL_URL,
    `
    query {
      from: transfers(first: 1, orderBy: timestamp, orderDirection: asc,where: { from: "${account}" }) {
        transaction {
          id
          timestamp 
          blockNumber
        }
        to { id }
        from { id }
        timestamp
      }
      to: transfers(first: 1, orderBy: timestamp, orderDirection: asc,where: { to: "${account}" }) {
        transaction {
          id
        }
        to { id }
        from { id }
        timestamp
      }
    }
  `,
  );

  const { from, to } = res;

  let tx: any = {};

  if (!!from[0] && !!to[0]) {
    tx =
      parseInt(from[0].timestamp) < parseInt(to[0].timestamp) ? from[0] : to[0];
  } else {
    tx = from[0] ?? to[0];
  }

  return {
    'first-erc1155-transfer': !!tx
      ? {
          type: 'hash',
          id: tx.transaction.id,
          title: 'First ERC1155 transferred',
          description: `ERC1155, the ikea of tokens`,
        }
      : undefined,
  };
};

const handleLabelingFromUniswapSubgraph = async (account: string) => {
  const res = await graphQlFetcher(
    UNISWAP_GRAPH_QL_URL,
    `
    query {
      firstSwap: swaps(first: 1, orderBy:timestamp, orderDirection:asc, where: { to: "${account}"}) {
        id
        sender
        to 
        amount0In
        amount1In
        amount1Out
        amount0Out
        transaction {
          blockNumber
        }
      }
      firstMint: mints(first: 1,orderBy:timestamp, orderDirection:asc, where: { to: "${account}"}) {
        id
        sender
        to 
        amount0
        amount1
        transaction {
          blockNumber
        }
      }
    }
  `,
  );
  const { firstSwap, firstMint } = res;

  return {
    'first-uniswap-swap': !!firstSwap[0]
      ? {
          type: 'hash',
          id: firstSwap[0].id.split('-')[0],
          title: 'First Uniswap trade',
          description: `Who said unicorns don't exist?`,
        }
      : undefined,
    'first-uniswap-mint': !!firstMint[0]
      ? {
          type: 'hash',
          id: firstMint[0].id.split('-')[0],
          title: 'First Uniswap LP deposit',
          description: `Breathe life into the DEX world!`,
        }
      : undefined,
  };
};

const handleLabelingFromCompoundSubgraph = async (account: string) => {
  const res = await graphQlFetcher(
    COMPOUND_GRAPH_QL_URL,
    `
    query {
      firstMintEvents: mintEvents(first:1, orderDirection: asc, orderBy: blockTime, where: { to: "${account}"} ) {
        id
        amount
        blockNumber
        cTokenSymbol
        underlyingAmount
      }
      firstBorrowEvents: borrowEvents(first:1, orderDirection: asc, orderBy: blockTime, where: { borrower: "${account}"} ) {
        id
        amount
        accountBorrows
        blockNumber
        underlyingSymbol
      }
    }
  `,
  );
  const { firstMintEvents, firstBorrowEvents } = res;

  return {
    'first-compound-mint': !!firstMintEvents[0]
      ? {
          type: 'hash',
          id: firstMintEvents[0].id.split('-')[0],
          title: 'First Compound Finance deposit',
          description: `Making yield like no other.`,
        }
      : undefined,
    'first-compound-borrow': !!firstBorrowEvents[0]
      ? {
          type: 'hash',
          id: firstBorrowEvents[0].id.split('-')[0],
          title: 'First Compound Finance borrow',
          description: `Go and do things with no permission!`,
        }
      : undefined,
  };
};

const handleReview = async (req: NextApiRequest, res: NextApiResponse) => {
  const { address } = req.query;

  if (typeof address !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'address is not a valid value' });
    return;
  }
  if (!ADDRESS_REGEX.test(address)) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'address is not a valid value' });
    return;
  }

  const ensName = await MAINNET_PROVIDER.lookupAddress(address);

  const txns = await Promise.all([
    handleLabelingFromEtherscan(address.toLowerCase()),
    handleLabelingFromErc721TransfersEtherscan(address.toLowerCase()),
    handleLabelingFromErc20TransfersEtherscan(address.toLowerCase()),
    handleLabelingFromErc1155Subgraph(address.toLowerCase()),
    handleLabelingFromUniswapSubgraph(address.toLowerCase()),
    handleLabelingFromCompoundSubgraph(address.toLowerCase()),
  ]);

  const txnsMap = txns.reduce((a, c) => ({ ...a, ...c }), {});

  // generate Blocks
  const birthBlock = {
    id: 'birth',
    title: 'BIRTH',
    description:
      'In the midst of the early days, something happened; you wanted to see what this new phenomena is all about. You wanted to experience something new.',
    type: 'dynamic-grid',
    hashes: [
      txnsMap['first-contract'],
      txnsMap['first-eth-inbound'],
      txnsMap['first-approve'],
    ]
      .filter((t) => !!t)
      .slice(0, 2),
  } as DynamicGridBlockMetadata;

  const babyStepsBlock = {
    id: 'baby-steps',
    title: 'BABY STEPS',
    type: 'dynamic-grid',
    description:
      "It didn't take long for the majesty of the grand experiment that is ETH to spark your curiosity. Soon you took those scary, but ever important steps into a new world.",
    hashes: [txnsMap['first-error'], txnsMap['first-erc20-transfer']]
      .filter((t) => !!t)
      .slice(0, 2),
  } as DynamicGridBlockMetadata;

  const nftBlock = {
    id: 'nft',
    title: 'MEDIA',
    type: 'dynamic-grid',
    description:
      'Crypto-media; new found forms of empowering the creatives to be more creative. Welcome to the new economy of paint, pixels, and new capturing of culture.',
    hashes: [
      txnsMap['first-trade-opensea'],
      txnsMap['first-erc721-transfer'],
      txnsMap['first-erc1155-transfer'],
    ]
      .filter((t) => !!t)
      .slice(0, 2),
  } as DynamicGridBlockMetadata;

  const defiBlock = {
    id: 'defi',
    title: 'DEFI',
    type: 'dynamic-grid',
    description:
      'Defying all odds, a new financial frontier emerged. This new world, ever daunting as uncharted maps of days old, brings new riches to so many.',
    hashes: [
      txnsMap['first-uniswap-swap'],
      txnsMap['first-compound-mint'],
      txnsMap['first-uniswap-mint'],
    ]
      .filter((t) => !!t)
      .slice(0, 2),
  } as DynamicGridBlockMetadata;

  const biggestMomentsBlock = {
    id: 'biggest-moment',
    title: 'UR MOMENT',
    type: 'dynamic-grid',
    description:
      'As you continue onwards in your journey in crypto, each of your transaction, a imprint of your being, gets lost in the deep annals of crypto history. What was worth remembering?',
    hashes: [
      txnsMap['first-airdrop-uniswap'],
      txnsMap['highest-value-transferred'],
      txnsMap['largest-erc20-transfer'],
    ]
      .filter((t) => !!t)
      .slice(0, 2),
  } as DynamicGridBlockMetadata;

  const gasBlock = {
    id: 'gas',
    title: 'GAS',
    type: 'dynamic-grid',
    description:
      'In the complex economy that is crypto, we must participate in a fundamental haggling: gas prices. How much are you willing to pay to cut the line in carving your part in our past?',
    hashes: [
      txnsMap['highest-gas-used'],
      txnsMap['highest-gas-price'],
      txnsMap['lowest-gas-price'],
    ]
      .filter((t) => !!t)
      .slice(0, 2),
  } as DynamicGridBlockMetadata;

  // const heroBlock = {
  //   id: 'hero',
  //   title: 'HERO',
  //   type: 'hero',
  //   hashes: [txnsMap['zero-nonce']],
  //   description: `SAGA X ${ensName ?? shortenHexString(address)}`,
  // } as HeroBlockMetadata;

  // const creditsBlock = {
  //   id: 'credits',
  //   title: 'CREDITS',
  //   type: 'credits',
  //   hashes: [],
  //   account: address,
  //   description:
  //     'The story continues. Many moments of excitement, despair, relief are awaiting.',
  // } as CreditsBlockMetadata;

  // const emptyBlock = {
  //   id: 'empty',
  //   title: 'EMPTY',
  //   type: 'empty',
  //   hashes: [],
  //   description:
  //     'Your story has just begun. Take those steps first before we celebrate it.',
  // } as EmptyBlockMetadata;

  const data: HashCarouselData[] = flatten(
    [
      birthBlock,
      babyStepsBlock,
      nftBlock,
      defiBlock,
      biggestMomentsBlock,
      gasBlock,
    ].map((b) => b.hashes),
  ).filter((b) => !!b.id);

  // const dynamicBlocks = [
  //   birthBlock,
  //   babyStepsBlock,
  //   nftBlock,
  //   defiBlock,
  //   biggestMomentsBlock,
  //   gasBlock,
  // ].filter((b) => b.hashes.length !== 0);

  // const isReviewSufficient =
  //   dynamicBlocks.length > MIN_BLOCKS &&
  //   uniq(flatten(dynamicBlocks.map((b) => b.hashes))).length >
  //     MIN_UNIQUE_HASHES;

  // const blocks = isReviewSufficient
  //   ? [heroBlock, ...dynamicBlocks, creditsBlock]
  //   : [emptyBlock];

  res.setHeader(
    'Cache-Control',
    `public, no-transform, s-maxage=86400, max-age=86400`,
  );
  res.status(200).json({
    version: 0.01,
    id: `address-in-review-${address.toLowerCase()}`,
    title: `${ensName ?? shortenHexString(address)} - My SAGA`,
    description: `Capture the best, most memorable moments of your time in ETH.`,
    link: `${HASH_PROD_LINK}${
      ROUTES.COLLECTION
    }/my-saga/${address.toLowerCase()}`,
    data,
  } as CollectionContentMetadata);
};

export default handleReview;
