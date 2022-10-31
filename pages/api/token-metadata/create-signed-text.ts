import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { deployments, HashRegistryV2__factory } from '@hash/protocol';
import { utils } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { admin } from '../../../clients/firebase-server';
import { PROVIDER } from '../../../clients/provider';
import { CHAIN_ID } from '../../../constants';
import { TOKEN_METADATA_HASH_TO_READABLE_KEYS_MAP } from '../../../types/metadata';
import { SignedText } from '../../../types/signing';
import { createUpdatedMetadataAlert } from '../../../utils/alert-server';
import { getIPFSMetadata } from '../../../utils/ipfs-metadata';
import { TX_HASH_REGEX } from '../../../utils/regex';
import { getSignedTextHash } from '../../../utils/signing';

const firestore = admin.firestore();

const hashRegistry = HashRegistryV2__factory.connect(
  deployments[CHAIN_ID].registry.hash,
  PROVIDER,
);

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(400).json({ statusCode: 400, message: 'Bad Request' });
    return;
  }

  const { hash, key, signedText } = req.body;

  if (typeof hash !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'txHash is not a valid value' });
    return;
  }
  if (!TX_HASH_REGEX.test(hash as string)) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'txHash is not a valid value' });
    return;
  }

  if (typeof key !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'key is not a valid value' });
    return;
  }
  if (!(TOKEN_METADATA_HASH_TO_READABLE_KEYS_MAP as any)[key]) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'key is not a valid value' });
    return;
  }

  if (
    !signedText.txHash ||
    !signedText.writer ||
    !signedText.text ||
    !signedText.createdAt ||
    !signedText.fee ||
    !signedText.signature
  ) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'verdict missing values' });
    return;
  }

  if (!TX_HASH_REGEX.test(signedText.txHash as string)) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'txHash is not a valid value' });
    return;
  }

  if (hash !== signedText.txHash) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'txHash is not a valid value' });
    return;
  }

  const { signature, writer, text, txHash, createdAt, fee } =
    signedText as SignedText;

  const owner = await hashRegistry.ownerOfByTxHash(hash);

  const userSnapshot = await firestore
    .collection(FIRESTORE_ROUTES.USER_METADATAS)
    .doc(writer)
    .get();
  const data = userSnapshot.data();
  const isWriterScribeOrHistorian = data?.roles.historian || data?.roles.scribe;

  if (!isWriterScribeOrHistorian) {
    if (owner !== writer) {
      res.status(403).json({
        statusCode: 403,
        message: 'signer is not historian, scribe or owner',
      });
      return;
    }
  }

  const textHash = getSignedTextHash({ writer, txHash, text, createdAt, fee });
  const bytesHash = utils.arrayify(textHash);

  if (utils.verifyMessage(bytesHash, signature) !== writer) {
    res.status(422).json({ statusCode: 422, message: 'invalid signed data' });
    return;
  }

  try {
    const signedTextCollectionRef = firestore
      .collection(FIRESTORE_ROUTES.SIGNED_TEXTS)
      .doc(`${hash}-${key}-${createdAt}`);
    const ipfsMetadata = await getIPFSMetadata(text);
    await signedTextCollectionRef.set({
      ...signedText,
      hash,
      key,
      ipfsContentDump: JSON.stringify(ipfsMetadata),
    });
    await createUpdatedMetadataAlert(hash, writer, owner);
    res.status(200).json({ signedText, hash });
  } catch (e) {
    console.log(e);
    res.status(500).json({ statusCode: 500, message: 'Something went wrong' });
  }
};

export default handle;
