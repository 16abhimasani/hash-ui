import { Provider } from '@ethersproject/providers';
import { MessageEmbed } from 'discord.js';
import { PostTweet } from '../bots/twitter';
import { HASH_PROD_LINK } from '../constants';
import { ROUTES } from '../constants/routes';
import {
  AFFIRMATION_NUM_VOTES_NEEDED,
  OPINION_TYPE_TO_EMOJI,
  SignedVerdictMetadata,
  SignedVerdictMetadataFromFirebase,
  WriteWithAffirmationData,
} from '../types/verdict';
import { shortenHexString } from './hex';
import { getArtworkPreviewUrl } from './urls';
import { getUserMetadata } from './user-server';

export const createVerdictDiscordEmbed = async (
  provider: Provider,
  verdictMetadata: SignedVerdictMetadata,
) => {
  const { bestName: accountName } = await getUserMetadata(
    verdictMetadata.signer,
  );

  const txHash = verdictMetadata.verdict.txHash;
  const opinionType = verdictMetadata.verdict.opinionType;
  const opinionTypeEmoji = OPINION_TYPE_TO_EMOJI[opinionType];

  PostTweet(
    `** NEW VERDICT **\n` +
      `${shortenHexString(
        txHash,
      )} - ${opinionType} by ${accountName} ${opinionTypeEmoji}\n` +
      `< via @prrfbeauty + @HistoriansDAO >\n` +
      `---\n` +
      `#HASH #generative #cryptoart #nft\n` +
      `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${txHash}`,
    'HASH_SALES',
  );

  // PostTweet(
  //   `[CREATED] Verdict: ${
  //     OPINION_TYPE_TO_EMOJI[verdictMetadata.verdict.opinionType]
  //   } ${verdictMetadata.verdict.opinionType}\n` +
  //     // `Opinion: ${verdictMetadata.verdict.opinion}\n` +
  //     `Author: ${accountName}\n` +
  //     // `Content hash: ${verdictMetadata.verdict.contentHash}\n` +
  //     // `Tx hash: ${verdictMetadata.verdict.txHash}\n` +
  //     `< via @prrfbeauty >\n` +
  //     `${'https://hash.pob.studio'}/art/${verdictMetadata.verdict.txHash}`,
  // );

  return new MessageEmbed()
    .setColor('#F3F3F3')
    .setTitle(
      `[CREATED] Verdict: ${
        OPINION_TYPE_TO_EMOJI[verdictMetadata.verdict.opinionType]
      } ${verdictMetadata.verdict.opinionType}`,
    )
    .setURL(`${HASH_PROD_LINK}/art/${verdictMetadata.verdict.txHash}`)
    .setAuthor(accountName)
    .setDescription(verdictMetadata.verdict.opinion)
    .addField('Content hash', verdictMetadata.verdict.contentHash, true)
    .addField('Tx hash', verdictMetadata.verdict.txHash, true)
    .setTimestamp()
    .setThumbnail(getArtworkPreviewUrl(verdictMetadata.verdict.txHash));
};

export const createVerdictChangedHold = async (
  provider: Provider,
  verdictMetadata: SignedVerdictMetadata,
  hold: boolean,
  holdSigner: string,
) => {
  const { bestName: accountName } = await getUserMetadata(holdSigner);
  // PostTweet(
  //   `[${hold ? 'ON HOLD' : 'PROCEED'}] Verdict: ${OPINION_TYPE_TO_EMOJI[verdictMetadata.verdict.opinionType]} ${
  //     verdictMetadata.verdict.opinionType
  //   }\n` +
  //     // `Opinion: ${verdictMetadata.verdict.opinion}\n` +
  //     `Author: ${accountName}\n` +
  //     // `Content hash: ${verdictMetadata.verdict.contentHash}\n` +
  //     // `Tx hash: ${verdictMetadata.verdict.txHash}\n` +
  //     `< via @prrfbeauty >\n` +
  //     `${'https://hash.pob.studio'}/art/${verdictMetadata.verdict.txHash}`,
  // );
  return new MessageEmbed()
    .setColor('#F3F3F3')
    .setTitle(
      `[${hold ? 'ON HOLD' : 'PROCEED'}] Verdict: ${
        OPINION_TYPE_TO_EMOJI[verdictMetadata.verdict.opinionType]
      } ${verdictMetadata.verdict.opinionType}`,
    )
    .setURL(`${HASH_PROD_LINK}/art/${verdictMetadata.verdict.txHash}`)
    .setAuthor(accountName)
    .setDescription(verdictMetadata.verdict.opinion)
    .addField('Content hash', verdictMetadata.verdict.contentHash, true)
    .addField('Tx hash', verdictMetadata.verdict.txHash, true)
    .setTimestamp()
    .setThumbnail(getArtworkPreviewUrl(verdictMetadata.verdict.txHash));
};

export const createOptimisticVerdictDiscordEmbed = async (
  provider: Provider,
  verdictMetadata: SignedVerdictMetadata,
) => {
  const { bestName: accountName } = await getUserMetadata(
    verdictMetadata.signer,
  );

  const txHash = verdictMetadata.verdict.txHash;
  const opinionType = verdictMetadata.verdict.opinionType;
  const opinionTypeEmoji = OPINION_TYPE_TO_EMOJI[opinionType];

  PostTweet(
    `** APPROVED VERDICT **\n` +
      `${shortenHexString(
        txHash,
      )} - ${opinionType} by ${accountName} ${opinionTypeEmoji}\n` +
      `< via @prrfbeauty + @HistoriansDAO >\n` +
      `---\n` +
      `#HASH #generative #cryptoart #nft\n` +
      `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${txHash}`,
    'HASH_SALES',
  );

  // PostTweet(
  //   `[PASSED] Verdict: ${
  //     OPINION_TYPE_TO_EMOJI[verdictMetadata.verdict.opinionType]
  //   } ${verdictMetadata.verdict.opinionType}\n` +
  //     `Author: ${accountName}\n` +
  //     // `Content hash: ${verdictMetadata.verdict.contentHash}\n` +
  //     // `Tx hash: ${verdictMetadata.verdict.txHash}\n` +
  //     `< via @prrfbeauty >\n` +
  //     `${'https://hash.pob.studio'}/art/${verdictMetadata.verdict.txHash}`,
  // );
  return new MessageEmbed()
    .setColor('#00FF00')
    .setTitle(
      `[PASSED] Verdict: ${
        OPINION_TYPE_TO_EMOJI[verdictMetadata.verdict.opinionType]
      } ${verdictMetadata.verdict.opinionType}`,
    )
    .setURL(`${HASH_PROD_LINK}/art/${verdictMetadata.verdict.txHash}`)
    .setAuthor(accountName)
    .setDescription(verdictMetadata.verdict.opinion)
    .addField('Content hash', verdictMetadata.verdict.contentHash, true)
    .addField('Tx hash', verdictMetadata.verdict.txHash, true)
    .setTimestamp()
    .setThumbnail(getArtworkPreviewUrl(verdictMetadata.verdict.txHash));
};

export const createVoteDiscordEmbed = async (
  provider: Provider,
  verdictMetadata: SignedVerdictMetadataFromFirebase,
  affirmationData: WriteWithAffirmationData,
) => {
  const ensAuthorName = await provider.lookupAddress(verdictMetadata.signer);
  const ensVoterName = await provider.lookupAddress(
    affirmationData.affirmation.signer,
  );
  const { bestName: accountName } = await getUserMetadata(
    verdictMetadata.signer,
  );
  const { bestName: voterName } = await getUserMetadata(
    affirmationData.affirmation.signer,
  );

  if (
    verdictMetadata.offChainMetadata.numAffirmations >=
    AFFIRMATION_NUM_VOTES_NEEDED
  ) {
    // PostTweet(
    //   `[PASSED] Verdict: ${
    //     OPINION_TYPE_TO_EMOJI[verdictMetadata.verdict.opinionType]
    //   } ${verdictMetadata.verdict.opinionType}\n` +
    //     // `Opinion: ${verdictMetadata.verdict.opinion}\n` +
    //     `Author: ${accountName}\n` +
    //     `Votes: ${verdictMetadata.offChainMetadata.numAffirmations}/${AFFIRMATION_NUM_VOTES_NEEDED} > Voter: ${voterName}\n` +
    //     `< via @prrfbeauty >\n` +
    //     `${'https://hash.pob.studio'}/art/${verdictMetadata.verdict.txHash}`,
    // );
    return new MessageEmbed()
      .setColor('#00FF00')
      .setTitle(
        `[PASSED] Verdict: ${
          OPINION_TYPE_TO_EMOJI[verdictMetadata.verdict.opinionType]
        } ${verdictMetadata.verdict.opinionType}`,
      )
      .setURL(`${HASH_PROD_LINK}/art/${verdictMetadata.verdict.txHash}`)
      .setAuthor(ensAuthorName ?? shortenHexString(verdictMetadata.signer))
      .setDescription(verdictMetadata.verdict.opinion)
      .addField('Content hash', verdictMetadata.verdict.contentHash)
      .addField('Tx hash', verdictMetadata.verdict.txHash)
      .addField(
        'Voter',
        ensVoterName ?? shortenHexString(affirmationData.affirmation.signer),
      )
      .addField(
        'Num votes',
        verdictMetadata.offChainMetadata.numAffirmations,
        true,
      )
      .addField('Num votes needed', AFFIRMATION_NUM_VOTES_NEEDED, true)
      .setTimestamp()
      .setThumbnail(getArtworkPreviewUrl(verdictMetadata.verdict.txHash));
  }

  return new MessageEmbed()
    .setColor('#d5dbb3')
    .setTitle(
      `[UPVOTED] Verdict: ${
        OPINION_TYPE_TO_EMOJI[verdictMetadata.verdict.opinionType]
      } ${verdictMetadata.verdict.opinionType}`,
    )
    .setURL(`${HASH_PROD_LINK}/art/${verdictMetadata.verdict.txHash}`)
    .setAuthor(ensAuthorName ?? shortenHexString(verdictMetadata.signer))
    .setDescription(verdictMetadata.verdict.opinion)
    .addField('Content hash', verdictMetadata.verdict.contentHash)
    .addField('Tx hash', verdictMetadata.verdict.txHash)
    .addField(
      'Voter',
      ensVoterName ?? shortenHexString(affirmationData.affirmation.signer),
    )
    .addField(
      'Num votes',
      verdictMetadata.offChainMetadata.numAffirmations,
      true,
    )
    .addField('Num votes needed', AFFIRMATION_NUM_VOTES_NEEDED)
    .setTimestamp()
    .setThumbnail(getArtworkPreviewUrl(verdictMetadata.verdict.txHash));
};
