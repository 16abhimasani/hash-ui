import {
  constructProfileImgFilePath,
  FIRESTORE_ROUTES,
} from '@hash/firebase-utils';
import { uploadToBucketAndOverwrite } from '@hash/firebase-utils/server';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  CreateTwitterClient,
  getHighResTwitterProfileUrl,
} from '../../../bots/twitter';
import { admin } from '../../../clients/firebase-server';
import { UserMetadata } from '../../../types/user';

const firestore = admin.firestore();

const twitterClient = CreateTwitterClient('HASH_AUTH');

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { account } = req.query;

  if (typeof account !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'account is not a valid value' });
    return;
  }

  const userRef = firestore
    .collection(FIRESTORE_ROUTES.USER_METADATAS)
    .doc(account);
  const userSnapshot = await userRef.get();
  const address = userSnapshot?.data()?.address;
  const isTwitterLinked = userSnapshot?.data()?.isTwitterLinked;
  const twitterProfileId = userSnapshot?.data()?.twitterProfileId;

  if (!isTwitterLinked || !twitterProfileId) {
    res.status(200).json({
      statusCode: 200,
      success: false,
      message: 'twitter metadata on this user is not available',
    });
    return;
  }

  if (!!userSnapshot.data() && isTwitterLinked && twitterProfileId) {
    const userResult = await twitterClient.accountsAndUsers.usersShow({
      user_id: twitterProfileId,
      include_entities: false,
    });

    const highResTwitterProfileSrc = getHighResTwitterProfileUrl(
      userResult.profile_image_url_https,
    );
    const profileImgRes = await fetch(highResTwitterProfileSrc);
    const profileImgArrayBuffer = await profileImgRes.arrayBuffer();
    const profileImgBuffer = Buffer.from(profileImgArrayBuffer);
    const profileImageCacheUrl = await uploadToBucketAndOverwrite(
      constructProfileImgFilePath(userResult.screen_name),
      profileImgBuffer,
    );
    console.log(highResTwitterProfileSrc, 'highResTwitterProfileSrc');
    console.log(profileImageCacheUrl, 'profileImageCacheUrl');

    const twitterData = {
      isTwitterLinked: true,
      username: userResult.screen_name,
      twitterProfileId: userResult.id_str,
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
    res.status(200).json({ success: true, account });
    return;
  }

  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=15, max-age=15`,
  );
  res.status(200).json({ success: false, address });
};

export default handle;
