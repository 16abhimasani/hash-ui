import { BigNumber, utils } from 'ethers';
import { UnsignedAccount, UnsignedText } from '../types/signing';

export const getSignedTextHash = ({
  fee,
  txHash,
  writer,
  text,
  createdAt,
}: UnsignedText) => {
  return utils.solidityKeccak256(
    ['address', 'string', 'uint256', 'uint256', 'uint256'],
    [writer, text, BigNumber.from(txHash), BigNumber.from(fee), createdAt],
  );
};

export const getSignedAccountHash = ({
  account,
  createdAt,
}: UnsignedAccount) => {
  return utils.solidityKeccak256(['address', 'uint256'], [account, createdAt]);
};

export const getSignedAccountSignedMessage = ({
  account,
  createdAt,
}: UnsignedAccount) => {
  return getSignedAccountSignedMessageByHash(
    getSignedAccountHash({
      account,
      createdAt,
    }),
  );
};

export const getSignedAccountSignedMessageByHash = (hash: string) => {
  return `Sign this message to authenticate into hash.pob.studio. entropy: ${hash}`;
};

export const getVerificationTweetWithSignature = (signature: string) => {
  const tweet =
    `Verifying my Twitter for hash.pob.studio\n` +
    `< via @prrfbeauty + @HistoriansDAO >\n` +
    `---\n` +
    `sig:${signature}`;
  return tweet;
};
