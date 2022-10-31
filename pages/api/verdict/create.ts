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
  // if (verifyIsVerdictMetadata(req.body.verdictMetadata)) {
  //   res
  //     .status(422)
  //     .json({ statusCode: 422, message: 'verdict missing values' });
  //   return;
  // }
  // const { signer, signature, ...verdictPayload } = req.body.verdictMetadata;

  // // if (!isHistorian(signer)) {
  // //   res
  // //     .status(403)
  // //     .json({ statusCode: 403, message: 'signer is not historian' });
  // //   return;
  // // }

  // if (
  //   utils.verifyMessage(JSON.stringify(verdictPayload), signature) !== signer
  // ) {
  //   res.status(422).json({ statusCode: 422, message: 'invalid signed data' });
  //   return;
  // }

  // try {
  //   const metadataBlob = new Blob([JSON.stringify(req.body.verdictMetadata)]);

  //   const cid = await client.storeBlob(metadataBlob);
  //   const verdictCollectionRef = firestore
  //     .collection(FIRESTORE_VERDICT_METADATA_COLLECTION_ID)
  //     .doc(cid);

  //   const offChainMetadata = { numAffirmations: 0 };

  //   await verdictCollectionRef.set({
  //     ...req.body.verdictMetadata,
  //     offChainMetadata,
  //     createdAt: FieldValue.serverTimestamp(),
  //   });

  //   const embed = await createVerdictDiscordEmbed(
  //     PROVIDER,
  //     req.body.verdictMetadata,
  //   );
  //   const owner = await hashRegistry.ownerOfByTxHash(
  //     verdictPayload.verdict.txHash,
  //   );
  //   await createCreatedVerdictMetadataAlert(
  //     verdictPayload.verdict.txHash,
  //     signer,
  //     owner,
  //   );

  //   await discordClient.send(embed);
  //   res.status(200).json({ cid });
  // } catch (e) {
  //   console.log(e);
  //   res
  //     .status(500)
  //     .json({ statusCode: 500, error: e, message: 'Something went wrong' });
  // }
};

export default handle;
