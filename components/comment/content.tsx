import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { HISTORIANS_TWITTER_LINK } from '../../constants';
import {
  EmbedMetadata,
  HashEmbedMetadata,
  NftEmbedMetadata,
  TwitterEmbedMetadata,
  VerdictEmbedMetadata,
} from '../../types/comments';
import { GridItem } from '../grid/items';
import { CommentTiptap } from '../tiptap/comment';
import { NftEmbed } from './embeds/nft';
import { TweetEmbed } from './embeds/tweet';
import { VerdictEmbed } from './embeds/verdict';

export interface CommentContentProps {
  embed?: EmbedMetadata[];
  shouldShowEmptyState?: boolean;
  editable?: boolean;
  commentHtml?: string;
  commentTipTapKey?: string;
  onChange?: ((html: string, text: string) => void) | undefined;
}

export const CommentRenderContent: FC<CommentContentProps> = ({
  embed,
  shouldShowEmptyState,
  editable,
  commentHtml,
  commentTipTapKey,
  onChange,
}) => {
  const verdictEmbedMetadata = useMemo(
    () =>
      embed?.find((e) => e.type === 'verdict-status') as
        | VerdictEmbedMetadata
        | undefined,
    [embed],
  );

  const nftEmbedMetadata = useMemo(
    () => embed?.find((e) => e.type === 'nft') as NftEmbedMetadata | undefined,
    [embed],
  );

  const tweetEmbedMetadata = useMemo(
    () =>
      embed?.find((e) => e.type === 'twitter-tweet') as
        | TwitterEmbedMetadata
        | undefined,
    [embed],
  );

  const hashEmbedMetadata = useMemo(
    () =>
      embed?.find((e) => e.type === 'hash') as HashEmbedMetadata | undefined,
    [embed],
  );

  return (
    <ContentContainer>
      {!!verdictEmbedMetadata && <VerdictEmbed {...verdictEmbedMetadata} />}
      {(() => {
        if (commentHtml !== undefined) {
          return (
            <CommentTiptap
              key={`comment-tip-tap-${commentTipTapKey}`}
              defaultContent={commentHtml}
              onChange={onChange}
              disabled={!editable}
              placeholder={
                'Insert an Embed or just start typing to add a comment...'
              }
            />
          );
        }
        if (shouldShowEmptyState) {
          return (
            <EmptyStateText>
              Join the{' '}
              <a href={HISTORIANS_TWITTER_LINK} target="_blank">
                HistoriansDAO
              </a>{' '}
              as a Hunter: Own a HASH, or connect your Twitter account to enable
              Discussions. <a href={'#'}>Learn more</a>
            </EmptyStateText>
          );
        }
        return null;
      })()}
      {!!nftEmbedMetadata && <NftEmbed {...nftEmbedMetadata} />}
      {!!tweetEmbedMetadata && (
        <div style={{ marginTop: !!verdictEmbedMetadata ? 8 : 0 }}>
          <TweetEmbed src={tweetEmbedMetadata.url} />
        </div>
      )}
      {!!hashEmbedMetadata && (
        <div style={{ width: 480 }}>
          <GridItem hash={hashEmbedMetadata.txHash} />
        </div>
      )}
    </ContentContainer>
  );
};

const ContentContainer = styled.div`
  > div + div {
    margin-top: 16px;
  }
`;

const EmptyStateText = styled.p`
  margin: 0;
  font-size: 14px;
  padding: 4px 0;
  color: rgba(0, 0, 0, 0.5);
  line-height: 22px;
  > a {
    color: inherit;
  }
`;
