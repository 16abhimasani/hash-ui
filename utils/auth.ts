import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { utils } from 'ethers';
import { admin } from '../clients/firebase-server';
import { SignedAccount, UnsignedAccount } from '../types/signing';
import { getSignedAccountSignedMessage } from './signing';
import { lowerCaseCheck } from './string';

export const ADMIN_FIRESTORE = admin.firestore();

export const getUserToken = async ({ account }: UnsignedAccount) => {
  try {
    const userToken = await admin.auth().createCustomToken(account);
    return userToken;
  } catch (error) {
    console.error('Error creating custom token: ', error);
  }
  return undefined;
};

export const isUserSignatureValid = async ({
  signature,
  account,
  createdAt,
}: SignedAccount) => {
  try {
    const docFirebaseRef = ADMIN_FIRESTORE.collection(
      FIRESTORE_ROUTES.USER_SIGNATURES,
    ).doc(signature);
    const document = await docFirebaseRef.get();
    if (document.exists) {
      console.error('Invalid Signature: already exists ', document.data());
      return false;
    }

    const textHash = getSignedAccountSignedMessage({ account, createdAt });
    const signatureValid = lowerCaseCheck(
      utils.verifyMessage(textHash, signature),
      account,
    );
    if (signatureValid) {
      await docFirebaseRef.set({
        account,
        createdAt,
      });
      return signatureValid;
    }
  } catch (error) {
    console.error('Error validating user signature: ', error);
  }
  return false;
};
