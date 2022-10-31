import _ from 'lodash';
import qs from 'query-string';
import { TwitterClient } from 'twitter-api-client';

export const DEFAULT_AT_USERNAME = 'prrfbeauty';
export const DEFAULT_HASHTAGS: string[] = [
  'MySaga',
  'nftart',
  'POB',
  'cryptoart',
  'ERC1155',
  'generative',
  'historian',
];

export const getTwitterShareLink = (url: string, text?: string) => {
  const params = {
    url,
    // text,
    // hashtags: DEFAULT_HASHTAGS,
    via: DEFAULT_AT_USERNAME,
  };
  return `https://twitter.com/intent/tweet?${qs.stringify(params, {
    arrayFormat: 'comma',
  })}`;
};

export const TWITTER_KEYS = {
  HASH_MINTS: {
    PUBLIC: 'fT5m4nJwSMe7ls8ToRWLn87n4',
    SECRET: '',
    ACCESS: '',
    ACCESS_SECRET: '',
    BEARER: '',
  },
  HASH_SALES: {
    PUBLIC: 'ffLLSCRvup5JACESrBR0lbbZJ',
    SECRET: '',
    ACCESS: '',
    ACCESS_SECRET: '',
    BEARER: '',
  },
  LONDON_SALES: {
    PUBLIC: 'emxVkvnqPsUdF4dnzNDL7nJEQ',
    SECRET: '',
    ACCESS: '',
    ACCESS_SECRET: '',
    BEARER: '',
  },
  PIANO_SALES: {
    PUBLIC: 'gaA89KoZj4zW6JpoycUzuh3I0',
    SECRET: '',
    ACCESS: '',
    ACCESS_SECRET: '',
    BEARER: '',
  },
  HASH_AUTH: {
    PUBLIC: 'sQqSkqu2mgV4kwnBbMlp0U2tQ',
    SECRET: '',
    ACCESS: '',
    ACCESS_SECRET: '',
    BEARER: '',
  },
};
export type TWITTER_APPS =
  | 'HASH_MINTS'
  | 'HASH_SALES'
  | 'LONDON_SALES'
  | 'PIANO_SALES'
  | 'HASH_AUTH';

export interface TWITTER_API_KEY_TYPE {
  PUBLIC: string;
  SECRET: string;
  ACCESS: string;
  ACCESS_SECRET: string;
  BEARER: string;
}

export const CreateTwitterClient = (app: TWITTER_APPS) => {
  return new TwitterClient({
    apiKey: TWITTER_KEYS[app].PUBLIC,
    apiSecret: TWITTER_KEYS[app].SECRET,
    accessToken: TWITTER_KEYS[app].ACCESS,
    accessTokenSecret: TWITTER_KEYS[app].ACCESS_SECRET,
  });
};

export const PostTweet = (body: string, app: TWITTER_APPS = 'HASH_MINTS') => {
  const twitterClient = CreateTwitterClient(app);
  twitterClient.tweets.statusesUpdate({
    status: `${body}`,
  });
};

export const PostReplyTweet = async (
  body: string,
  in_reply_to_status_id: string,
  app: TWITTER_APPS = 'HASH_MINTS',
) => {
  const twitterClient = CreateTwitterClient(app);
  await twitterClient.tweets.statusesUpdate({
    status: `${body}`,
    in_reply_to_status_id,
    auto_populate_reply_metadata: true,
  });
};

export const cleanTwitterProfileUrl = (imgUrl: string) => {
  const urlChunkToUse = imgUrl.split('_normal')[0];
  return urlChunkToUse;
};

export const getTwitterProfileUrlExtension = (imgUrl: string) => {
  // 1234.jpeg or 1234.jpg -- it matters b/c twitter is picky. Split on last period
  return imgUrl.split('.').pop();
};

export const getHighResTwitterProfileUrl = (
  twitterProfileImgSrc: string,
): string => {
  const cleanUrlNoExtension = cleanTwitterProfileUrl(twitterProfileImgSrc);
  const extension = getTwitterProfileUrlExtension(twitterProfileImgSrc);
  return `${cleanUrlNoExtension}.${extension}`;
};

export const AsyncPostTweet = async (
  body: string,
  app: TWITTER_APPS = 'HASH_MINTS',
) => {
  try {
    const twitterClient = CreateTwitterClient(app);
    try {
      console.log(body, 'tweet body');
      const statusUpdate = await twitterClient.tweets.statusesUpdate({
        status: `${body}`,
      });
      console.log('successfully tweeted statusUpdate');
      return statusUpdate;
    } catch (statusError) {
      console.error(statusError, 'failed to tweet statusUpdate');
    }
  } catch (clientError) {
    console.error(clientError, 'failed to create twitter client');
  }
  return;
};

export const handleDupesAndTweet = (
  searchQuery: string,
  body: string,
  app: TWITTER_APPS = 'HASH_MINTS',
) => {
  const twitterClient = CreateTwitterClient(app);
  // Search our twitter account's recent tweets for anything exactly matching our new tweet's text
  twitterClient.tweets
    .search({ q: `${searchQuery}&result_type=recent&count=1` })
    .then(({ statuses, search_metadata }) => {
      // No duplicate statuses found
      if (_.isEmpty(search_metadata) || _.isEmpty(statuses)) {
        console.log('No duplicate statuses found, continuing to tweet...');
        twitterClient.tweets.statusesUpdate({
          status: `${body}`,
        });
      }

      // Status found is older than 10 minutes, not a cached transaction, just sold at same price
      const mostRecentMatchingTweetCreatedAt = _.get(statuses[0], 'created_at');
      const statusOlderThan10Mins =
        new Date(mostRecentMatchingTweetCreatedAt) <
        new Date(new Date().getTime() - 1000 * 60 * 10);
      if (statusOlderThan10Mins) {
        console.log(
          'Previous status is older than 10 minutes, continuing to tweet...',
        );
        twitterClient.tweets.statusesUpdate({
          status: `${body}`,
        });
      }

      console.log(
        'Tweet is a duplicate; possible delayed transaction retrieved from OpenSea',
      );
    })
    .catch((err) => console.error(err));
};
