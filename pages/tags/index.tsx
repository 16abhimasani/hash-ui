import { NextPage } from 'next';
import React from 'react';
import { ContentWrapper } from '../../components/content';
import { Header } from '../../components/header';
import { ManageTag } from '../../components/tag/manage';
import { TagsManagerProvider } from '../../contexts/tagsManager';

const TagCreatePage: NextPage = () => {
  return (
    <>
      {/* <NextSeo
        title={seoTitle}
        description={seoDescription}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${hash}`,
          title: seoTitle,
          description: seoDescription,
          site_name: 'POB',
          images: [
            {
              url: getArtworkPreviewUrl(hash),
              // width: 800,
              // height: 418,
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
            content: getArtworkPreviewUrl(hash),
          },
          {
            name: 'twitter:url',
            content: `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${hash}`,
          },
        ]}
      /> */}
      <ContentWrapper>
        <Header />
        <TagsManagerProvider>
          <ManageTag />
        </TagsManagerProvider>
      </ContentWrapper>
    </>
  );
};

export default React.memo(TagCreatePage);
