import { NftSwapV4 } from '@traderxyz/nft-swap-sdk';
import { Wallet } from 'ethers';
import { CHAIN_ID } from '../constants';
import { PROVIDER } from './provider';

// DUMMY SIGNER, DO NOT USE PRIVATE KEY
const dummySigner = new Wallet(
  '0x3ec7b4e35dcee5d2ee27445bbbed3965d48e965f91b1aad92f18a46b3f7f82ef',
  PROVIDER,
);

export const traderClient = new NftSwapV4(PROVIDER, dummySigner, CHAIN_ID);
