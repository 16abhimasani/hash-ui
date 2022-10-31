import React, { FC } from 'react';
import Marquee from 'react-fast-marquee';
import styled from 'styled-components';
import { TWITTER_LINK } from '../constants';
import { BREAKPTS, HollowText } from '../styles';

export const DesktopMarqueeTwitter: FC<{ width: string }> = ({ width }) => {
  return (
    <MarqueeWrapper width={width}>
      <Marquee gradient={false} direction="left" speed={60}>
        {Array(12)
          .fill(0)
          .map((_e, index: number) => (
            <MarqueeLinkStyleTwitter
              key={`share-twitter-marquee-${index}`}
              as="a"
              href={TWITTER_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow on Twitter /
            </MarqueeLinkStyleTwitter>
          ))}
      </Marquee>
    </MarqueeWrapper>
  );
};

export const DesktopMarqueeEthHistory: FC<{
  width: string;
  height?: string;
  speed?: number;
}> = ({ width, height, speed = 60 }) => {
  return (
    <MarqueeWrapper width={width} height={height}>
      <Marquee gradient={false} direction="left" speed={speed}>
        {Array(12)
          .fill(0)
          .map((_e, index: number) => (
            <MarqueeLinkStyleEthHistory key={`eth-history-marquee-${index}`}>
              ETHEREUM IS OUR HISTORY
            </MarqueeLinkStyleEthHistory>
          ))}
      </Marquee>
    </MarqueeWrapper>
  );
};

export const DesktopMarqueeNewPricing: FC<{
  width: string;
  speed?: number;
}> = ({ width, speed = 60 }) => {
  return (
    <MarqueeWrapper width={width}>
      <Marquee gradient={false} direction="left" speed={speed}>
        {Array(12)
          .fill(0)
          .map((_e, index: number) => (
            <MarqueeLinkStyleNewPricing key={`new-pricing-marquee-${index}`}>
              new pricing for season 1
            </MarqueeLinkStyleNewPricing>
          ))}
      </Marquee>
    </MarqueeWrapper>
  );
};

export const MarqueeLinkStyle = styled.div`
  color: white;
  text-transform: uppercase;
  text-decoration: none;
  margin-right: 8px;
  font-size: 32px;
  white-space: nowrap;
`;

export const MarqueeLinkStyleTwitter = styled(MarqueeLinkStyle)`
  ${HollowText('#1DA1F2')}
`;

export const MarqueeLinkStyleEthHistory = styled(MarqueeLinkStyle)`
  ${HollowText('#0000FF')}
  font-size: 100px;
  font-weight: bold;
  margin-right: 32px;
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 72px;
  }
`;

export const MarqueeLinkStyleNewPricing = styled(MarqueeLinkStyle)`
  ${HollowText('#0000FF')}
  font-size: 44px;
  font-weight: bold;
  font-style: italic;
  margin-right: 32px;
  text-transform: lowercase;
`;

export const MarqueeWrapper = styled.div<{ width?: string; height?: string }>`
  z-index: 3;
  display: flex;
  flex-direction: column;
  width: ${(props) => (props.width ? props.width : '100%')};
  transform: translateY(7px);
  .marquee {
    margin: 0 !important;
  }
  .marquee-container {
    height: ${(props) => (props.height ? props.height : 'fit-content')};
    &:not(:first-child) {
      margin-top: 12px;
    }
  }
`;
