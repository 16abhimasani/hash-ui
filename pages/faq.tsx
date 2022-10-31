import { deployments } from '@hash/protocol';
import { NextPage } from 'next';
import Link from 'next/link';
import React, { FC, ReactNode, useMemo } from 'react';
import styled from 'styled-components';
import { ContentWrapper } from '../components/content';
import { Flex } from '../components/flex';
import { Footer } from '../components/footer';
import { HeaderTitle } from '../components/grid/header/list';
import { Header } from '../components/header';
import {
  HeaderBreadcrumb,
  HeaderContainer,
} from '../components/headers/route-headers/common';
import {
  CHAIN_ID,
  HUNDRED_PERCENT_BPS,
  MARKET_FEE_AMOUNT_BPS,
} from '../constants';
import { ROUTES } from '../constants/routes';
import { flattenObject } from '../utils/flattenObject';

const Label = styled.h3`
  font-family: Helvetica;
  font-style: bold;
  font-size: 24px;
  line-height: 24px;
  margin: 0;
  padding: 0;
`;

const Description = styled.p`
  font-family: Helvetica;
  font-style: normal;
  font-size: 16px;
  line-height: 22px;
  margin: 0;
  color: rgba(0, 0, 0, 0.5);
  > a {
    color: black;
  }
`;

const ContractsContainer = styled.div`
  background-color: white;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 32px;
  padding-bottom: 128px;
  align-items: center;
`;

const CardContainer = styled.a`
  display: block;
  color: black;
  text-decoration: none;
  background: #ffffff;
  box-shadow: 0px 9px 20px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  padding: 20px 10px 20px 20px;
`;

const FaqCard: FC<{ question: string; children: ReactNode }> = ({
  question,
  children,
}) => {
  return (
    <CardContainer>
      <Flex>
        <Label>{question}</Label>
      </Flex>
      <Description style={{ marginTop: 12 }}>{children}</Description>
    </CardContainer>
  );
};

const ContractsPage: NextPage = () => {
  const flattenedDeployments = useMemo(() => {
    return flattenObject(deployments[CHAIN_ID]);
  }, []);
  return (
    <>
      {/* <NextSeo
        title={'POB - Contracts'}
        description={`Reference of the contracts powering ${TOKEN_SYMBOL}`}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: `${HASH_PROD_LINK}${ROUTES.CONTRACTS}`,
          title: 'POB - Contracts',
          description: `Reference of the contracts powering ${TOKEN_SYMBOL}`,
          site_name: 'POB',
          images: [
            {
              url: getDefaultPreviewUrl(DEFAULT_PREVIEW_HASHES[1], 'Contracts'),
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
            content: getDefaultPreviewUrl(
              DEFAULT_PREVIEW_HASHES[1],
              'Galleries',
            ),
          },
          {
            name: 'twitter:url',
            content: `${HASH_PROD_LINK}${ROUTES.CONTRACTS}`,
          },
        ]}
      /> */}
      <ContentWrapper>
        <Header />
        <HeaderContainer>
          <HeaderBreadcrumb>answers</HeaderBreadcrumb>
          <HeaderBreadcrumb>/</HeaderBreadcrumb>
          <HeaderTitle>FAQ</HeaderTitle>
        </HeaderContainer>
        <ContractsContainer>
          <FaqCard question="What does saving a txn mean?">
            Think of it as a bookmark, you can then easily view all saves in
            your profile page. Use this to save txns of historic importantance,
            or future mints.
          </FaqCard>
          <FaqCard question="What does ‘pre-minting’ a season mean?">
            Season artworks are now revealed a few weeks before minting is
            active. During this phase, users can see what the artwork would look
            like for any txHash and begin collecting. Consult this{' '}
            <a
              href={
                'https://twitter.com/prrfbeauty/status/1500896015318237189?s=21'
              }
              target="_blank"
            >
              thread
            </a>{' '}
            for more details.
          </FaqCard>
          <FaqCard question="What does it mean to migrate my HASH?">
            HashV3 introduces a number of new features: native trading in the
            dapp, comments, verdicts. To help facilitate these features, we are
            allowing users to migrate their current HASH tokens to the new
            HASHv2 contract. Currently, we are only prompting migration WHEN it
            is REQUIRED. Consult this{' '}
            <a
              href={
                'https://twitter.com/prrfbeauty/status/1499774577571811329?s=21'
              }
              target="_blank"
            >
              thread
            </a>{' '}
            for more details. Find contract addresses{' '}
            <Link href={ROUTES.CONTRACTS}>
              <a>here</a>
            </Link>
            .
          </FaqCard>
          <FaqCard question="How does HASH marketplace work?">
            The HASH marketplace is powered by{' '}
            <a href={'https://0x.org'}>0x v4 protocol</a>. Contracts are
            professionally built to be gas efficient, safe, and future proof by
            the 0x core team. POB studios do not maintain or deploy these
            contracts, we only host the orders created on the dapp.
          </FaqCard>
          <FaqCard question="What is the fee to use the HASH marketplace?">
            The HASH marketplace currently charges{' '}
            {(MARKET_FEE_AMOUNT_BPS / HUNDRED_PERCENT_BPS) * 100}% for all
            trades. This fee is routed to POB studios to fund continued work on
            HASH.
          </FaqCard>
          <FaqCard question="Where are comments stored?">
            All data on HASH created by users are stored on IPFS, we use
            firebase to index the data and to offer quality of life
            improvements.
          </FaqCard>
          <FaqCard question="What is a session?">
            We utilize a centralized service to offer a number of features like
            saving, commenting, and upvoting. To link your address to our
            service, we need a session to be created and active. Creating a
            session is easy, simply sign the prompted data and HASH will
            seamlessly work.{' '}
          </FaqCard>
          <FaqCard question="Why should I link my twitter?">
            Linking twitter connects your address to a twitter account, enabling
            usernames + profiles added in hash. Linking twitter is also a
            opportunity for you to enable all the features in HASH.
          </FaqCard>
        </ContractsContainer>
        <Footer />
      </ContentWrapper>
    </>
  );
};

export default React.memo(ContractsPage);
