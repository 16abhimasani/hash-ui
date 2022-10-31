import { ApolloProvider } from '@apollo/client';
import { DefaultSeo } from 'next-seo';
import App from 'next/app';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { pobSubgraphClient } from '../clients/subgraph';
import { ApproveHashModalGlobal } from '../components/modals/approveHash';
import { LoginModal } from '../components/modals/login';
import { TwitterModal } from '../components/modals/twitter';
import { WalletModal } from '../components/modals/wallet';
import { CommentTipTapStyles } from '../components/tiptap/comment';
import { TipTapStyles } from '../components/tiptap/common';
import { GLOBAL_OG_BANNER, HASH_PROD_LINK } from '../constants';
import { AppProvider } from '../contexts/app';
import { AuthProvider } from '../contexts/auth';
import { TraderProvider } from '../contexts/trader';
import { AlgoliaEffect } from '../effects/AlgoliaEffect';
import { BlockchainEffect } from '../effects/BlockchainEffect';
import { CollectionEffect } from '../effects/CollectionEffect';
import { EagerConnectEffect } from '../effects/EagerConnectEffect';
import { TokensEffect } from '../effects/TokensEffect';
import { TransactionsEffect } from '../effects/TransactionsEffect';
import { ThemedGlobalStyle } from '../styles';

// if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
//   whyDidYouRender(React as any, { trackAllPureComponents: true });
// }

export default class PobApp extends App {
  render() {
    const { Component, pageProps } = this.props;

    const { err } = this.props as any;
    const modifiedPageProps = { ...pageProps, err };
    return (
      <>
        <DefaultSeo
          title={`HASH - Ethereum's history tokenized`}
          description={'Generative art fueled by tx metadata.'}
          openGraph={{
            type: 'website',
            locale: 'en_US',
            url: HASH_PROD_LINK,
            title: `HASH - Ethereum's history tokenized`,
            description:
              'Generative art fueled by tx metadata. Created by Proof of Beauty Studios.',
            site_name: 'HASH',
            images: [
              {
                url: GLOBAL_OG_BANNER,
                // width: 800,
                // height: 418,
                alt: 'HASH',
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
              content: GLOBAL_OG_BANNER,
            },
            {
              name: 'twitter:url',
              content: HASH_PROD_LINK,
            },
          ]}
        />
        <ThemedGlobalStyle />
        <TipTapStyles />
        <CommentTipTapStyles />
        <AppProvider>
          <ApolloProvider client={pobSubgraphClient}>
            <AuthProvider>
              <TraderProvider>
                <Toaster position="bottom-right" />
                {/** Effects are any tasks that strictly only makes state changes to stores */}
                <BlockchainEffect />
                <EagerConnectEffect />
                <TokensEffect />
                <TransactionsEffect />
                <AlgoliaEffect />
                <CollectionEffect />
                {/** Modals */}
                <TwitterModal />
                <ApproveHashModalGlobal />
                <LoginModal />
                <WalletModal />
                {/** Fixed Components */}
                {/* <CheckoutFooter /> */}
                {/** Component */}
                <Component {...modifiedPageProps} />
              </TraderProvider>
            </AuthProvider>
          </ApolloProvider>
        </AppProvider>
      </>
    );
  }
}
