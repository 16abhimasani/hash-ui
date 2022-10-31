import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import { NextSeo } from 'next-seo';
import React, { useMemo } from 'react';
import { ContentWrapper } from '../../../components/content';
import { Header } from '../../../components/header';
import { UserHeader } from '../../../components/headers/route-headers/user-header';
import { UserFeed, UserFeedTabs } from '../../../components/user/feed';
import { HASH_PROD_LINK } from '../../../constants';
import { ROUTES } from '../../../constants/routes';
import { useUser } from '../../../hooks/useUser';
import { ADDRESS_REGEX } from '../../../utils/regex';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { account, tab } = context.query;

  if (typeof account !== 'string' || !ADDRESS_REGEX.test(account as string)) {
    return { props: { account: null } };
  }

  if (
    typeof tab !== 'string' ||
    !(Object.values(UserFeedTabs) as string[]).includes(tab as string)
  ) {
    return {
      props: {
        account,
      },
    };
  }

  return {
    props: {
      account,
      tab,
    },
  };
};

const UserPage: NextPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const { account, tab } = props;
  const { bestName } = useUser(account) ?? {};

  const seoTitle = useMemo(() => {
    if (!!bestName) {
      return `HASH - ${bestName}`;
    }
    return `HASH - User Page`;
  }, [account, bestName]);
  const seoDescription = useMemo(() => {
    if (!!bestName) {
      return `View HASH NFTs Collected, Minted, Commented on, & Saved by ${bestName}.`;
    }
    return `View HASH NFTs Collected, Minted, Commented on, & Saved by this account.`;
  }, [account, bestName]);

  return (
    <>
      <NextSeo
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
      />
      <ContentWrapper>
        <Header />
        <UserHeader account={account} />
        <UserFeed account={account} queryTab={tab} />
      </ContentWrapper>
    </>
  );
};

export default React.memo(UserPage);
