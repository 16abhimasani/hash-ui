import Link from 'next/link';
import React, { FC } from 'react';
import styled from 'styled-components';
import { HUNDRED_PERCENT_BPS, MARKET_FEE_AMOUNT_BPS } from '../../../constants';
import { ROUTES } from '../../../constants/routes';
import { BREAKPTS } from '../../../styles';
import { CleanAnchor } from '../../anchor';
import { Flex, FlexCenterColumn } from '../../flex';
import { HeroSubtitle, HeroWrapper } from './common';

export const FeatureHero: FC = () => {
  return (
    <>
      <HeroWrapper>
        <FlexCenterColumn>
          <HeroLargeText>web3’s</HeroLargeText>
          <HeroLargeText style={{ color: '#7C40FF' }}>
            Library of Alexandria
          </HeroLargeText>
        </FlexCenterColumn>
        <HeroSubtitle>
          Indexing the chain is hard work. Which is why we need your help to
          build a community of reputable & knowledgeable members ready to verify
          & curate the library of Ethereum.
        </HeroSubtitle>

        <FeatureCardGrid>
          <FlexCenterColumn>
            <FeatureCard>
              <FeatureCardTitle>Weave your Narrative</FeatureCardTitle>
              <FeatureCardSubTitle>
                Use Comments to directly append some text, a Tweet, or any NFT
                to a HASH. Use our Save feature to keep track of interesting or
                beautiful moments you stumble across.
              </FeatureCardSubTitle>
              <FeatureCardHoverImg src="/imgs/features/comment-ex.png" />
            </FeatureCard>
            <FeatureCard>
              <FeatureCardTitle>Native Trading & Marketplace</FeatureCardTitle>
              <FeatureCardSubTitle>
                Use our marketplace to save on trading commissions & upgrade to
                the new ERC-721 version of HASH. This upgrade future-proofs your
                token while allowing you to use the most efficient trading
                protocol in the world.
              </FeatureCardSubTitle>
              <br /> <br />
              <FeatureCardCell>
                <FeatureCardCellCol>
                  <Flex style={{ gap: 12 }}>
                    <img src="/assets/logos/hash-green.png" />
                    <Flex
                      style={{
                        flexDirection: 'column',
                        alignItems: 'start',
                        gap: 4,
                      }}
                    >
                      <FeatureCardCellTitle>HASH - ERC721</FeatureCardCellTitle>
                      <FeatureCardCellSubTitle>
                        Trading powered by 0x Protocol
                      </FeatureCardCellSubTitle>
                    </Flex>
                  </Flex>
                </FeatureCardCellCol>
                <FeatureCardCellCol>
                  <Flex
                    style={{
                      flexDirection: 'column',
                      alignItems: 'start',
                      gap: 4,
                    }}
                  >
                    <FeatureCardCellLabel>Commission</FeatureCardCellLabel>
                    <FeatureCardCellValue>
                      {(
                        (MARKET_FEE_AMOUNT_BPS / HUNDRED_PERCENT_BPS) *
                        100
                      ).toFixed(2)}
                      %
                    </FeatureCardCellValue>
                  </Flex>
                </FeatureCardCellCol>
              </FeatureCardCell>
            </FeatureCard>
          </FlexCenterColumn>
          <FlexCenterColumn>
            <FeatureCard>
              <FeatureCardTitle>Search & Explore</FeatureCardTitle>
              <FeatureCardSubTitle>
                With our powerful search feature, you can view any txs related
                to “DAOs”, filter by Smart Tags, view Curations, Comments,
                Profiles, and more.
              </FeatureCardSubTitle>
              <FeatureCardHoverImg src="/imgs/features/search-ex.png" />
            </FeatureCard>
            <FeatureCard>
              <FeatureCardTitle>Smart Tag Builder</FeatureCardTitle>
              <FeatureCardSubTitle>
                Use the Historian Tag Builder to label known contracts, group
                together tags, & better index the chain. Tags offer a searchable
                & scalable way to query txs.{' '}
                <Link href={ROUTES.TAGS}>
                  <CleanAnchor>Learn more</CleanAnchor>
                </Link>
              </FeatureCardSubTitle>

              <img src="/imgs/features/tags-ex.png" />
            </FeatureCard>
          </FlexCenterColumn>
        </FeatureCardGrid>
      </HeroWrapper>
    </>
  );
};

const FeatureCardCell = styled.div`
  display: flex;
  background: white;
  box-shadow: 0px 9px 20px rgba(0, 0, 0, 0.14);
  border-radius: 8px;
  padding: 20px;
  justify-content: space-between;
  align-items: center;
  height: fit-content;
  width: 100%;
`;
const FeatureCardCellCol = styled.div`
  display: flex;
  background: white;
  gap: 12
  justify-content: space-between;
  align-items: center;
  width: fit-content;
  height: fit-content;
  img {
    width: 48px !important;
    height: 48px !important;
    margin: 0 !important;
    @media (max-width: ${BREAKPTS.MD}px) {
      display: none;
    }
  }
`;
const FeatureCardCellTitle = styled.div`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  line-height: 21px;
  color: #000000;
`;
const FeatureCardCellSubTitle = styled.div`
  font-family: Helvetica;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.5);
`;
const FeatureCardCellLabel = styled.div`
  font-family: Helvetica;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 14px;
  color: rgba(0, 0, 0, 0.5);
`;
const FeatureCardCellValue = styled.div`
  font-family: Helvetica Neue;
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  line-height: 29px;
  color: #000000;
`;

const FeatureCardGrid = styled.div`
  display: flex;
  padding: 56px;
  gap: 40px;
  width: 100%;
  ${FlexCenterColumn} {
    gap: 40px;
  }
  @media (max-width: ${BREAKPTS.MD}px) {
    flex-direction: column;
  }
`;
const FeatureCard = styled.div`
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  img {
    overflow: hidden;
    width: 100%;
    margin-top: 32px;
  }
`;
const FeatureCardHoverImg = styled.img`
  box-shadow: 0px 9px 20px rgba(0, 0, 0, 0.14);
  border-radius: 8px;
`;
const FeatureCardTitle = styled.div`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  display: flex;
  align-items: center;
  color: #000000;
  margin-bottom: 16px;
`;
const FeatureCardSubTitle = styled.div`
  font-family: Helvetica;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.5);
  a {
    font-weight: bold;
    cursor: pointer;
  }
`;

const HeroLargeText = styled.div`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 64px;
  line-height: 74px;
  display: flex;
  align-items: center;
  text-align: center;
  color: #000000;

  @media (max-width: ${BREAKPTS.MD}px) {
    font-size: 40px;
    line-height: unset;
  }
`;
