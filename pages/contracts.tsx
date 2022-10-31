import { deployments, DEPLOYMENT_DETAILS } from '@hash/protocol';
import { DeploymentDetails } from '@hash/protocol/deployments/types';
import get from 'lodash/get';
import { NextPage } from 'next';
import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import { RoundIconButton } from '../components/button';
import { ContentWrapper } from '../components/content';
import { Flex, FlexEnds } from '../components/flex';
import { Footer } from '../components/footer';
import { HeaderTitle } from '../components/grid/header/list';
import { Header } from '../components/header';
import {
  HeaderBreadcrumb,
  HeaderContainer,
} from '../components/headers/route-headers/common';
import { ChevronRightIcon } from '../components/icons/chevron';
import { AddressPill } from '../components/web3Status';
import { CHAIN_ID } from '../constants';
import { flattenObject } from '../utils/flattenObject';
import { shortenHexString } from '../utils/hex';
import {
  getEtherscanAddressUrl,
  getEtherscanTxUrl,
  getIpfsUrl,
} from '../utils/urls';

const Label = styled.h3`
  font-family: Helvetica;
  font-style: bold;
  font-size: 18px;
  line-height: 20px;
  margin: 0;
  padding: 0;
`;

const Description = styled.p`
  font-family: Helvetica;
  font-style: normal;
  font-size: 14px;
  line-height: 14px;
  margin: 0;
  color: rgba(0, 0, 0, 0.5);
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

const ContractsCardContainer = styled.a`
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

const ContractCard: FC<DeploymentDetails & { address: string; id: string }> = ({
  uriType,
  isHidden,
  label,
  id,
  description,
  address,
}) => {
  const url = useMemo(() => {
    if (uriType === 'ipfs') {
      return getIpfsUrl(address.slice(7));
    }
    if (uriType === 'hash') {
      return getEtherscanTxUrl(address);
    }
    return getEtherscanAddressUrl(address);
  }, [uriType]);

  if (isHidden) {
    return null;
  }

  return (
    <ContractsCardContainer href={url} target={'_blank'}>
      <FlexEnds>
        <div>
          <Flex>
            <Label style={{ marginRight: 12 }}>
              <span style={{ opacity: 0.25, marginRight: 8 }}>
                {id.split('.').slice(0, -1).join('/')}
              </span>
              {label ?? id.split('.').slice(-1)[0]}
            </Label>
            <AddressPill>
              {shortenHexString(
                uriType === 'ipfs' ? address.slice(7) : address,
              )}
            </AddressPill>
          </Flex>
          <Description style={{ marginTop: 8 }}>{description}</Description>
        </div>
        <RoundIconButton>
          <ChevronRightIcon />
        </RoundIconButton>
      </FlexEnds>
    </ContractsCardContainer>
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
          <HeaderBreadcrumb>protocol</HeaderBreadcrumb>
          <HeaderBreadcrumb>/</HeaderBreadcrumb>
          <HeaderTitle>contracts</HeaderTitle>
        </HeaderContainer>
        <ContractsContainer>
          {Object.entries(flattenedDeployments).map(
            ([path, address]: [string, any]) => {
              const deploymentDetails = get(DEPLOYMENT_DETAILS, path);
              return (
                <ContractCard
                  {...deploymentDetails}
                  id={path}
                  address={address}
                />
              );
            },
          )}
        </ContractsContainer>
        <Footer />
      </ContentWrapper>
    </>
  );
};

export default React.memo(ContractsPage);
