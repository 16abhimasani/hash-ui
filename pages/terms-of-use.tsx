import { NextPage } from 'next';
import { NextSeo } from 'next-seo';
import React from 'react';
import { ContentWrapper } from '../components/content';
import { Footer } from '../components/footer';
import { Header } from '../components/header';
import { Title } from '../components/text';
import { HASH_PROD_LINK } from '../constants';
import { ROUTES } from '../constants/routes';
import { Content, Embed } from './privacy-policy';

const TosPage: NextPage = () => {
  return (
    <>
      <NextSeo
        title={'HASH by POB - Terms of Use'}
        description={`HASH by POB - Terms of Use`}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: `${HASH_PROD_LINK}${ROUTES.TOU}`,
          title: 'HASH by POB - Terms of Use',
          description: 'HASH by POB - Terms of Use',
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
          <Title>Terms of Use</Title>
          <Embed type="application/pdf" src="/legal/pob-tou.pdf" />
        </Content>
        <Footer />
      </ContentWrapper>
    </>
  );
};

export default React.memo(TosPage);
