import { BigNumberish } from 'ethers';

// HACK: expose 0xv4 types
export type FeeStruct = {
  recipient: string;
  amount: BigNumberish;
  feeData: string | Array<number>;
};

export type PropertyStruct = {
  propertyValidator: string;
  propertyData: string | Array<number>;
};

export type ERC721OrderStruct = {
  direction: BigNumberish;
  maker: string;
  taker: string;
  expiry: BigNumberish;
  nonce: BigNumberish;
  erc20Token: string;
  erc20TokenAmount: BigNumberish;
  fees: FeeStruct[];
  erc721Token: string;
  erc721TokenId: BigNumberish;
  erc721TokenProperties: PropertyStruct[];
};

export interface SignedERC721OrderStruct extends ERC721OrderStruct {
  signature: SignatureStruct;
}

export type SignatureStruct = {
  signatureType: number; // 2 for EIP-712
  v: number;
  r: string;
  s: string;
};

export enum TradeDirection {
  SellNFT = 0,
  BuyNFT = 1,
}

export enum OrderStatus {
  Invalid = 0,
  Fillable = 1,
  Unfillable = 2,
  Expired = 3,
}

export interface SignedOrderWithCidAndOrderStatus
  extends SignedERC721OrderStruct {
  cid: string;
  orderStatus?: OrderStatus;
  hash: string;
  erc20AssetAmountNum: number;
  isFilled: boolean;
  filledAtBlockNum?: number;
  filledAt?: number;
  filledTxHash?: string;
  filledTakerAddress?: string;
  createdAt: number;
  lastActivityAt?: number;
}
