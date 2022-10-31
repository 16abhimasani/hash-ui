import _ from 'lodash';
import { CreateTwitterClient, PostReplyTweet } from '.';
import { HASH_PROD_LINK } from '../../constants';
import { ROUTES } from '../../constants/routes';
import { shortenHexString } from '../../utils/hex';

export const TWITTER_REPLY_BOT_INTERVAL = 45; // minutes
export const TWITTER_REPLY_BOT_SEARCH_COUNT = 20; // how many tweets to load at once
export const TWITTER_REPLY_BOT_FOLLOWER_THRESHOLD = 1024;
export const TWITTER_REPLY_BOT_FAVORITE_THRESHOLD = 4;

const TX_SUBSTRING_REGEX = /0x([A-Fa-f0-9]{64})$/;
const twitterClient = CreateTwitterClient('HASH_MINTS');

export const TwitterReplyBot = async (
  searchQuery: string = `url:https://etherscan.io/tx`,
) => {
  const { statuses, search_metadata } = await twitterClient.tweets.search({
    q: searchQuery,
    count: TWITTER_REPLY_BOT_SEARCH_COUNT,
    result_type: 'popular',
  });

  const messages: string[] = [];

  if (_.isEmpty(search_metadata) || _.isEmpty(statuses)) {
    messages.push(
      `'No tweets found: ${JSON.stringify(search_metadata)}; ${statuses}`,
    );
  } else {
    statuses.forEach(async (status) => {
      let message;
      const createdAt = _.get(status, 'created_at');
      const statusId = _.get(status, 'id_str');
      const statusYoungerThanInterval =
        new Date(createdAt) >
        new Date(new Date().getTime() - 1000 * 60 * TWITTER_REPLY_BOT_INTERVAL);
      if (statusYoungerThanInterval) {
        const fullTweet = await twitterClient.tweets.statusesShow({
          id: statusId,
          tweet_mode: 'extended',
        });
        const urls = fullTweet.entities.urls;
        const user = fullTweet.user;
        const hash = urls
          ?.find((url) => url?.expanded_url?.match(TX_SUBSTRING_REGEX))
          ?.expanded_url?.match(TX_SUBSTRING_REGEX)
          ?.find(() => true);
        if (!hash) {
          message = `No matches. Tweet did not meet TX_HASH_REGEX: ${urls}`;
        } else {
          if (
            user.followers_count >= TWITTER_REPLY_BOT_FOLLOWER_THRESHOLD &&
            fullTweet.favorite_count >= TWITTER_REPLY_BOT_FAVORITE_THRESHOLD
          ) {
            const body =
              `${shortenHexString(hash, 6)} - tokenize it on #HASH\n` +
              `< via @prrfbeauty + @HistoriansDAO >\n` +
              `---\n` +
              `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${hash}`;
            await PostReplyTweet(body, statusId, 'HASH_MINTS');
            message = `successfully posted: ${body}`;
          } else {
            message = `Tweet did not meet interaction criteria: status.id: ${statusId}; hash: ${hash};`;
          }
        }
      } else {
        message = `Status: ${status.id_str} is older than ${TWITTER_REPLY_BOT_INTERVAL} minutes`;
      }
      messages.push(message);
    });
  }
  return messages;
};
