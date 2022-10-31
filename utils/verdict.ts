import { utils } from 'ethers';
import {
  AffirmationWrite,
  SignedVerdictMetadataFromFirebase,
} from '../types/verdict';

export const getAffirmationWrite = (
  tokenId: string,
  verdictMetadata: SignedVerdictMetadataFromFirebase,
  salt: number,
): AffirmationWrite => {
  return {
    tokenId,
    key: verdictMetadata.verdict.contentHash,
    text: verdictMetadata.id,
    salt,
  };
};

export const getWriteHash = (write: AffirmationWrite) => {
  return utils.solidityKeccak256(
    ['uint256', 'string', 'string', 'uint256'],
    [write.tokenId, write.key, write.text, write.salt],
  );
};

export const getAffirmationHash = (
  write: AffirmationWrite,
  signer: string,
  salt: number,
) => {
  return utils.solidityKeccak256(
    ['bytes32', 'address', 'uint256'],
    [getWriteHash(write), signer, salt],
  );
};

export const getAffirmationHashWithWriteHash = (
  writeHash: string,
  signer: string,
  salt: number,
) => {
  return utils.solidityKeccak256(
    ['bytes32', 'address', 'uint256'],
    [writeHash, signer, salt],
  );
};

export const verifyIsVerdictMetadata = (verdictMetadata: any) => {
  return (
    !!verdictMetadata &&
    !(
      !verdictMetadata.properties.verdict ||
      !verdictMetadata.verdict.network ||
      !verdictMetadata.verdict.panel ||
      !verdictMetadata.verdict.txHash ||
      !verdictMetadata.verdict.contentHash ||
      !verdictMetadata.verdict.opinion ||
      !verdictMetadata.verdict.opinionType ||
      !verdictMetadata.signer ||
      !verdictMetadata.signature ||
      !verdictMetadata.createdAt ||
      !verdictMetadata.title ||
      !verdictMetadata.description ||
      !verdictMetadata.originalTitle ||
      !verdictMetadata.originalDescription
    )
  );
};
