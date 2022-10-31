import { BigNumber } from 'ethers';
import { invert } from 'lodash';
/**
 * Global app related constants
 */
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '1');
export const DEFAULT_PREVIEW_HASHES = [
  '0x1b6d3cc31110ec6dc949319d3db8dfecd6328d1a16ea9a14eee093d813b9837c',
  '0xe4daa77a0de5be96234872cc38fa04682c3d1cc4597e759ca272d12670a991fa',
];

/**
 * Data constants
 */
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export const NULL_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000';
export const ZERO = BigNumber.from(0);
export const MIN_BLOCK_CONFIRMATIONS = 30;
export const MINT_BLOCK_NUM = 244555;
export const HUNDRED_PERCENT_BPS = 10000;

/**
 * Environment/keys
 */
export const ALCHEMY_KEY =
  CHAIN_ID === 1
    ? process.env.NEXT_PUBLIC_ALCHEMY_KEY
    : process.env.NEXT_PUBLIC_TEST_ALCHEMY_KEY ?? '';
export const MAINNET_ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY || '';
export const ALGOLIA_API_CLIENT_ID = '3ISP80PWAF';
export const ALGOLIA_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || '';
export const ETHERSCAN_API_KEY = '';
export const COVALENT_API_KEY = '';
export const OPENSEA_API_KEY = '';
export const AIRTABLE_API_KEY = ``;
export const FIREBASE_ADMIN_CERT =
  process.env.FIREBASE_ADMIN_CERT ??
  JSON.stringify({
    project_id: 'hash-app',
    private_key: '',
    client_email: 'team@pob.studio',
  });
export const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY;
export const DISCORD_VERDICT_ACTIVITY_WEBHOOK_ID = ``;
export const DISCORD_VERDICT_ACTIVITY_WEBHOOK_TOKEN = ``;
export const DISCORD_MINTING_ACTIVITY_WEBHOOK_ID = ``;
export const DISCORD_MINTING_ACTIVITY_WEBHOOK_TOKEN = ``;

export const ALGOLIA_HASH_INDEX = 'hash_tokens';
export const ALGOLIA_USER_METADATA_INDEX = 'hash-user-metadatas';
export const ALGOLIA_TAGS_INDEX = 'hash-tags';

/**
 * trader
 */
export const RELAYER_DOMAIN = 'hash-relayer';
// bytes4(keccak256(RELAYER_DOMAIN));
export const RELAYER_DOMAIN_HASH = '0x22b8a7ea';

export const TRADABLE_ASSETS = {
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  // LONDON: '0x491d6b7d6822d5d4bc88a1264e1b47791fd8e904',
  ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
};
export type TradableAssetSymbol = keyof typeof TRADABLE_ASSETS;
export const ADDRESS_TO_TRADABLE_ASSET_SYMBOL = invert(TRADABLE_ASSETS);

export const ORDER_INFINITE_EXPIRY = 2524604400;

export const DEFAULT_LISTING_TRADABLE_ASSET: TradableAssetSymbol = 'ETH';
export const DEFAULT_BIDDABLE_TRADABLE_ASSET: TradableAssetSymbol = 'WETH';

export const BIDDABLE_TRADABLE_ASSETS: TradableAssetSymbol[] = ['WETH'];

export const RECEIVABLE_TRADABLE_ASSETS: TradableAssetSymbol[] = ['ETH'];

export const FEE_TRADABLE_ASSETS: TradableAssetSymbol[] = ['ETH', 'WETH'];

export const MARKET_FEE_AMOUNT_BPS = 500;

/**
 * Links
 */
export const IPFS_LINK = `https://public-pob-studio.mypinata.cloud/ipfs`;
export const IPFS_FALLBACK_LINKS = [
  (hash: string, url: string) => `${IPFS_LINK}/${hash}/${url}`,
  (hash: string, url: string) => `https://ipfs.io/ipfs/${hash}/${url}`,
  (hash: string, url: string) => `https://${hash}.ipfs.dweb.link/${url}`,
];
export const PRIVATE_GATEWAY_IPFS_LINK = `https://public-pob-studio.mypinata.cloud/ipfs`;
export const STUDIO_PROD_LINK = 'https://pob.studio';
export const SHOP_PROD_LINK = 'https://shop.pob.studio';
export const ZERO_EX_LINK = 'https://0x.org/';
export const HASH_PROD_LINK = 'https://hash.pob.studio';
export const LONDON_PROD_LINK = 'https://london.pob.studio';
export const PUBLICO_PROD_LINK = 'https://publico.pob.studio';
export const SNAPSHOT_LINK = 'https://snapshot.org';
export const UNISWAP_GRAPH_QL =
  'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
export const BLOG_LINK = `https://pob.mirror.xyz/`;
export const TWITTER_LINK = `https://twitter.com/prrfbeauty`;
export const HISTORIANS_TWITTER_LINK = `https://twitter.com/HistoriansDAO`;
export const DISCORD_LINK = `https://discord.gg/pob`;
export const WHAT_IS_ALL_NONSENSE_LINK = `https://pob.mirror.xyz/MU9tqPtQBQYnL8Razw5HjF1koltdJDEp9-N6Z6P0AXY`;
export const WHAT_IS_ALL_NONSENSE_LINK_SAGA = `https://pob.mirror.xyz/Ep7nUgI52SGreSLE2-wVEEDZ8wF3wEOkaZDMURl__VU`;
export const WHAT_IS_ALL_NONSENSE_LINK_HUNT = `https://twitter.com/prrfbeauty/status/1509929285326417921?s=20&t=spn_9Zd8QWFDlBCJWT9D6g`;
export const HISTORIAN_DAO_LEARN_MORE_LINK = `https://pob.mirror.xyz/viCa_nhTUcCuu5kqBhtlLK6JG3o_n5oKi3cODvKaN-8`;
export const NFT_LICENSE_LINK = `https://www.nftlicense.org`;
export const WHAT_ARE_TOPICS = `https://ethereum.stackexchange.com/questions/12950/what-are-solidity-events-and-how-they-are-related-to-topics-and-logs`;
export const OPENSEA_LINK = `https://opensea.io/collection/proof-of-beauty`;
export const OPENSEA_LINK_V3 = `https://opensea.io/collection/hash-by-pob`;
export const SEASON_LINK = `https://pob.mirror.xyz/sYwTYMryS_OyfFUT8izHpfomHPGWFmgZ9IXCs0eSQCA`;
export const GITHUB_LINK = `https://github.com/proofofbeauty/gateway`;
export const IPFS_GATEWAY_LINK = `https://bafybeigqa2kstuhkvfzonokpxwh65f2bmhkyxux2lqhzbagdv3um7dmbuq.ipfs.dweb.link`;
export const PREVIEW_IMAGE_LINK = `https://hash-preview.vercel.app`;
export const POB_SUBGRAPH_LINK = `https://api.thegraph.com/subgraphs/name/proofofbeauty/hash`;
export const POB_TEST_SUBGRAPH_LINK = `https://api.thegraph.com/subgraphs/name/proofofbeauty/hash-rinkeby`;
export const LONDON_SUBGRAPH_LINK =
  'https://api.thegraph.com/subgraphs/name/proofofbeauty/london';
export const LONDON_TEST_SUBGRAPH_LINK =
  'https://api.thegraph.com/subgraphs/name/proofofbeauty/london-rinkeby';
export const NFT_20_LINK = `https://nft20.io/asset/0xea0f9d5f5c2fc5dd39722d536562cad3e89a8666`;
export const NFT_20_UNISWAP_POOL = `https://v2.info.uniswap.org/pair/0x73b065b3bfd6ad817e6760dc11be180362702262`;

// OG banners
export const GLOBAL_OG_BANNER = `${HASH_PROD_LINK}/assets/og/logo-repeat.png`;
export const ZINE_POH_V1_ASSETS = `${HASH_PROD_LINK}/imgs/zines/poh/v1`;
export const ZINE_POH_V1_BLOG = `https://pob.mirror.xyz/vj7zYf49rLoii2tGT6i09n1crN__oCnEX1zABGE4uB0`;
export const ZINE_POH_V1_AUCTION = `https://pob.mirror.xyz/auctions/0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7/3476`;

/**
 * Dimensions
 */
export const HEADER_HEIGHT = 84;
