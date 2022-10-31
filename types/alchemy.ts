export interface AlchemyNftResponseData {
  contract: {
    address: string;
  };
  id: {
    tokenId: string;
    hashTxn?: string;
  };
  balance: string;
}

export interface AlchemyGetNftsResponse {
  ownedNfts: AlchemyNftResponseData[];
  pageKey?: string;
  totalCount: string;
  blockHash: string;
}

export interface AlchemyGetNftsFetchParams {
  owner: string;
  contracts?: string[];
  pageKey?: string;
}
