import { NextPage } from 'next';
import React from 'react';
import styled from 'styled-components';
import { ContentWrapper } from '../components/content';
import { Footer } from '../components/footer-full';
import { Header } from '../components/header';
import { DiscoveryHero } from '../components/landing/heros/discovery';
import { FeatureHero } from '../components/landing/heros/features';

const IndexPage: NextPage = () => {
  return (
    <ContentWrapper>
      <Header />
      <MainContent>
        {/* <SeasonHero /> */}
        <DiscoveryHero />
        <FeatureHero />
      </MainContent>
      <Footer />
    </ContentWrapper>
  );
};
export default React.memo(IndexPage);

const MainContent = styled.div`
  width: 100%;
`;
