import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import { NextSeo } from 'next-seo';
import React, { useMemo } from 'react';
import { Edit } from '../../../components/art/edit';
import { ContentWrapper } from '../../../components/content';
import { Header } from '../../../components/header';
import { HASH_PROD_LINK } from '../../../constants';
import { ROUTES } from '../../../constants/routes';
import { TokenProvider } from '../../../contexts/token';
import { TokenPrefetchProvider } from '../../../contexts/tokenPrefetch';
import { getPrefetchDataForHash } from '../../../utils/getPrefetchData';
import { shortenHexString } from '../../../utils/hex';
import { TX_HASH_REGEX } from '../../../utils/regex';
import { getArtworkPreviewUrl } from '../../../utils/urls';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { hash } = context.query;

  if (typeof hash !== 'string' || !TX_HASH_REGEX.test(hash as string)) {
    return { props: { hash } };
  }

  const prefetchDataRaw = await getPrefetchDataForHash(hash);
  const prefetchData = prefetchDataRaw
    ? JSON.parse(JSON.stringify(prefetchDataRaw))
    : undefined;

  if (!prefetchData) {
    return {
      props: {
        hash,
      },
    };
  }
  return {
    props: {
      hash,
      prefetchData,
    },
  };
};

const ArtworkPage: NextPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const { hash, prefetchData } = props;

  const seoTitle = useMemo(() => {
    if (!prefetchData?.metadata?.title) {
      return `HASH - ${shortenHexString(hash)}...`;
    }
    return `HASH - '${prefetchData?.metadata?.title}'`;
  }, [hash, prefetchData]);
  const seoDescription = useMemo(() => {
    if (!prefetchData?.metadata?.description) {
      return `Painted by POB`;
    }
    return `${prefetchData?.metadata?.description.slice(0, 40)}${
      prefetchData?.metadata?.description.length > 40 ? '...' : ''
    }`;
  }, [hash, prefetchData]);

  const prefetchDatas = useMemo(
    () => (!!prefetchData ? [prefetchData] : undefined),
    [prefetchData],
  );

  return (
    <>
      <NextSeo
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
      />
      <ContentWrapper>
        <Header />
        <TokenPrefetchProvider prefetchDatas={prefetchDatas}>
          <TokenProvider hash={hash}>
            <Edit />
          </TokenProvider>
        </TokenPrefetchProvider>
      </ContentWrapper>
    </>
  );
};

export default React.memo(ArtworkPage);
