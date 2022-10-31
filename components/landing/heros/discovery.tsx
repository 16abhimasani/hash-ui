import Link from 'next/link';
import React, { FC } from 'react';
import Marquee from 'react-fast-marquee';
import styled from 'styled-components';
import { HISTORIANS_TWITTER_LINK } from '../../../constants';
import { ROUTES } from '../../../constants/routes';
import { TokenProvider } from '../../../contexts/token';
import { BREAKPTS } from '../../../styles';
import { CleanAnchor } from '../../anchor';
import { PrimaryButton, SecondaryButton } from '../../button';
import { Flex, FlexCenterColumn } from '../../flex';
import { GridItemContent } from '../../grid/items';
import { TwitterIcon } from '../../icons/twitter';
import { MarqueeWrapper } from '../../marquee';
import { HeroSubtitle, HeroWrapper } from './common';

export const DiscoveryHero: FC = () => {
  return (
    <>
      <HeroWrapper>
        <FlexCenterColumn>
          <HeroLargeText>Discover. Curate.</HeroLargeText>
          <HeroLargeText style={{ color: '#FF8A00' }}>Tokenize.</HeroLargeText>
        </FlexCenterColumn>
        <HeroSubtitle>
          <strong>HASH</strong> is a generative art collection where each piece
          represents an Ethereum transaction. Hunt for beautiful moments,
          discover history, and tell your story through HASH.
        </HeroSubtitle>
        <HeroButtonWrapper>
          <Link href={ROUTES.MARKET} passHref>
            <CleanAnchor>
              <HeroButtonPrimary>See Marketplace</HeroButtonPrimary>
            </CleanAnchor>
          </Link>
          <CleanAnchor
            href={HISTORIANS_TWITTER_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            <HeroButtonSecondary>
              @HistoriansDAO <TwitterIcon />
            </HeroButtonSecondary>
          </CleanAnchor>
        </HeroButtonWrapper>
        <br /> <br /> <br />
        <ArtCardMarquee />
      </HeroWrapper>
    </>
  );
};

const ArtCardMarquee: FC<{
  width?: string;
  direction?: 'left' | 'right';
}> = ({ width, direction }) => {
  return (
    <MarqueeWrapper width={width}>
      <Marquee gradient={false} direction={direction ?? 'left'} speed={32}>
        {Array(2)
          .fill(0)
          .map((_e, index: number) => (
            <GridItemWrapper key={`hero-art-grid-${index}`}>
              <TokenProvider
                hash={
                  '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060'
                }
                shouldNotFetchMetadataLive={true}
                shouldNotFetchMetadataFromApi={true}
                shouldNotFetchMetadataFromFirestore={false}
              >
                <GridItemContent width={256} />
              </TokenProvider>
              <TokenProvider
                hash={
                  '0x28dc1bef4a54d7e5ecad157364a5154c24801ab80e5fd4bc7ad61425bd8813da'
                }
                shouldNotFetchMetadataLive={true}
                shouldNotFetchMetadataFromApi={true}
                shouldNotFetchMetadataFromFirestore={false}
              >
                <GridItemContent width={256} />
              </TokenProvider>
              <TokenProvider
                hash={
                  '0x39effaa3280ee43c84af8db7936d0bf982bc72ea2f50af30bdcd5461eff6cdb5'
                }
                shouldNotFetchMetadataLive={true}
                shouldNotFetchMetadataFromApi={true}
                shouldNotFetchMetadataFromFirestore={false}
              >
                <GridItemContent width={256} />
              </TokenProvider>

              <TokenProvider
                hash={
                  '0xeef10fc5170f669b86c4cd0444882a96087221325f8bf2f55d6188633aa7be7c'
                }
                shouldNotFetchMetadataLive={true}
                shouldNotFetchMetadataFromApi={true}
                shouldNotFetchMetadataFromFirestore={false}
              >
                <GridItemContent width={256} />
              </TokenProvider>
              <TokenProvider
                hash={
                  '0xbdab447ba2fd0a493d93635da202ebcfaa309bcc6a22a95d808c93ce8f1c6c2d'
                }
                shouldNotFetchMetadataLive={true}
                shouldNotFetchMetadataFromApi={true}
                shouldNotFetchMetadataFromFirestore={false}
              >
                <GridItemContent width={256} />
              </TokenProvider>
              <TokenProvider
                hash={
                  '0x5488510df045770efbff57f25d0c6d2c1404d58c1199b21eb8dc5072b22d91d7'
                }
                shouldNotFetchMetadataLive={true}
                shouldNotFetchMetadataFromApi={true}
                shouldNotFetchMetadataFromFirestore={false}
              >
                <GridItemContent width={256} />
              </TokenProvider>
              <TokenProvider
                hash={
                  '0xdaaa0b08e0fa932ebf1ebc9ed2de9a6eb4db3f03c77e9ed937d9c9a3a49e2b81'
                }
                shouldNotFetchMetadataLive={true}
                shouldNotFetchMetadataFromApi={true}
                shouldNotFetchMetadataFromFirestore={false}
              >
                <GridItemContent width={256} />
              </TokenProvider>
              <TokenProvider
                hash={
                  '0x4b37d2f343608457ca3322accdab2811c707acf3eb07a40dd8d9567093ea5b82'
                }
                shouldNotFetchMetadataLive={true}
                shouldNotFetchMetadataFromApi={true}
                shouldNotFetchMetadataFromFirestore={false}
              >
                <GridItemContent width={256} />
              </TokenProvider>
              <TokenProvider
                hash={
                  '0xe7e0fe390354509cd08c9a0168536938600ddc552b3f7cb96030ebef62e75895'
                }
                shouldNotFetchMetadataLive={true}
                shouldNotFetchMetadataFromApi={true}
                shouldNotFetchMetadataFromFirestore={false}
              >
                <GridItemContent width={256} />
              </TokenProvider>
              <TokenProvider
                hash={
                  '0x5489c98aa634078471646e32a3a846c8d413f055ce10d06bd2260f4e71d1bc63'
                }
                shouldNotFetchMetadataLive={true}
                shouldNotFetchMetadataFromApi={true}
                shouldNotFetchMetadataFromFirestore={false}
              >
                <GridItemContent width={256} />
              </TokenProvider>
              <TokenProvider
                hash={
                  '0x495402df7d45fe36329b0bd94487f49baee62026d50f654600f6771bd2a596ab'
                }
                shouldNotFetchMetadataLive={true}
                shouldNotFetchMetadataFromApi={true}
                shouldNotFetchMetadataFromFirestore={false}
              >
                <GridItemContent width={256} />
              </TokenProvider>
            </GridItemWrapper>
          ))}
      </Marquee>
    </MarqueeWrapper>
  );
};

const GridItemWrapper = styled.div`
  display: flex;
  gap: 32px;
  padding-left: 32px;
`;

const HeroButtonWrapper = styled(Flex)`
  width: fit-content;
  gap: 16px;

  margin-top: 32px;
  @media (max-width: ${BREAKPTS.MD}px) {
    flex-direction: column;
    margin-top: 16px;
    width: 100%;
  }
`;
const HeroButtonPrimary = styled(PrimaryButton)`
  font-size: 16px;
`;
const HeroButtonSecondary = styled(SecondaryButton)`
  text-transform: none;
  font-size: 16px;
  svg {
    margin-left: 8px;
    width: 20px;
    height: 20px;
  }
`;

const HeroLargeText = styled.div`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 96px;
  line-height: 110px;
  display: flex;
  align-items: center;
  text-align: center;
  @media (max-width: ${BREAKPTS.MD}px) {
    font-size: 56px;
    line-height: unset;
  }
`;
