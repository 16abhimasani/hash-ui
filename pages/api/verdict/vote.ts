import { deployments, HashRegistryV2__factory } from '@hash/protocol';
import { NextApiRequest, NextApiResponse } from 'next';
import { NFTStorage } from 'nft.storage';
import { admin } from '../../../clients/firebase-server';
import { PROVIDER } from '../../../clients/provider';
import { CHAIN_ID, NFT_STORAGE_API_KEY } from '../../../constants';

const client = new NFTStorage({ token: NFT_STORAGE_API_KEY ?? '' });
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
  res.status(410).json({ statusCode: 422, message: 'deprecated' });
  return;
  // const write = req.body.write;
  // const { signer, signature, ...verdictPayload } = req.body.write;

  // if (!isHistorian(signer)) {
  //   res
  //     .status(403)
  //     .json({ statusCode: 403, message: 'signer is not historian' });
  //   return;
  // }

  // if (
  //   utils.verifyMessage(JSON.stringify(verdictPayload), signature) !== signer
  // ) {
  //   res.status(422).json({ statusCode: 422, message: 'invalid signed data' });
  //   return;
  // }

  // try {
  //   const writeHash = getWriteHash(write);
  //   const verdictRef = firestore
  //     .collection(FIRESTORE_VERDICT_METADATA_COLLECTION_ID)
  //     .doc(write.text);
  //   const verdict = (await verdictRef.get()).data();

  //   if (!verdict) {
  //     res
  //       .status(422)
  //       .json({ statusCode: 422, message: 'verdict does not exist' });
  //     return;
  //   }

  //   const affirmationQuery = firestore
  //     .collection(FIRESTORE_VERDICT_METADATA_COLLECTION_ID)
  //     .doc(write.text)
  //     .collection(FIRESTORE_AFFIRMATION_SUBCOLLECTION_ID)
  //     .where('affirmation.signer', '==', affirmation.signer);

  //   const affirmationQuerySnapshot = await affirmationQuery.get();

  //   if (!affirmationQuerySnapshot.empty) {
  //     res.status(403).json({ statusCode: 403, message: 'already voted' });
  //     return;
  //   }

  //   if (verdict?.offChainMetadata.hold) {
  //     res.status(422).json({ statusCode: 422, message: 'verdict on hold' });
  //     return;
  //   }

  //   const metadata = { write, affirmation, writeHash, id: '' };
  //   const metadataBlob = new Blob([JSON.stringify(metadata)]);
  //   const cid = await client.storeBlob(metadataBlob);

  //   metadata.id = cid;

  //   await firestore.runTransaction(async (t) => {
  //     const verdictRes = await t.get(verdictRef);
  //     if (!verdictRes.exists) {
  //       throw 'Document does not exist!';
  //     }
  //     t.update(verdictRef, {
  //       'offChainMetadata.numAffirmations': FieldValue.increment(1),
  //       'offChainMetadata.affirmers': FieldValue.arrayUnion(affirmation.signer),
  //     });
  //     t.set(
  //       verdictRef.collection(FIRESTORE_AFFIRMATION_SUBCOLLECTION_ID).doc(cid),
  //       { ...metadata, createdAt: FieldValue.serverTimestamp() },
  //     );
  //   });

  //   const embed = await createVoteDiscordEmbed(
  //     PROVIDER,
  //     verdict as any,
  //     metadata,
  //   );
  //   await discordClient.send(embed);
  //   if (!!verdict) {
  //     const owner = await hashRegistry.ownerOfByTxHash(verdict.verdict.txHash);
  //     await createVotedVerdictMetadataAlert(
  //       verdict.verdict.txHash,
  //       verdict.signer,
  //       affirmation.signer,
  //       owner,
  //     );
  //   }

  //   res.status(200).json({ statusCode: 200, success: true, metadata });
  // } catch (e) {
  //   console.log(e);
  //   res
  //     .status(500)
  //     .json({ statusCode: 500, error: e, message: 'Something went wrong' });
  // }
};

export default handle;
