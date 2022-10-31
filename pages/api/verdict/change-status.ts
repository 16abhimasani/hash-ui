import { deployments, HashRegistryV2__factory } from '@hash/protocol';
import { NextApiRequest, NextApiResponse } from 'next';
import { admin } from '../../../clients/firebase-server';
import { PROVIDER } from '../../../clients/provider';
import { CHAIN_ID } from '../../../constants';

const firestore = admin.firestore();

const hashRegistry = HashRegistryV2__factory.connect(
  deployments[CHAIN_ID].registry.hash,
  PROVIDER,
);

const handleChangeVerdictStatus = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (req.method !== 'POST') {
    res.status(400).json({ statusCode: 400, message: 'Bad Request' });
    return;
  }

  res.status(410).json({ statusCode: 422, message: 'deprecated' });
  return;

  // const { verdictId, hold, signature, signer } = req.body;

  // if (
  //   !verdictId ||
  //   hold === undefined ||
  //   hold === null ||
  //   !signature ||
  //   !signer
  // ) {
  //   res.status(422).json({ statusCode: 422, message: 'missing values' });
  //   return;
  // }

  // // if (!isHistorian(signer)) {
  // //   res
  // //     .status(403)
  // //     .json({ statusCode: 403, message: 'signer is not historian' });
  // //   return;
  // // }

  // if (
  //   utils.verifyMessage(JSON.stringify({ verdictId, hold }), signature) !==
  //   signer
  // ) {
  //   res.status(422).json({ statusCode: 422, message: 'invalid signed data' });
  //   return;
  // }

  // try {
  //   const verdictRef = firestore
  //     .collection(FIRESTORE_VERDICT_METADATA_COLLECTION_ID)
  //     .doc(verdictId);
  //   await firestore.runTransaction(async (t) => {
  //     const verdictRes = await t.get(verdictRef);
  //     const signedVerdict = verdictRes.data();
  //     if (!verdictRes.exists || !signedVerdict) {
  //       throw 'Document does not exist!';
  //     }
  //     t.update(verdictRef, {
  //       'offChainMetadata.hold': hold,
  //       'offChainMetadata.holdLastUpdater': signer,
  //     });
  //     if (!!signedVerdict) {
  //       const owner = await hashRegistry.ownerOfByTxHash(
  //         signedVerdict.verdict.txHash,
  //       );
  //       await createHoldVerdictMetadataAlert(
  //         signedVerdict.verdict.txHash,
  //         signedVerdict.signer,
  //         signer,
  //         owner,
  //         hold,
  //       );
  //     }
  //     const embed = await createVerdictChangedHold(
  //       PROVIDER,
  //       signedVerdict as any,
  //       hold,
  //       signer,
  //     );
  //     await discordClient.send(embed);
  //   });
  //   res.status(200).json({ verdictId, hold });
  // } catch (e) {
  //   console.log(e);
  //   res.status(500).json({ statusCode: 500, message: 'Something went wrong' });
  // }
};

export default handleChangeVerdictStatus;
