import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import { getSeasonFromTokenId } from '@hash/seasons';
import { NULL_ADDRESS } from '../constants';
import { padHexString } from '../utils/hex';
import { getAddressFromTopic } from './utils';

export type CustomTagFunc = (
  hash: string,
  tokenId: string | undefined,
  transaction: TransactionResponse,
  receipt: TransactionReceipt,
  tokenMetadata?: any,
) => Promise<boolean>;

export type LiveCustomTagFunc = (
  hash: string,
  tokenId: string | undefined,
  tokenMetadata?: any,
) => Promise<boolean>;

export const LIVE_CUSTOM_TAG_FUNCS: { [funcName: string]: LiveCustomTagFunc } =
  {
    isVerified: async (
      hash: string,
      tokenId: string | undefined,
      tokenMetadata?: any,
    ): Promise<boolean> => {
      // if (!!tokenMetadata) {
      //   return tokenMetadata?.metadata.verdict?.opinionType === 'verified';
      // }
      return false;
    },
    isDisputed: async (
      hash: string,
      tokenId: string | undefined,
      tokenMetadata?: any,
    ): Promise<boolean> => {
      // if (!!tokenMetadata) {
      //   return tokenMetadata?.metadata.verdict?.opinionType === 'disputed';
      // }
      return false;
    },
  };

export const CUSTOM_TAG_FUNCS: { [funcName: string]: CustomTagFunc } = {
  isVerified: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    if (!!tokenMetadata) {
      return tokenMetadata?.metadata.verdict?.opinionType === 'verified';
    }
    return false;
  },
  isDisputed: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    if (!!tokenMetadata) {
      return tokenMetadata?.metadata.verdict?.opinionType === 'disputed';
    }
    return false;
  },
  isGenesis: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    if (!tokenId) return false;
    return getSeasonFromTokenId(tokenId) === 'genesis';
  },
  isSagaGrant: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    if (!tokenId) return false;
    const tokenTypePrefixFromTokenId = tokenId.slice(0, 34);
    return '0x8000000000000000000000000000000500000000000000000000000000000000'.startsWith(
      tokenTypePrefixFromTokenId,
    );
  },
  isSagaPersonal: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    if (!tokenId) return false;
    const tokenTypePrefixFromTokenId = tokenId.slice(0, 34);
    return '0x8000000000000000000000000000000300000000000000000000000000000000'.startsWith(
      tokenTypePrefixFromTokenId,
    );
  },
  isSagaHistoric: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    if (!tokenId) return false;
    const tokenTypePrefixFromTokenId = tokenId.slice(0, 34);
    return '0x8000000000000000000000000000000400000000000000000000000000000000'.startsWith(
      tokenTypePrefixFromTokenId,
    );
  },
  isHunt: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    if (!tokenId) return false;
    return getSeasonFromTokenId(tokenId) === 'hunt';
  },
  isContractCreation: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    return !transaction.to && receipt.contractAddress !== NULL_ADDRESS;
  },
  isBurn: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    const erc20And721TransferAccounts = receipt.logs
      .filter(
        (l) =>
          l.topics[0] ===
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      )
      .map(
        (l) =>
          [
            getAddressFromTopic(l.topics[1]),
            getAddressFromTopic(l.topics[2]),
          ] as [string | undefined, string | undefined],
      );
    return erc20And721TransferAccounts.reduce(
      (a: boolean, [from, to]: [string | undefined, string | undefined]) => {
        if (from !== NULL_ADDRESS && to === NULL_ADDRESS) {
          return true;
        }
        return a;
      },
      false,
    );
  },
  isMint: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    const erc20And721TransferAccounts = receipt.logs
      .filter(
        (l) =>
          l.topics[0] ===
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      )
      .map(
        (l) =>
          [
            getAddressFromTopic(l.topics[1]),
            getAddressFromTopic(l.topics[2]),
          ] as [string | undefined, string | undefined],
      );

    return erc20And721TransferAccounts.reduce(
      (a: boolean, [from, to]: [string | undefined, string | undefined]) => {
        if (from === NULL_ADDRESS && to !== NULL_ADDRESS) {
          return true;
        }
        return a;
      },
      false,
    );
  },
  isTwoZeroes: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    const paddedHash = padHexString(hash);
    return (
      paddedHash.includes(`0x${'0'.repeat(2)}`) &&
      paddedHash.charAt(2 + 2) !== '0'
    );
  },
  isThreeZeroes: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    const paddedHash = padHexString(hash);
    return (
      paddedHash.includes(`0x${'0'.repeat(3)}`) &&
      paddedHash.charAt(2 + 3) !== '0'
    );
  },
  isFourZeroes: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    const paddedHash = padHexString(hash);
    return (
      paddedHash.includes(`0x${'0'.repeat(4)}`) &&
      paddedHash.charAt(2 + 4) !== '0'
    );
  },
  isFiveZeroes: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    const paddedHash = padHexString(hash);
    return (
      paddedHash.includes(`0x${'0'.repeat(5)}`) &&
      paddedHash.charAt(2 + 5) !== '0'
    );
  },
  isSixZeroes: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    const paddedHash = padHexString(hash);
    return (
      paddedHash.includes(`0x${'0'.repeat(6)}`) &&
      paddedHash.charAt(2 + 6) !== '0'
    );
  },
  isSevenZeroes: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    const paddedHash = padHexString(hash);
    return (
      paddedHash.includes(`0x${'0'.repeat(7)}`) &&
      paddedHash.charAt(2 + 7) !== '0'
    );
  },
  isEightZeroes: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    const paddedHash = padHexString(hash);
    return (
      paddedHash.includes(`0x${'0'.repeat(8)}`) &&
      paddedHash.charAt(2 + 8) !== '0'
    );
  },
  isNineZeroes: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    const paddedHash = padHexString(hash);
    return (
      paddedHash.includes(`0x${'0'.repeat(9)}`) &&
      paddedHash.charAt(2 + 9) !== '0'
    );
  },
  isTenZeroes: async (
    hash: string,
    tokenId: string | undefined,
    transaction: TransactionResponse,
    receipt: TransactionReceipt,
    tokenMetadata?: any,
  ): Promise<boolean> => {
    const paddedHash = padHexString(hash);
    return (
      paddedHash.includes(`0x${'0'.repeat(10)}`) &&
      paddedHash.charAt(2 + 10) !== '0'
    );
  },
};
