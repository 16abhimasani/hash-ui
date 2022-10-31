import { NextPage } from 'next';
import React from 'react';
import { ContentWrapper, MainContent } from '../components/content';
import { Header } from '../components/header';
import { Title } from '../components/text';

const NotFoundPage: NextPage = () => {
  return (
    <ContentWrapper>
      <Header />
      <MainContent
        style={{
          background: '#F8F8F8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Title>Nothing here.</Title>
      </MainContent>
    </ContentWrapper>
  );
};

export default React.memo(NotFoundPage);
