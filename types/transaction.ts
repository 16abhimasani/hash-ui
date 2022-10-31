import { TransactionReceipt } from '@ethersproject/providers';

export type TransactionStatus = 'in-progress' | 'success' | 'failed';

export type WalletActionStatus =
  | 'require-full-auth'
  | 'unknown'
  | 'init'
  | TransactionStatus;

export interface MintingTransactionMetadata {
  type: 'token-minting';
  txHashes: string[];
}

export interface MigratingTransactionMetadata {
  type: 'token-migrating';
  tokenIds: string[];
}

export interface UpdatingTokenMetadataTransactionMetadata {
  tokenId: string;
  type: 'updating-token-metadata';
}

export interface WritingOptimisticVerdictMetadataTransactionMetadata {
  writeHash: string;
  type: 'writing-optimistic-verdict';
}

export interface ApproveForTraderTransactionMetadata {
  tokenAddress: string;
  type: 'approve-for-trader';
}

export interface CancelTraderOrderTransactionMetadata {
  cid: string;
  type: 'cancel-trader-order';
}

export interface AcceptTraderOrderTransactionMetadata {
  cid: string;
  type: 'accept-trader-order';
}

export type TransactionMetadata =
  | MintingTransactionMetadata
  | MigratingTransactionMetadata
  | UpdatingTokenMetadataTransactionMetadata
  | ApproveForTraderTransactionMetadata
  | AcceptTraderOrderTransactionMetadata
  | CancelTraderOrderTransactionMetadata
  | WritingOptimisticVerdictMetadataTransactionMetadata;

export interface TransactionObject {
  hash: string;
  status: TransactionStatus;
  metadata: TransactionMetadata;
  receipt?: TransactionReceipt;
  lastBlockNumChecked?: number;
}

export type MintingStatus =
  | 'mintable'
  | 'no-more-editions'
  | 'insufficient-balance'
  | 'proud-owner'
  | 'minted'
  | 'too-recent'
  | TransactionStatus;
