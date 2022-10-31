import { BigNumber } from '@ethersproject/bignumber';

export interface UnsignedText {
  writer: string;
  text: string;
  txHash: string;
  fee: string;
  createdAt: number;
}
export interface SignedText extends UnsignedText {
  signature: string;
}

export interface SignedTextWithMetadata extends SignedText {
  key: string;
  id: string;
  ipfsContentDump: string;
}

export interface SignedTip {
  version: 2;
  writeHash: string;
  tipper: string;
  value: BigNumber;
  signature: string;
}

export interface PartialSignedRequest {
  signer: string;
  signature: string;
}

export interface UnsignedAccount {
  account: string;
  createdAt: number;
}
export interface SignedAccount extends UnsignedAccount {
  signature: string;
}
