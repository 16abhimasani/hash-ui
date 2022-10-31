import {
  constructProfileImgFilePath,
  FIRESTORE_ROUTES,
} from '@hash/firebase-utils';
import { uploadToBucketAndOverwrite } from '@hash/firebase-utils/server';
import { utils } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  CreateTwitterClient,
  getHighResTwitterProfileUrl,
} from '../../../bots/twitter';
import { admin } from '../../../clients/firebase-server';
import { UserMetadata } from '../../../types/user';
import {
  getSignedAccountHash,
  getSignedAccountSignedMessageByHash,
} from '../../../utils/signing';

const firestore = admin.firestore();

const twitterClient = CreateTwitterClient('HASH_AUTH');

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { signature } = req.query;

  if (typeof signature !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'signature is not a valid value' });
    return;
  }

  const signatureRef = firestore
    .collection(FIRESTORE_ROUTES.USER_SIGNATURES)
    .doc(signature);
  const signatureSnapshot = await signatureRef.get();

  if (!signatureSnapshot.exists) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'signature is not a valid value' });
    return;
  }

  const address = signatureSnapshot?.data()?.account;

  if (!address) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'signature is not a valid value' });
    return;
  }

  const userRef = firestore
    .collection(FIRESTORE_ROUTES.USER_METADATAS)
    .doc(address);
  const userSnapshot = await userRef.get();
  if (!!userSnapshot.data() && userSnapshot.data()?.isTwitterLinked) {
    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=15, max-age=15`,
    );
    res.status(200).json({ success: true, signature });
    return;
  }

  const createdAt = signatureSnapshot?.data()?.createdAt;
  const entropyHash = getSignedAccountHash({
    account: address,
    createdAt,
  });
  const signedMessage = getSignedAccountSignedMessageByHash(entropyHash);

  const searchResults = await twitterClient.tweets.search({
    q: signature,
    count: 1,
    include_entities: false,
  });

  if (!!searchResults.statuses[0]) {
    const status = searchResults.statuses[0];
    const statusId = status.id_str;

    const fullTweet = await twitterClient.tweets.statusesShow({
      id: statusId,
      tweet_mode: 'extended',
    });

    const user = fullTweet.user;
    const fullTweetText = fullTweet.full_text;
    console.log(fullTweet, 'fullTweet');

    if (fullTweetText.includes(signature)) {
      const isSignatureValid =
        utils.verifyMessage(signedMessage, signature) === address;
      console.log(isSignatureValid, 'isSignatureValid');

      if (isSignatureValid) {
        const highResTwitterProfileSrc = getHighResTwitterProfileUrl(
          user.profile_image_url_https,
        );
        const profileImgRes = await fetch(highResTwitterProfileSrc);
        const profileImgArrayBuffer = await profileImgRes.arrayBuffer();
        const profileImgBuffer = Buffer.from(profileImgArrayBuffer);
        const profileImageCacheUrl = await uploadToBucketAndOverwrite(
          constructProfileImgFilePath(user.screen_name),
          profileImgBuffer,
        );
        console.log(highResTwitterProfileSrc, 'highResTwitterProfileSrc');
        console.log(profileImageCacheUrl, 'profileImageCacheUrl');

        const twitterData = {
          isTwitterLinked: true,
          username: user.screen_name,
          twitterProfileId: user.id_str,
          profileImage: profileImageCacheUrl || highResTwitterProfileSrc,
          address,
          [`roles.hunter`]: true,
        } as UserMetadata;

        if (userSnapshot.exists) {
          await userRef.update(twitterData);
        } else {
          await userRef.set(twitterData);
        }

        res.setHeader(
          'Cache-Control',
          `public, immutable, no-transform, s-maxage=15, max-age=15`,
        );
        res.status(200).json({ success: true, signature });
        return;
      }
    }
  }
  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=15, max-age=15`,
  );
  res.status(200).json({ success: false, signature });
};
export default handle;
