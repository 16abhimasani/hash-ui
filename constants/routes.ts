export const ROUTES = {
  INDEX: '/',
  NOT_FOUND: '/404',
  CONTRACTS: '/contracts',
  // TODO(dave4506): add API routes
  API: {
    AUTH: {
      LOGIN: '/api/auth',
      TWITTER: '/api/auth/twitter',
      TWITTER_HYDRATE: '/api/auth/twitter-hydrate',
    },
    COLLECTION: {
      INDEX: '/api/collection',
      REVIEW: '/api/collection/review',
    },
    VERDICT: {
      CHANGE_STATUS: '/api/verdict/change-status',
      CREATE: '/api/verdict/create',
      VOTE: '/api/verdict/vote',
      REQUEST: '/api/verdict/request',
    },
    TOKEN_METADATA: {
      TAGS: '/api/token-metadata/tags',
      CREATE: '/api/token-metadata/create',
      CREATE_SIGNED_TEXT: '/api/token-metadata/create-signed-text',
      BASE: '/api/token-metadata/base',
      OPTIMISTIC: '/api/token-metadata/optimistic',
      DOCUMENTS_AND_INFOS: '/api/token-metadata/documents-and-infos',
    },
    PROXY: {
      ADDRESS_NAME: '/api/proxy/address-name',
      HASH: '/api/proxy/hash',
      OWNERS: '/api/proxy/owners',
      TOKEN_ID: '/api/proxy/token-id',
      TOKEN_IDS: '/api/proxy/token-ids',
      RESOLVE_ENS: '/api/proxy/resolve-ens',
      LOOKUP_ADDRESS: '/api/proxy/lookup-address',
      TIME_STAMP: '/api/proxy/time-stamp',
      MIGRATED: '/api/proxy/migrated',
      MAX_INDEX: '/api/proxy/max-index',
    },
    NFT: {
      METADATA: '/api/nft/metadata',
      CONTRACT_METADATA: '/api/nft/contract-metadata',
      HASH_OWNED: '/api/nft/hash-owned',
    },
    OPENSEA: {
      METADATA: '/api/opensea/metadata',
    },
    TRADER: {
      BID: '/api/trader/bid',
      LIST: '/api/trader/list',
      ORDER_STATUS: '/api/trader/order-status',
    },
    PRERENDER: '/api/prerender',
    IPFS: {},
  },
  ART: {
    INDEX: '/art',
    HASH: {
      EDIT: '/edit',
    },
  },
  COLLECTION: '/collection',
  PALETTE: '/palette',
  GALLERY: '/explore',
  EXPLORE: {
    INDEX: '/explore',
    COMMENTS: '/explore/comments',
  },
  ACCOUNT: '/account',
  LEGAL: '/legal',
  FAQ: '/faq',
  MARKET: '/market',
  TAGS: '/tags',
  SEASON: {
    INDEX: '/s/0',
    GENESIS: '/s/0',
  },
  ZINE: {
    POHV1: '/zine/poh-v1',
  },
  PREVIEW: {
    ART: '/preview/art',
    PALETTE: '/preview/palette',
    INDEX: '/preview',
  },
  HISTORIANS: {
    INDEX: '/dao',
  },
  DAO: '/dao',
  CART: '/cart',
  TOU: '/terms-of-use',
  PRIVACY: '/privacy-policy',
  USER: '/user',
};

export const PREVIEW_ROUTES = {
  ART: '/api/preview/art',
  PRINTED_ART: '/api/preview/printed-art',
  DEFAULT: '/api/preview',
  PALETTE: '/api/preview/palette',
};
