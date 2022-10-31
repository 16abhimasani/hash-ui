import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { deployments, HashV2__factory } from '@hash/protocol';
import { NextApiRequest, NextApiResponse } from 'next';
import { admin } from '../../../clients/firebase-server';
import { PROVIDER } from '../../../clients/provider';
import { CHAIN_ID, ZERO } from '../../../constants';
import { DAO_ROLES } from '../../../types/dao';
import { SignedAccount } from '../../../types/signing';
import { UserMetadata } from '../../../types/user';
import { getUserToken, isUserSignatureValid } from '../../../utils/auth';
import { ADDRESS_REGEX } from '../../../utils/regex';

const firestore = admin.firestore();

const hash = HashV2__factory.connect(deployments[CHAIN_ID].nft.v2, PROVIDER);

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(400).json({ statusCode: 400, message: 'Bad Request' });
    return;
  }

  const { account, signature, createdAt }: SignedAccount = req.body;

  if (typeof account !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'account is not a valid value' });
    return;
  }
  if (!ADDRESS_REGEX.test(account as string)) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'account is not a valid value' });
    return;
  }

  if (!signature) {
    res.status(422).json({ statusCode: 422, message: 'signature missing' });
    return;
  }

  if (!createdAt) {
    res.status(422).json({ statusCode: 422, message: 'timestamp missing' });
    return;
  }

  const valid = await isUserSignatureValid({ account, createdAt, signature });

  if (!valid) {
    res.status(422).json({ statusCode: 422, message: 'invalid signed data' });
    return;
  }

  const token = await getUserToken({ account, createdAt });

  const isHistorian = DAO_ROLES.historian.includes(account);
  const isOrganizer = DAO_ROLES.organizer.includes(account);

  const userRef = firestore
    .collection(FIRESTORE_ROUTES.USER_METADATAS)
    .doc(account);
  const snapshot = await userRef.get();
  const isHashOwned = (await hash.balanceOf(account)).gt(ZERO);
  const isHunter = snapshot.data()?.isTwitterLinked || isHashOwned;
  const userData = {
    address: account,
    roles: {
      hunter: isHunter,
      historian: isHistorian,
      organizer: isOrganizer,
    },
  } as UserMetadata;
  if (!snapshot.data()) {
    await userRef.set(userData);
  } else {
    await userRef.update(userData);
  }
  if (!token) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'error creating firebase web token' });
    return;
  }

  res.status(200).json({ token, account });
};

export default handle;
