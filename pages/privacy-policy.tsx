import { NextPage } from 'next';
import { NextSeo } from 'next-seo';
import React from 'react';
import styled from 'styled-components';
import { ContentWrapper, MainContent } from '../components/content';
import { Footer } from '../components/footer';
import { Header } from '../components/header';
import { Title } from '../components/text';
import { HASH_PROD_LINK } from '../constants';
import { ROUTES } from '../constants/routes';

const PrivacyPage: NextPage = () => {
  return (
    <>
      <NextSeo
        title={'HASH by POB - Privacy Policy'}
        description={`HASH by POB - Privacy Policy`}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: `${HASH_PROD_LINK}${ROUTES.TOU}`,
          title: 'HASH by POB - Privacy Policy',
          description: 'HASH by POB - Privacy Policy',
          site_name: 'POB',
        }}
        twitter={{
          handle: '@prrfbeauty',
          site: '@prrfbeauty',
          cardType: 'summary_large_image',
        }}
      />
      <ContentWrapper>
        <Header />
        <Content>
          <Title>Privacy Policy</Title>
          <Embed type="application/pdf" src="/legal/pob-privacy.pdf" />
        </Content>
        <Footer />
      </ContentWrapper>
    </>
  );
};

export default React.memo(PrivacyPage);

export const Content = styled(MainContent)`
  background: #f8f8f8;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  @media screen and (max-width: 600px) {
    padding: 12px;
  }
  ${Title} {
    padding-top: 64px;
    padding-bottom: 40px;
  }
`;

export const Embed = styled.embed`
  width: 600px;
  height: 800px;
  border-top: 3px solid #7b7b7b;
  border-bottom: 3px solid #7b7b7b;
  margin-bottom: 24px;
  @media screen and (max-width: 600px) {
    width: 100%;
  }
`;
