import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC, useMemo, useState } from 'react';
import FadeIn from 'react-lazyload-fadein';
import { animated } from 'react-spring';
import { useMeasure } from 'react-use';
import styled from 'styled-components';
import { ROUTES } from '../../../constants/routes';
import {
  TokenProvider,
  useHashByContext,
  useMintStateByContext,
  useOwnerByContext,
  useTokenMetadataByContext,
  useUserAddedMetadataByContext,
} from '../../../contexts/token';
import { useBestPriceStatisticByContext } from '../../../hooks/useBestPriceStatistic';
import { useUser } from '../../../hooks/useUser';
import { lowerCaseCheck } from '../../../utils/string';
import { getArtworkPreviewUrl } from '../../../utils/urls';
import { CleanAnchor } from '../../anchor';
import { UserAvatar } from '../../avatar';
import { BreathingActiveIndicator } from '../../breathingActiveIndicator';
import { LoadingCard } from '../../loadingCard';

const UnMemoizedGridItem: FC<{
  hash: string;
}> = ({ hash }) => {
  return (
    <TokenProvider
      hash={hash}
      shouldNotFetchMetadataLive={true}
      shouldNotFetchMetadataFromApi={true}
      shouldNotFetchMetadataFromFirestore={true}
    >
      <GridItemContent />
    </TokenProvider>
  );
};
export const GridItem = React.memo(UnMemoizedGridItem);

const UnmemoizedGridItemContent: FC<{
  width?: number | string;
}> = ({ width }) => {
  const mintState = useMintStateByContext();
  const hash = useHashByContext();
  const tokenMetadata = useTokenMetadataByContext();
  const [imageWellRef, imageWellBounds] = useMeasure();
  const imageUrl = useMemo(() => {
    return tokenMetadata?.cachedImage ?? getArtworkPreviewUrl(hash ?? '');
  }, [hash, tokenMetadata]);
  const router = useRouter();
  return (
    <GridItemContainer
      style={{ width }}
      onClick={() => router.push(`${ROUTES.ART.INDEX}/${hash}`)}
    >
      <UpperGridContainer ref={imageWellRef as any}>
        <GridItemImage src={imageUrl} width={imageWellBounds.width} />
      </UpperGridContainer>
      <BottomGridContainer>
        {mintState === 'owned' && <OwnedBottomGrid />}
        {/* {mintState === 'no-more-editions' && <SoldOutBottomGrid />} */}
        {/* {cardType === 'mintable' && !!hash && (
          <MintableBottomGrid hash={hash} />
        )} */}
      </BottomGridContainer>
    </GridItemContainer>
  );
};
export const GridItemContent = React.memo(UnmemoizedGridItemContent);

const GridItemImage: FC<{
  src?: string;
  width: number;
}> = ({ src, width }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);

  const cardDimensionsBySketchDimensions: [number, number] = useMemo(() => {
    return [width, width];
  }, [width]);

  return (
    <AnimatedImageContainer
      style={{
        width: cardDimensionsBySketchDimensions[0],
        height: cardDimensionsBySketchDimensions[1],
      }}
    >
      <LoadingCard isLoading={isImageLoading} />
      <FadeIn height={cardDimensionsBySketchDimensions[1]}>
        {(onload: any) => (
          <AnimatedImage
            src={src}
            style={{
              width: cardDimensionsBySketchDimensions[0],
              height: cardDimensionsBySketchDimensions[1],
            }}
            onLoad={() => {
              onload();
              setIsImageLoading(false);
            }}
          />
        )}
      </FadeIn>
    </AnimatedImageContainer>
  );
};

const OwnedBottomGrid: FC = () => {
  const hash = useHashByContext();
  const owner = useOwnerByContext();
  const accountMetadata = useUser(owner);
  const metadata = useUserAddedMetadataByContext();

  const { priceLabel, priceText, isMarketLive } =
    useBestPriceStatisticByContext();

  if (!hash) {
    return null;
  }

  return (
    <>
      <BottomGridTopContainer>
        <div style={{ width: '100%' }}>
          <Link href={`${ROUTES.ART.INDEX}/${hash}`} passHref>
            <CleanAnchor>
              <ArtworkTitle style={{ marginBottom: 6 }}>
                {metadata?.name}
              </ArtworkTitle>
            </CleanAnchor>
          </Link>

          {!!metadata?.description &&
          !lowerCaseCheck(metadata.description, 'painted by pob') ? (
            <ArtworkSubtitle>{metadata.description}</ArtworkSubtitle>
          ) : (
            <ArtworkSubtitleEmpty>No description set</ArtworkSubtitleEmpty>
          )}
        </div>
      </BottomGridTopContainer>
      <BottomDivider />
      <BottomGridBottomContainer isActive={isMarketLive}>
        {!isMarketLive || lowerCaseCheck(priceLabel, 'minted') ? (
          <BottomGridUser>
            <Link href={`${ROUTES.USER}/${owner}`} passHref>
              <CleanAnchor>
                <UserAvatar user={owner} size={16} />
                <span style={{ marginLeft: 4 }}>
                  {accountMetadata?.bestName}
                </span>
              </CleanAnchor>
            </Link>
          </BottomGridUser>
        ) : (
          <>
            {isMarketLive && (
              <BreathingActiveIndicator
                isLoading={true}
                color={
                  lowerCaseCheck(priceLabel, 'bid') ? '#FF8A00' : '#1EFF27'
                }
              />
            )}
            <BottomGridPriceLabel>
              <span>{priceLabel}:&nbsp;</span>
              {priceText}
            </BottomGridPriceLabel>
          </>
        )}
      </BottomGridBottomContainer>
    </>
  );
};

// const MintableBottomGrid: FC<{ hash: string }> = ({ hash }) => {
//   // mintable can be specific to the season
//   const { preferredMinterType, adjustedCurrentPriceToMintInWei } =
//     useSagaMinter([hash]);
//   const { metadata, verdict } = useTitleAndDescriptionByHash(hash);
//   return (
//     <>
//       {!!verdict && (
//         <VerdictBadgeContainer>
//           <VerdictBadge opinion={verdict.opinionType} />
//         </VerdictBadgeContainer>
//       )}
//       <BottomGridAbsContainer>
//         <div style={{ width: '100%' }}>
//           <Link href={`${ROUTES.ART.INDEX}/${hash}`} passHref>
//             <CleanAnchor>
//               <ArtworkTitle>
//                 {metadata?.title || shortenHexString(hash, 6)}
//               </ArtworkTitle>
//             </CleanAnchor>
//           </Link>
//           {!!metadata?.description && (
//             <ArtworkSubtitle style={{ paddingTop: 8 }}>
//               {metadata.description}
//             </ArtworkSubtitle>
//           )}
//         </div>
//         <FlexEnds style={{ width: '100%' }}>
//           {!!preferredMinterType ? (
//             <DescriptionText>
//               Mint for{' '}
//               {formatEther(
//                 adjustedCurrentPriceToMintInWei[preferredMinterType],
//               )}{' '}
//               ETH
//             </DescriptionText>
//           ) : (
//             <DescriptionText>-</DescriptionText>
//           )}
//           <Link passHref href={`${ROUTES.ART.INDEX}/${hash}`}>
//             <MonoAnchorWithIcon>View Details</MonoAnchorWithIcon>
//           </Link>
//         </FlexEnds>
//       </BottomGridAbsContainer>
//     </>
//   );
// };

export const GRID_ROW_HEIGHT = 500;

const ArtworkSubtitle = styled.p`
  font-size: 12px;
  color: #808080;
  margin: 0;
  padding: 0;
  width: 100%;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ArtworkSubtitleEmpty = styled(ArtworkSubtitle)`
  opacity: 0.5;
`;

const ArtworkTitle = styled.h6`
  font-size: 14px;
  font-weight: bold;
  margin: 0;
  width: 100%;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  :hover {
    text-decoration: underline;
  }
`;

const BottomGridContainer = styled.div`
  border-top: 1px solid #f0f0f0;
  position: relative;
  padding: 12px 16px;
`;

const BottomGridTopContainer = styled.div`
  margin-bottom: 12px;
`;

const BottomGridUser = styled.div`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 12px;
  color: #000;
  display: flex;
  align-items: center;
  a {
    display: flex;
    align-items: center;
  }
`;

const BottomGridPriceLabel = styled.div`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  color: #000;
  span {
    color: #808080;
    font-weight: normal;
  }
`;

const BottomDivider = styled.div`
  height: 1px;
  width: 100%;
  background: #f2f2f2;
`;

const BottomGridBottomContainer = styled.div<{ isActive?: boolean }>`
  width: 100%;
  position: relative;
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  position: relative;
  display: block;
  object-fit: cover;
  object-position: center;
`;

const AnimatedImage = animated(StyledImage);

const ImageContainer = styled.div`
  position: relative;
  display: block;
`;

const UpperGridContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AnimatedImageContainer = animated(ImageContainer);

export const GridItemContainer = styled.div`
  position: relative;
  transition: all ease-in-out 150ms;
  cursor: pointer;
  background-color: white;
  border: 1px solid #f2f2f2;
  border-radius: 8px;
  overflow: hidden;
`;
