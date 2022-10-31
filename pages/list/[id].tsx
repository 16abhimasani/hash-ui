import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import React from 'react';
import { ContentWrapper } from '../../components/content';
import { Footer } from '../../components/footer';
import { ListGrid } from '../../components/grid/listGrid';
import { Header } from '../../components/header';
import { getPrefetchDataForList } from '../../utils/getPrefetchData';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;

  if (!id || typeof id !== 'string') {
    return {
      notFound: true,
    };
  }
  const prefetchData = await getPrefetchDataForList(id);

  if (!prefetchData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      id,
      prefetchData,
    },
  };
};

const CollectionsPage: NextPage = ({
  id,
  prefetchData,
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
        <ListGrid prefetchData={prefetchData} listId={id} />
        <Footer />
      </ContentWrapper>
    </>
  );
};

export default React.memo(CollectionsPage);
