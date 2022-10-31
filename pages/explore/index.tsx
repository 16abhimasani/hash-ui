import { NextPage } from 'next';
import React from 'react';
import { ContentWrapper } from '../../components/content';
import { CommentsStream } from '../../components/grid/commentsStream';
import { Header } from '../../components/header';
import { ExploreHeader } from '../../components/headers/route-headers/explore-header';

const ExplorePage: NextPage = () => {
  // const seoTitle = useMemo(() => {
  //   if (!!bestName) {
  //     return `HASH - ${bestName}`;
  //   }
  //   return `HASH - User Page`;
  // }, [account, bestName]);
  // const seoDescription = useMemo(() => {
  //   if (!!bestName) {
  //     return `View HASH NFTs Collected, Minted, Commented on, & Saved by ${bestName}.`;
  //   }
  //   return `View HASH NFTs Collected, Minted, Commented on, & Saved by this account.`;
  // }, [account, bestName]);

  return (
    <>
      {/* <NextSeo
        title={seoTitle}
        description={seoDescription}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: `${HASH_PROD_LINK}${ROUTES.USER}/${account}`,
          title: seoTitle,
          description: seoDescription,
          site_name: 'HASH',
        }}
        twitter={{
          handle: '@prrfbeauty',
          site: '@prrfbeauty',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'twitter:url',
            content: `${HASH_PROD_LINK}${ROUTES.USER}/${account}`,
          },
        ]}
      /> */}
      <ContentWrapper>
        <Header />
        <ExploreHeader />
        <CommentsStream horizontalMode={true} />
      </ContentWrapper>
    </>
  );
};

export default React.memo(ExplorePage);
