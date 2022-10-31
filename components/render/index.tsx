import { Season, SEASON_TO_ART_FACTORY } from '@hash/seasons';
import { DIMENSIONS } from '@hash/types';
import React, {
  FC,
  HTMLProps,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { animated } from 'react-spring';
import { useMountedState } from 'react-use';
import styled from 'styled-components';
import useSWR from 'swr';
import {
  usePrerenderPayloadByContext,
  useTokenIdByContext,
  useTokenMetadataByContext,
} from '../../contexts/token';
import { useOwnerByHash } from '../../hooks/useOwner';
import { useParallax, useParallaxDelta } from '../../hooks/useParallax';
import { useSeasonFromTokenId } from '../../hooks/useSeason';
import { prerenderWithFailsafeFetcher } from '../../utils/fetcher';
import { getArtworkPreviewUrl } from '../../utils/urls';
import { LoadingCard } from '../loadingCard';
import { Canvas } from './canvas';

export interface RenderProps {
  hash: string;
  preferredSeason?: Season;
  dimensions: [number, number];
  isParallax?: boolean;
  shouldEnableRAFLoop?: boolean;
  handleArtworkClick?: () => void;
}

export const TIME_DELAY_TO_NORMAL_IN_MS = 800;

const UnMemoizedRender: FC<RenderProps & HTMLProps<HTMLDivElement>> = (
  props,
) => {
  const {
    isParallax,
    className,
    style,
    dimensions,
    preferredSeason,
    hash,
    handleArtworkClick,
    shouldEnableRAFLoop,
  } = props;

  const tokenId = useTokenIdByContext();
  const seasonFromTokenId = useSeasonFromTokenId(tokenId);
  const season = useMemo(() => {
    return preferredSeason;
  }, [preferredSeason]);

  const prerenderPayloadFromContext = usePrerenderPayloadByContext();
  const tokenMetadata = useTokenMetadataByContext();

  const { data: prerenderPayloadFromFetch, error } = useSWR(
    useMemo(() => (!!hash ? [season, hash] : null), [season, hash]),
    prerenderWithFailsafeFetcher,
    {},
  );

  const prerenderPayload = useMemo(() => {
    if (!!prerenderPayloadFromFetch) {
      return prerenderPayloadFromFetch;
    }
    return prerenderPayloadFromContext;
  }, [prerenderPayloadFromFetch, prerenderPayloadFromContext]);

  // render the webgl context if its not prefetch state
  const isMounted = useMountedState();

  // loading
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleHasDrawn = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  const imageUrl = useMemo(() => {
    return tokenMetadata?.cachedImage ?? getArtworkPreviewUrl(hash ?? '');
  }, [hash, tokenMetadata]);

  const shouldShowWebgl = useMemo(() => {
    return !!hash && !!prerenderPayload && isMounted() && dimensions[0] !== 0;
  }, [hash, prerenderPayload, isMounted, dimensions, isParallax]);

  const cardWrapperRef = useRef<HTMLDivElement | null>(null);

  const [delta] = useParallaxDelta(
    cardWrapperRef,
    useMemo(() => ({ isDisabled: !isParallax }), [isParallax]),
  );

  const cardContainerParallaxStyles = useParallax(delta, {
    rCoeff: [0.06, 0.06],
    dCoeff: [0.06, 0.06],
    zIndex: 1,
  });

  const owner = useOwnerByHash(hash ?? undefined);

  const shouldShowSignature = useMemo(() => {
    return !!owner;
  }, [owner]);

  return (
    <AnimatedRenderWrapper
      className={className}
      style={{
        width: dimensions[0],
        height: dimensions[1],
        ...style,
      }}
    >
      <AnimatedRenderContainer
        ref={cardWrapperRef}
        style={cardContainerParallaxStyles}
        isExpanded={false} // TODO
        isArtFocused={false}
        onClick={handleArtworkClick}
      >
        {!!season && shouldShowWebgl && (
          <Canvas
            key={`render-${hash}-${season}`}
            shouldEnableRAFLoop={shouldEnableRAFLoop}
            prerenderPayload={prerenderPayload}
            onHasDrawn={handleHasDrawn}
            dimensions={DIMENSIONS}
            artFactory={SEASON_TO_ART_FACTORY[season]}
          />
        )}
        {seasonFromTokenId === preferredSeason && (
          <AnimatedImage src={imageUrl} onLoad={handleHasDrawn} />
        )}
        <LoadingCard isLoading={isImageLoading} />
        {shouldShowSignature && <SignatureImage src={'/sig-white.svg'} />}
      </AnimatedRenderContainer>
    </AnimatedRenderWrapper>
  );
};

export const Render = React.memo(UnMemoizedRender);

const RenderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const AnimatedRenderContainer = animated(RenderContainer);

const RenderWrapper = styled.div<{
  isArtFocused?: boolean;
  isExpanded?: boolean;
}>`
  width: 100%;
  height: 100%;
  z-index: 1;
  // filter: drop-shadow(0px 12px 16px rgba(0, 0, 0, 0.24));
  position: relative;
  cursor: url(/cursor/click.svg) 20 20, pointer;
`;

const SignatureImage = styled.img`
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 64px;
  z-index: 2;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: absolute;
  z-index: 0;
  filter: blur(24px);
`;

const AnimatedImage = animated(StyledImage);

const AnimatedRenderWrapper = animated(RenderWrapper);
