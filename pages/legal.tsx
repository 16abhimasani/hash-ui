import { deployments } from '@hash/protocol';
import { DeploymentDetails } from '@hash/protocol/deployments/types';
import { NextPage } from 'next';
import Link from 'next/link';
import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import { RoundIconButton } from '../components/button';
import { ContentWrapper } from '../components/content';
import { Flex, FlexEnds } from '../components/flex';
import { HeaderTitle } from '../components/grid/header/list';
import { Header } from '../components/header';
import {
  HeaderBreadcrumb,
  HeaderContainer,
} from '../components/headers/route-headers/common';
import { ChevronRightIcon } from '../components/icons/chevron';
import { AddressPill } from '../components/web3Status';
import { CHAIN_ID } from '../constants';
import { ROUTES } from '../constants/routes';
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

const Container = styled.div`
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
    <CardContainer href={url} target={'_blank'}>
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
          <HeaderBreadcrumb>web2</HeaderBreadcrumb>
          <HeaderBreadcrumb>/</HeaderBreadcrumb>
          <HeaderTitle>legal</HeaderTitle>
        </HeaderContainer>
        <Container>
          <Link href={ROUTES.TOU} passHref>
            <CardContainer>
              <FlexEnds>
                <Label style={{ marginRight: 12 }}>Terms of Use</Label>
                <RoundIconButton>
                  <ChevronRightIcon />
                </RoundIconButton>
              </FlexEnds>
            </CardContainer>
          </Link>
          <Link href={ROUTES.PRIVACY} passHref>
            <CardContainer>
              <FlexEnds>
                <Label style={{ marginRight: 12 }}>Privacy Policy</Label>
                <RoundIconButton>
                  <ChevronRightIcon />
                </RoundIconButton>
              </FlexEnds>
            </CardContainer>
          </Link>
        </Container>
        {/* <Footer/> */}
      </ContentWrapper>
    </>
  );
};

export default React.memo(ContractsPage);
