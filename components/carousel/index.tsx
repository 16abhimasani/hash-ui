// import styled from 'styled-components';
// import { animated, useSpring } from 'react-spring';
// import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { BaseButton } from '../button';
// import { LargeLeftArrow, LargeRightArrow } from '../icons/largeArrow';
// import { GhostCard, Card, CarouselCardProps, CardState } from './card';
// import {
//   CarouselCardState,
//   CarouselData,
//   CAROUSEL_CARD_STATE_LIFECYCLE,
//   useCarouselStore,
// } from '../../stores/carousel';
// import { HASH_PROD_LINK, SPRING_CONFIG } from '../../constants';
// import { TwitterIcon } from '../icons/social';
// import { BaseAnchor, CleanAnchor } from '../anchor';
// import { BREAKPTS } from '../../styles';
// import { ExternalLinkIcon } from '../icons/externalLink';
// import Link from 'next/link';
// import { ROUTES } from '../../constants/routes';
// import { Flex } from '../flex';
// import useMeasure from 'react-use-measure';
// import { NATIVE_RATIO } from '@hash/types';
// import { useEvent, useWindowSize } from 'react-use';
// import { debounce } from '../../utils/debounce';
// import { useHash } from '../../hooks/useHash';
// import { getTwitterShareLink } from '../../utils/twitter';

// export interface CarouselProps {
//   collectionName?: string;
//   collectionLink?: string;
//   data?: CarouselData[];
//   id: string;
// }

// export interface SpringAnimationState {
//   transform: [number, number];
//   opacity: number;
// }

// export const CARD_PADDING = 160;
// export const FRAME_BOTTOM_PADDING = 64;
// export const CAROUSEL_SIDE_CARDS_OFFSET = 500;
// export const PLAY_DURATION_IN_MS = 10000;

// export const Carousel: React.FC<CarouselProps> = ({
//   data,
//   collectionName,
//   id,
//   collectionLink,
// }) => {
//   const ids = useMemo(() => data?.map((d) => d.id), [data]);

//   const {
//     getCarousel,
//     incrementCarouselIndex,
//     decrementCarouselIndex,
//     setValues,
//     carouselIndex,
//     values,
//   } = useCarouselStore(
//     useCallback(
//       (s) => {
//         return {
//           getCarousel: s.getCarousel(id),
//           incrementCarouselIndex: s.incrementCarouselIndex(id),
//           decrementCarouselIndex: s.decrementCarouselIndex(id),
//           setValues: s.setValues(id),
//           carouselIndex: s.carouselIndexMap[id] ?? 0,
//           values: s.valuesMap[id] ?? [],
//         };
//       },
//       [id],
//     ),
//   );

//   useEffect(() => {
//     if (!data) {
//       return;
//     }
//     setValues(data);
//   }, [data]);

//   const lifeCycle = useMemo(() => getCarousel(), [values, carouselIndex]);

//   // measurements
//   const [flexCenterRef, flexCenterBounds] = useMeasure();

//   const cardDimensionsBySketchDimensions: [number, number] = useMemo(() => {
//     const { height, width } = flexCenterBounds;
//     const mW = width / NATIVE_RATIO[0];
//     const mH = height / NATIVE_RATIO[1];

//     return mH < mW
//       ? [
//           Math.round((height * NATIVE_RATIO[0]) / NATIVE_RATIO[1]) -
//             Math.round((CARD_PADDING * NATIVE_RATIO[0]) / NATIVE_RATIO[1]),
//           height - CARD_PADDING,
//         ]
//       : [
//           width -
//             Math.round((CARD_PADDING * NATIVE_RATIO[0]) / NATIVE_RATIO[1]),
//           Math.round((NATIVE_RATIO[1] * width) / NATIVE_RATIO[0]) -
//             CARD_PADDING,
//         ];
//   }, [flexCenterBounds]);

//   const windowSize = useWindowSize();

//   const transitionDistance = useMemo(() => {
//     return (
//       cardDimensionsBySketchDimensions[0] * 0.9 +
//       (windowSize.width - cardDimensionsBySketchDimensions[0]) / 2
//     );
//   }, [cardDimensionsBySketchDimensions, windowSize]);

//   const getAnimationStateFromCardState = useCallback(
//     (state: CarouselCardState): SpringAnimationState => {
//       if (state === 'center') {
//         return { transform: [0, 1], opacity: 1 };
//       }
//       if (state === 'side-left') {
//         return { transform: [-1 * transitionDistance, 1], opacity: 0.1 };
//       }
//       if (state === 'side-right') {
//         return { transform: [1 * transitionDistance, 1], opacity: 0.1 };
//       }
//       if (state === 'prefetch-left') {
//         return { transform: [-2 * transitionDistance, 1], opacity: 0.1 };
//       }
//       if (state === 'prefetch-right') {
//         return { transform: [2 * transitionDistance, 1], opacity: 0.1 };
//       }
//       return { transform: [0, 1], opacity: 1 };
//     },
//     [transitionDistance],
//   );

//   // keyboard controls
//   const debouncedIncrementCarouselIndex = useCallback(
//     () =>
//       debounce(() => {
//         incrementCarouselIndex();
//       }, 20)(),
//     [],
//   );
//   const debouncedDecrementCarouselIndex = useCallback(
//     () =>
//       debounce(() => {
//         decrementCarouselIndex();
//       }, 20)(),
//     [],
//   );

//   // lifecycle states
//   const shouldShowLeftArrow = useMemo(() => !!lifeCycle[1], [lifeCycle]);
//   const shouldShowRightArrow = useMemo(() => !!lifeCycle[3], [lifeCycle]);

//   // cursor controls
//   const carouselWrapperRef = useRef<HTMLDivElement | null>(null);
//   const [cursorType, setCursorType] = useState<'none' | 'right' | 'left'>(
//     'none',
//   );

//   const carouselWidth = useMemo(() => {
//     if (!carouselWrapperRef.current) {
//       return 0;
//     }
//     return carouselWrapperRef.current.getBoundingClientRect().width;
//   }, [carouselWrapperRef.current, windowSize]);

//   const handleMouseMove = useCallback(
//     (e: any) => {
//       if (!shouldShowLeftArrow && !shouldShowRightArrow) {
//         setCursorType('none');
//         return;
//       }
//       const halfWay = carouselWidth / 2;
//       setCursorType(e.clientX > halfWay ? 'right' : 'left');
//     },
//     [carouselWidth, shouldShowRightArrow, shouldShowLeftArrow],
//   );

//   const handleMouseClick = useCallback(
//     (e: any) => {
//       const halfWay = carouselWidth / 2;
//       if (e.clientX > halfWay) {
//         debouncedIncrementCarouselIndex();
//       } else {
//         debouncedDecrementCarouselIndex();
//       }
//     },
//     [carouselWidth],
//   );

//   useEvent('mousemove', handleMouseMove, carouselWrapperRef.current);

//   const centerData = useMemo(
//     () => data?.[carouselIndex],
//     [data, carouselIndex],
//   );
//   // center hash, f it exists
//   const centerHash = useHash(centerData?.id);

//   const tweetLink = useMemo(() => {
//     if (centerData?.type === 'custom') {
//       return centerData.shareHref;
//     }

//     const collectionLink = `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${centerHash}`;
//     return getTwitterShareLink(
//       collectionLink,
//       'Check out this cool artwork I found on POB!',
//     );
//   }, [centerHash, centerHash]);

//   return (
//     <CarouselWrapper ref={carouselWrapperRef}>
//       <CarouselForegroundLeftContent isHidden={!shouldShowLeftArrow}>
//         <BaseButton onClick={debouncedDecrementCarouselIndex}>
//           <SmallLeftArrow />
//         </BaseButton>
//       </CarouselForegroundLeftContent>
//       <CarouselForegroundRightContent isHidden={!shouldShowRightArrow}>
//         <BaseButton onClick={debouncedIncrementCarouselIndex}>
//           <SmallRightArrow />
//         </BaseButton>
//       </CarouselForegroundRightContent>
//       <CarouselClickNet onClick={handleMouseClick} cursorType={cursorType} />
//       <CarouselMainContent>
//         <TopLeftContainer>
//           <Flex>
//             {collectionLink ? (
//               <Link href={`${collectionLink}`} passHref>
//                 <CleanAnchor>
//                   <CollectionTitle>{collectionName}</CollectionTitle>
//                 </CleanAnchor>
//               </Link>
//             ) : (
//               <DescriptionText>{collectionName}</DescriptionText>
//             )}
//           </Flex>
//         </TopLeftContainer>
//         <BottomLeftContainer>
//           <DescriptionText>
//             {carouselIndex + 1} / {values.length}
//           </DescriptionText>
//         </BottomLeftContainer>
//         <TopRightContainer>
//           {
//             <>
//               <IconButton>
//                 <BaseAnchor href={tweetLink} target={'_blank'}>
//                   <TwitterIcon />
//                 </BaseAnchor>
//               </IconButton>
//               {centerHash && (
//                 <IconButton>
//                   <Link passHref href={`${ROUTES.ART.INDEX}/${centerHash}`}>
//                     <BaseAnchor target={'_blank'}>
//                       <ExternalLinkIcon />
//                     </BaseAnchor>
//                   </Link>
//                 </IconButton>
//               )}
//             </>
//           }
//         </TopRightContainer>
//         <FlexCenter ref={flexCenterRef}>
//           <CardContainer>
//             <GhostCard
//               cardDimensions={cardDimensionsBySketchDimensions}
//               showEmpty={!lifeCycle[2]}
//             />
//             {lifeCycle.map((lc, stateIndex) => {
//               if (!lc) {
//                 return <div key={stateIndex}></div>;
//               }
//               const { key, value } = lc;
//               const carouselState = CAROUSEL_CARD_STATE_LIFECYCLE[stateIndex];
//               let cardState: CardState = 'minimized';

//               if (
//                 carouselState === 'prefetch-left' ||
//                 carouselState === 'prefetch-right'
//               ) {
//                 cardState = 'prefetch';
//               }
//               if (carouselState === 'center') {
//                 cardState = 'focus';
//               }
//               return (
//                 <CardWithCarouselSpringState
//                   key={`carousel-${key}`}
//                   data={value}
//                   carouselState={carouselState}
//                   getAnimationStateFromCardState={
//                     getAnimationStateFromCardState
//                   }
//                   cardState={cardState}
//                   collectionId={id}
//                   cardDimensions={cardDimensionsBySketchDimensions}
//                 />
//               );
//             })}
//           </CardContainer>
//         </FlexCenter>
//       </CarouselMainContent>
//     </CarouselWrapper>
//   );
// };

// export const CardWithCarouselSpringState: FC<
//   CarouselCardProps & {
//     carouselState: CarouselCardState;
//     getAnimationStateFromCardState: any;
//   }
// > = ({ carouselState, getAnimationStateFromCardState, cardState, ...rest }) => {
//   const springState = useMemo(
//     () => getAnimationStateFromCardState(carouselState),
//     [carouselState, getAnimationStateFromCardState],
//   );
//   const zIndex = useMemo(() => (cardState === 'focus' ? 2 : 0), [cardState]);
//   const props = useSpring({
//     to: useMemo(
//       () => ({
//         transform: `translateX(${springState.transform[0]}px) scale(${springState.transform[1]})`,
//         opacity: springState.opacity,
//       }),
//       [springState],
//     ),
//     initial: useMemo(
//       () => ({
//         transform: `translateX(${springState.transform[0]}px) scale(${springState.transform[1]})`,
//         opacity: springState.opacity,
//       }),
//       [],
//     ),
//     config: SPRING_CONFIG,
//   });

//   return (
//     <CardWithSpringAbsoluteWrapper style={{ zIndex }}>
//       <Card {...rest} cardState={cardState} springProps={props} />
//     </CardWithSpringAbsoluteWrapper>
//   );
// };

// const SmallLeftArrow = styled(LargeLeftArrow)`
//   height: 24px;
//   width: 24px;
// `;

// const SmallRightArrow = styled(LargeRightArrow)`
//   height: 24px;
//   width: 24px;
// `;

// const ARTWORK_CARD_STYLE_MOBILE = {
//   display: 'block',
//   position: 'static',
//   width: '100%',
// };

// const ARTWORK_ABSOLUTE_CARD_STYLE_MOBILE = {
//   ...ARTWORK_CARD_STYLE_MOBILE,
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   right: 0,
//   bottom: 'auto',
// };

// const CarouselClickNet = styled.div<{
//   cursorType?: 'right' | 'left' | 'none';
// }>`
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   z-index: 1;
//   cursor: ${(p) =>
//     p.cursorType === undefined || p.cursorType === 'none'
//       ? 'cursor'
//       : p.cursorType === 'right'
//       ? 'url(/cursor/right.svg) 20 20, pointer'
//       : 'url(/cursor/left.svg) 20 20, pointer'};
// `;

// const IconButton = styled(BaseButton)`
//   transition: opacity 150ms ease-out;
//   display: block;
//   height: 20px;
//   width: 20px;
//   svg {
//     height: 20px;
//     width: 20px;
//   }
// `;

// const TopLeftContainer = styled.div`
//   display: flex;
//   align-items: center;
//   position: absolute;
//   top: 16px;
//   left: 16px;
//   z-index: 3;
//   > button + button {
//     margin-left: 8px;
//   }
//   @media (max-width: ${BREAKPTS.SM}px) {
//     top: 8px;
//     left: 8px;
//   }
// `;

// const BottomLeftContainer = styled.div`
//   display: flex;
//   align-items: center;
//   position: absolute;
//   bottom: 16px;
//   left: 16px;
//   z-index: 3;
//   > button + button {
//     margin-left: 8px;
//   }
//   @media (max-width: ${BREAKPTS.SM}px) {
//     bottom: 8px;
//     left: 8px;
//   }
// `;

// const DescriptionText = styled.p`
//   transition: opacity 150ms ease-out;
//   font-weight: 500;
//   opacity: 0.2;
//   font-size: 14px;
//   margin: 0;
// `;

// const CollectionTitle = styled(DescriptionText)`
//   cursor: pointer;
//   &:hover {
//     text-decoration: underline;
//   }
// `;

// const DescriptionAnchor = styled.a`
//   color: black;
//   font-weight: 500;
//   font-size: 14px;
//   margin: 0;
// `;

// const TopRightContainer = styled.div`
//   display: flex;
//   align-items: center;
//   position: absolute;
//   top: 16px;
//   right: 16px;
//   z-index: 2;
//   > * + * {
//     margin-left: 8px;
//   }
//   @media (max-width: ${BREAKPTS.SM}px) {
//     top: 8px;
//     right: 8px;
//   }
// `;

// const CardWithSpringAbsoluteWrapper = styled.div`
//   position: absolute;
//   top: 0;
//   bottom: 0;
//   right: 0;
//   left: 0;
// `;

// const CarouselForegroundSideContent = styled.div<{ isHidden?: boolean }>`
//   opacity: ${(p) => (!p.isHidden ? 1 : 0)};
//   transition: opacity 250ms ease-out;
//   pointer-events: ${(p) => (!p.isHidden ? 'auto' : 'none')};
//   position: absolute;
//   top: 0;
//   bottom: 0;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   width: 27px;
//   height: 27px;
//   margin: auto 0;
//   z-index: 3;
//   /* @media (max-width: ${BREAKPTS.MD}px) {
//     display: none;
//   } */
// `;

// const CarouselForegroundLeftContent = styled(CarouselForegroundSideContent)`
//   left: 16px;
// `;

// const CarouselForegroundRightContent = styled(CarouselForegroundSideContent)`
//   right: 16px;
// `;

// const CarouselWrapper = styled.div`
//   position: relative;
//   width: 100%;
//   height: 100%;
//   overflow: hidden;
// `;

// const CarouselMainContent = styled.div`
//   width: 100%;
//   height: 100%;
//   background: #f8f8f8;
//   z-index: 0;
//   @media (max-width: ${BREAKPTS.LG}px) {
//     padding: 64px 64px;
//   }
//   @media (max-width: ${BREAKPTS.MD}px) {
//     padding: 64px 32px;
//   }
//   @media (max-width: ${BREAKPTS.SM}px) {
//     padding: 42px 8px 78px 8px;
//   }
// `;

// const FlexCenter = styled.div`
//   width: 100%;
//   height: 100%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   position: relative;
//   padding: 0 0 ${FRAME_BOTTOM_PADDING}px 0;
// `;

// const CardContainer = styled.div`
//   position: relative;
// `;

export const deprecated = 'deprecated';
