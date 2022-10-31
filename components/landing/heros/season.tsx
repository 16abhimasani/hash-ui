import React, { FC } from 'react';
import Marquee from 'react-fast-marquee';
import styled from 'styled-components';
import { HEADER_HEIGHT } from '../../../constants';
import { BREAKPTS } from '../../../styles';
import { MarqueeWrapper } from '../../marquee';

export const SeasonHero: FC = () => {
  return (
    <HeroWrapper>
      <HashLogoMarquee />
      <HashLogoMarquee direction="right" />
      <HashLogoMarquee />
      <HashLogoMarquee direction="right" />
      <CenterBar>
        {'<'}
        {'<'} s2: hunt / coming soon {'>'}
        {'>'}
      </CenterBar>
    </HeroWrapper>
  );
};

const HashLogoMarquee: FC<{
  width?: string;
  direction?: 'left' | 'right';
}> = ({ width, direction }) => {
  return (
    <MarqueeWrapper width={width}>
      <Marquee gradient={false} direction={direction ?? 'left'} speed={64}>
        {Array(16)
          .fill(0)
          .map((_e, index: number) => (
            <HashLogoMarqueeImg
              key={`hash-logo-marquee-${index}`}
              src={'/assets/logos/hash.png'}
            />
          ))}
      </Marquee>
    </MarqueeWrapper>
  );
};

const HeroWrapper = styled.div`
  height: calc(100vh - ${HEADER_HEIGHT}px);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
`;

const CenterBar = styled.div`
  position: absolute;
  z-index: 1;
  width: 100vw;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Helvetica Neue;
  font-style: normal;
  font-weight: bold;
  font-size: 32px;
  white-space: nowrap;
  text-transform: lowercase;
  color: #ffffff;
  padding: 64px;
  overflow: hidden;

  @media (max-width: ${BREAKPTS.MD}px) {
    font-size: 24px;
  }
`;

const HashLogoMarqueeImg = styled.img`
  width: 27vh;
  padding: 20px;
`;
