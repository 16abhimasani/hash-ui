import { DaoRole } from './dao';
import { OpinionType } from './verdict';

export interface TwitterEmbedMetadata {
  type: 'twitter-tweet';
  url: string;
}

export interface NftEmbedMetadata {
  type: 'nft';
  tokenId: string;
  contract: string;
}

export interface HashEmbedMetadata {
  type: 'hash';
  txHash: string;
}

export interface VerdictEmbedMetadata {
  type: 'verdict-status';
  opinionType: OpinionType;
}

export type EmbedMetadata =
  | TwitterEmbedMetadata
  | HashEmbedMetadata
  | NftEmbedMetadata
  | VerdictEmbedMetadata;

export interface CommentBase {
  embed?: EmbedMetadata[];
  markdown?: string;
  html?: string;
  cid?: string;
  author: string;
  txHash: string;
}

export interface Comment extends CommentBase {
  id: string;
  createdAt: number;
  lastEditedAt?: number;
}

export interface CommentSettings {
  isHidden: boolean;
}

export type VoteDirection = 'upvote' | 'downvote' | 'neutral';

export interface CommentVoteMetadata {
  voteDirection: VoteDirection;
  role: DaoRole;
  createdAt: number;
}

export interface ShardedCommentVote {
  [address: string]: CommentVoteMetadata;
}

export const DAO_ROLES_VOTE_WEIGHT: { [role: string]: number } = {
  historian: 32,
  scribe: 8,
  hunter: 1,
};
