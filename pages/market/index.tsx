import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import React from 'react';
import { ContentWrapper } from '../../components/content';
import { MarketGrid } from '../../components/grid/marketGrid';
import { Header } from '../../components/header';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { seasons, tags } = context.query;
  return {
    props: {
      seasons: typeof seasons === 'string' ? seasons?.split(',') : [] ?? [],
      tags: typeof tags === 'string' ? tags?.split(',') : [] ?? [],
    },
  };
};

const CollectionsPage: NextPage = ({
  seasons,
  tags,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <>
      {/* <NextSeo
        title={`POB - ${
          !!collectionMetadata ? collectionMetadata.name : 'Gallery'
        }`}
        description={collectionDescription}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: `${HASH_PROD_LINK}${ROUTES.COLLECTION}/${idOrAddress}`,
          title: `POB - ${
            !!collectionMetadata ? collectionMetadata.name : 'Gallery'
          }`,
          description: collectionDescription,
          site_name: 'POB',
          images: [
            {
              url: collectionBanner,
              alt: 'POB',
            },
          ],
        }}
        twitter={{
          handle: '@prrfbeauty',
          site: '@prrfbeauty',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'twitter:image',
            content: collectionBanner,
          },
          {
            name: 'twitter:url',
            content: `${HASH_PROD_LINK}${ROUTES.COLLECTION}/${idOrAddress}`,
          },
        ]}
      /> */}
      <ContentWrapper>
        <Header />
        <MarketGrid defaultSeasons={seasons} defaultTags={tags} />
      </ContentWrapper>
    </>
  );
};

export default React.memo(CollectionsPage);
