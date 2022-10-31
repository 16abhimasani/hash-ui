// import React, {
//   FC,
//   HTMLProps,
//   useCallback,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
// import { animated, config, useSpring } from 'react-spring';
// import { Canvas as GenesisCanvas } from '../../sketches/genesis/canvas';
// import { Canvas as SagaCanvas } from '../../sketches/saga/canvas';
// import styled from 'styled-components';
// import { LoadingCard, EmptyCard } from '../loadingCard';
// import { getArtworkPreviewUrl, getOpenSeaUrl } from '../../utils/urls';
// import { Flex, FlexEnds } from '../flex';
// import { shortenHexString } from '../../utils/hex';
// import { useTokenId } from '../../hooks/useTokenId';
// import { useFormattedPriceFromOS } from '../../hooks/useOpenSea';
// import qs from 'query-string';
// import Link from 'next/link';
// import { ROUTES } from '../../constants/routes';
// import { UserAvatar } from '../avatar';
// import { usePriorityAccount } from '@web3-react/core';
// import { MonoAnchorWithIcon } from '../anchor';
// import { VerdictBadge } from '../verdictBadge';
// import {
//   CarouselData,
//   CustomCarouselData,
//   HashCarouselData,
// } from '../../stores/carousel';
// import { utils } from 'ethers';
// import { useParallax, useParallaxDelta } from '../../hooks/useParallax';
// import { Render } from '../render';
// import { useHash } from '../../hooks/useHash';
// import { useUserAddedMetadataByHash } from '../../hooks/useUserAddedMetadata';
// import {
//   TokenProvider,
//   useHashByContext,
//   useMintStateByContext,
//   useOwnerByContext,
//   useTokenIdByContext,
//   useUserAddedMetadataByContext,
// } from '../../contexts/token';
// import { useUser } from '../../hooks/useUser';

// export interface CarouselCardProps {
//   data?: CarouselData;
//   springProps?: any;
//   cardState?: CardState;
//   cardDimensions: [number, number];
//   collectionId?: string;
// }

// export type CardState = 'minimized' | 'focus' | 'default' | 'prefetch';
// export const TIME_DELAY_TO_NORMAL_IN_MS = 800;

// const AssetImage = styled.img``;

// const UnMemoizedCard: FC<CarouselCardProps> = (props) => {
//   const hashOrId = useMemo(() => {
//     if (props.data?.type === 'hash' && !props.data?.asset) {
//       return props.data?.id;
//     }
//     return undefined;
//   }, [props.data]);

//   if (!hashOrId) {
//     return <CardContent {...props} />;
//   }

//   return (
//     <TokenProvider hashOrId={hashOrId}>
//       <CardContent {...props} />
//     </TokenProvider>
//   );
// };

// const CardContent: FC<CarouselCardProps> = (props) => {
//   const { data, cardState, springProps, cardDimensions, collectionId } = props;
//   const hash = useHashByContext();
//   const hashOrUndefined = useMemo(() => hash ?? undefined, [hash]);

//   const [isParallax, setIsParallax] = useState(false);
//   const handleArtworkClick = useCallback(() => {
//     setIsParallax((p) => !p);
//   }, []);

//   return (
//     <AnimatedCardWrapper
//       style={{
//         ...springProps,
//       }}
//     >
//       {hashOrUndefined && (
//         <Render
//           key={`carousel-well-${hash}`}
//           hashOrId={hashOrUndefined}
//           dimensions={cardDimensions}
//           isParallax={isParallax}
//           shouldEnableRAFLoop={false}
//           handleArtworkClick={handleArtworkClick}
//         />
//       )}
//       {data?.asset && (
//         <AssetImage
//           src={data?.asset}
//           style={{
//             width: cardDimensions[0],
//             height: cardDimensions[1],
//           }}
//         />
//       )}
//       {!!props.data && props.data.type === 'custom' && (
//         <CustomRichMetadataBottomDetails
//           data={props.data}
//           cardState={cardState}
//         />
//       )}
//       {!!props.data && props.data.type === 'hash' && (
//         <HashBottomDetails
//           data={props.data}
//           cardState={cardState}
//           collectionId={collectionId}
//         />
//       )}
//     </AnimatedCardWrapper>
//   );
// };

// const UnMemoizedGhostCard: FC<{
//   springProps?: any;
//   showEmpty: boolean;
//   cardDimensions: [number, number];
// }> = ({ springProps, showEmpty, cardDimensions }) => {
//   return (
//     <AnimatedCardWrapper
//       style={{
//         width: `${cardDimensions[0]}px`,
//         height: `${cardDimensions[1]}px`,
//         pointerEvents: 'none',
//         ...springProps,
//       }}
//     >
//       {showEmpty && <EmptyCard />}
//     </AnimatedCardWrapper>
//   );
// };

// export const Card = React.memo(UnMemoizedCard);
// export const GhostCard = React.memo(UnMemoizedGhostCard);

// const VerdictBadgeContainer = styled.div`
//   position: absolute;
//   right: 12px;
//   top: -4px;
// `;

// export const HashBottomDetails: FC<{
//   data: HashCarouselData;
//   collectionId?: string;
//   cardState: CardState | undefined;
// }> = ({ data, cardState, collectionId }) => {
//   const hash = useHashByContext();
//   const mintState = useMintStateByContext();

//   const expandedProps = useSpring({
//     to: useMemo(
//       () => ({
//         transform:
//           cardState === 'focus' ? 'translateY(0)' : 'translateY(-16px)',
//         opacity: cardState === 'focus' ? 1 : 0,
//       }),
//       [cardState],
//     ),
//     config: config.default,
//     // hack to do delayed scale
//     delay: useMemo(() => {
//       if (cardState === 'focus') {
//         return TIME_DELAY_TO_NORMAL_IN_MS;
//       }
//       return 0;
//     }, [cardState]),
//   });
//   const tokenId = useTokenIdByContext();
//   const owner = useOwnerByContext();
//   const formattedPrice = useFormattedPriceFromOS(tokenId ?? undefined);
//   const userAddedMetadata = useUserAddedMetadataByContext();
//   const { bestName: accountName } = useUser(owner) ?? {};

//   const metadata = useMemo(() => {
//     return data?.title || data?.description
//       ? {
//           ...{
//             name: userAddedMetadata?.name,
//             description: userAddedMetadata?.description,
//           },
//           title: data.title,
//           description: data.description,
//         }
//       : {
//           name: userAddedMetadata?.name,
//           description: userAddedMetadata?.description,
//         };
//   }, [userAddedMetadata, data]);

//   if (mintState === 'no-more-editions') {
//     return <></>;
//   }

//   // TODO: minting status
//   if (mintState === 'mintable') {
//     return <></>;
//     // return (
//     //   <ABottomContainer style={{ ...expandedProps, marginTop: 12 }}>
//     //     {/* <VerdictBadgeContainer>
//     //       <VerdictBadge/>
//     //     </VerdictBadgeContainer> */}
//     //     <MintableBottomDetailsContent
//     //       metadata={metadata}
//     //       hash={hash ?? undefined}
//     //       collectionId={collectionId}
//     //     />
//     //   </ABottomContainer>
//     // );
//   }

//   return (
//     <ABottomContainer style={{ ...expandedProps, marginTop: 12 }}>
//       {!!userAddedMetadata?.verdict && (
//         <VerdictBadgeContainer>
//           <VerdictBadge opinion={userAddedMetadata.verdict.opinionType} />
//         </VerdictBadgeContainer>
//       )}
//       <Link
//         href={`${ROUTES.ART.INDEX}/${hash}?${qs.stringify({
//           from: collectionId,
//         })}`}
//         passHref
//       >
//         <ArtworkTitle>{metadata?.name}</ArtworkTitle>
//       </Link>
//       {!!metadata?.description && (
//         <Flex>
//           <ArtworkSubtitle style={{ paddingTop: 6 }}>
//             {metadata.description}
//           </ArtworkSubtitle>
//         </Flex>
//       )}
//       <FlexEnds style={{ paddingTop: 8, width: '100%' }}>
//         <ArtworkLabel>
//           {!!owner && (
//             <>
//               Owned by{' '}
//               <Link href={`${ROUTES.COLLECTION}/${owner}`} passHref>
//                 <ArtworkAnchor>
//                   {accountName}
//                   <UserAvatar user={owner} />
//                 </ArtworkAnchor>
//               </Link>
//             </>
//           )}
//         </ArtworkLabel>
//         <MonoAnchorWithIcon
//           href={!!tokenId ? getOpenSeaUrl(tokenId) : '#'}
//           target={'_blank'}
//         >
//           {!!formattedPrice ? formattedPrice : 'OpenSea'}
//         </MonoAnchorWithIcon>
//       </FlexEnds>
//     </ABottomContainer>
//   );
// };

// // export const MintableBottomDetailsContent: FC<{
// //   hash: string | undefined;
// //   metadata: any;
// //   collectionId?: string;
// // }> = ({ metadata, hash, collectionId }) => {
// //   const { preferredMinterType, adjustedCurrentPriceToMintInWei } =
// //     useSagaMinter(!!hash ? [hash] : undefined);
// //   return (
// //     <>
// //       <Link
// //         passHref
// //         href={`${ROUTES.ART.INDEX}/${hash}?${qs.stringify({ from: collectionId })}`}
// //       >
// //         <ArtworkTitle>
// //           {metadata?.title || shortenHexString(hash ?? '', 6)}
// //         </ArtworkTitle>
// //       </Link>
// //       {!!metadata?.description && (
// //         <Flex>
// //           <ArtworkSubtitle style={{ paddingTop: 6 }}>
// //             {metadata.description}
// //           </ArtworkSubtitle>
// //         </Flex>
// //       )}
// //       <FlexEnds style={{ paddingTop: 8, width: '100%' }}>
// //         {!!preferredMinterType ? (
// //           <ArtworkLabel>
// //             Mint for{' '}
// //             {formatEther(adjustedCurrentPriceToMintInWei[preferredMinterType])}{' '}
// //             ETH
// //           </ArtworkLabel>
// //         ) : (
// //           <ArtworkLabel>-</ArtworkLabel>
// //         )}
// //         <Link
// //           passHref
// //           href={`${ROUTES.ART.INDEX}/${hash}?${qs.stringify({ from: collectionId })}`}
// //         >
// //           <MonoAnchorWithIcon as={'a'}>View Details</MonoAnchorWithIcon>
// //         </Link>
// //       </FlexEnds>
// //     </>
// //   );
// // };

// export const CustomRichMetadataBottomDetails: FC<{
//   data: CustomCarouselData;
//   cardState: CardState | undefined;
// }> = ({ data, cardState }) => {
//   const expandedProps = useSpring({
//     to: useMemo(
//       () => ({
//         transform:
//           cardState === 'focus' ? 'translateY(0)' : 'translateY(-16px)',
//         opacity: cardState === 'focus' ? 1 : 0,
//       }),
//       [cardState],
//     ),
//     config: config.default,
//     // hack to do delayed scale
//     delay: useMemo(() => {
//       if (cardState === 'focus') {
//         return TIME_DELAY_TO_NORMAL_IN_MS;
//       }
//       return 0;
//     }, [cardState]),
//   });

//   const { title, description, linkLabel, linkHref, price, priceHref } = data;
//   return (
//     <ABottomContainer style={{ ...expandedProps, marginTop: 8 }}>
//       <Link href={linkHref} passHref>
//         <ArtworkTitle target="_blank" rel="noopener noreferrer">
//           {title}
//         </ArtworkTitle>
//       </Link>
//       <Flex>
//         <ArtworkSubtitle style={{ paddingTop: 6 }}>
//           {description}
//         </ArtworkSubtitle>
//       </Flex>
//       <FlexEnds style={{ paddingTop: 8, width: '100%' }}>
//         <ArtworkLabel>
//           Get for{' '}
//           <Link href={priceHref} passHref>
//             <ArtworkAnchor target="_blank" rel="noopener noreferrer">
//               {utils.formatEther(price)} ETH
//             </ArtworkAnchor>
//           </Link>
//         </ArtworkLabel>
//         <MonoAnchorWithIcon
//           as={'a'}
//           href={linkHref}
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           {linkLabel}
//         </MonoAnchorWithIcon>
//       </FlexEnds>
//     </ABottomContainer>
//   );
// };

// const CardWrapper = styled.div`
//   position: relative;
// `;

// const AnimatedCardWrapper = animated(CardWrapper);

// const LargeCardWebglContainer = styled.div<{
//   isArtFocused?: boolean;
//   isExpanded?: boolean;
// }>`
//   width: 100%;
//   height: 100%;
//   z-index: 1;
//   /* ~ original ~ */
//   /* box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.08); */
//   /* ~ zora ~ */
//   /* filter: drop-shadow(0px 22px 22px rgba(0, 0, 0, 0.33)); */
//   filter: drop-shadow(0px 12px 16px rgba(0, 0, 0, 0.24));
//   position: relative;
//   cursor: ${(p) =>
//     p.isExpanded === undefined
//       ? 'cursor'
//       : p.isExpanded
//       ? p.isArtFocused
//         ? 'url(/cursor/expand.svg) 20 20, pointer'
//         : 'url(/cursor/shrink.svg) 20 20, pointer'
//       : 'url(/cursor/click.svg) 20 20, pointer'};
// `;

// const LargeCardWebglScaleWrapper = styled.div`
//   width: 100%;
//   height: 100%;
// `;

// const ALargeCardWebglScaleWrapper = animated(LargeCardWebglScaleWrapper);

// const SignatureImage = styled.img`
//   position: absolute;
//   bottom: 10px;
//   right: -10px;
//   width: 120px;
//   z-index: 2;
// `;

// const StyledImage = styled.img`
//   width: 100%;
//   height: 100%;
//   top: 0;
//   bottom: 0;
//   left: 0;
//   right: 0;
//   position: absolute;
//   z-index: 0;
// `;

// const AnimatedImage = animated(StyledImage);

// const AnimatedLargeCardWebglContainer = animated(LargeCardWebglContainer);

// const ArtworkTitle = styled.a`
//   font-size: 14px;
//   text-transform: uppercase;
//   font-weight: bold;
//   margin: 0;
//   width: 100%;
//   white-space: nowrap;
//   display: block;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   color: black;
//   cursor: pointer;
//   :hover {
//     text-decoration: underline;
//   }
// `;

// const ArtworkSubtitle = styled.p`
//   font-size: 12px;
//   margin: 0;
//   opacity: 0.4;
//   width: 100%;
//   white-space: nowrap;
//   display: block;
//   overflow: hidden;
//   text-overflow: ellipsis;
// `;

// const ArtworkLabel = styled.p`
//   font-size: 12px;
//   margin: 0;
//   color: rgba(0, 0, 0, 0.3);
// `;

// const ArtworkAnchor = styled.a`
//   color: black;
//   font-weight: bold;
//   font-size: 12px;
//   text-decoration: none;
//   :hover {
//     text-decoration: underline;
//   }
// `;

// const BottomContainer = styled.div`
//   position: absolute;
//   right: 0;
//   left: 0;
//   border: 1px solid #f0f0f0;
//   padding: 12px;
//   width: 100%;
//   max-width: 100%;
//   align-items: flex-start;
//   flex-direction: column;
// `;

// const ABottomContainer = animated(BottomContainer);

export const deprecated = 'deprecated';
