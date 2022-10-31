import { generateColorPalleteFromAddress } from '@hash/seasons';
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import { NextSeo } from 'next-seo';
import { getContrast } from 'polished';
import React, { FC, useEffect, useState } from 'react';
import { useCopyToClipboard } from 'react-use';
import styled from 'styled-components';
import { ContentWrapper, MainContent } from '../../components/content';
import { Header } from '../../components/header';
import { HASH_PROD_LINK } from '../../constants';
import { ROUTES } from '../../constants/routes';
import { useContractName } from '../../hooks/useContractName';
import { BREAKPTS } from '../../styles';
import { ADDRESS_REGEX } from '../../utils/regex';
import { getPalletePreviewUrl } from '../../utils/urls';

const ColorPalleteWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  @media (max-width: ${BREAKPTS.SM}px) {
    padding: 16px;
  }
`;

const ColorPalleteContent = styled.div`
  max-width: 900px;
  padding: 64px 36px;
  border: 1px solid #f0f0f0;
  @media (max-width: ${BREAKPTS.SM}px) {
    max-width: 100%;
    padding: 24px 18px;
  }
`;

const PalleteText = styled.p`
  margin: 0;
  font-weight: 500;
  text-align: right;
  font-size: 16px;
  font-family: 'Roboto Mono', monospace;
  opacity: 0.2;
  text-transform: uppercase;
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 16px;
  }
`;

const AddressText = styled.h1`
  margin: 0;
  font-size: 48px;
  line-height: 48px;
  font-weight: normal;
  font-family: 'Roboto Mono', monospace;
  text-align: right;
  word-wrap: break-word;
  opacity: 0.4;
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 36px;
    line-height: 44px;
  }
`;

const ColorsWrapper = styled.div`
  display: flex;
  padding-top: 16px;
  justify-content: flex-end;
  div + div {
    margin-left: 24px;
    @media (max-width: ${BREAKPTS.SM}px) {
      margin-left: 8px;
    }
  }
`;

const ColorCircle = styled.div<{ color: string }>`
  width: 144px;
  height: 144px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: ${(p) =>
    getContrast(p.color, '#FFFFFF') <= 1.1 ? '1px solid #000' : 'none'};
  background: ${(props) => props.color};
  &:hover {
    .color-text {
      transform: scale(1.1);
    }
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    width: 72px;
    height: 72px;
  }
`;

const ColorText = styled.p.attrs({ className: 'color-text' })<{
  color: string;
}>`
  margin: 0;
  font-weight: bold;
  transition: transform 150ms ease-in-out;
  transform: scale(1);
  color: ${(props) =>
    getContrast('#000', props.color) > getContrast('#FFF', props.color)
      ? '#000'
      : '#FFF'};
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 14px;
  }
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { address } = context.query;
  if (!address || !ADDRESS_REGEX.test(address as string)) {
    return {
      notFound: true,
    };
  }
  const colorsData = generateColorPalleteFromAddress(address as string);
  return {
    props: {
      ...colorsData,
      address: address as string,
    },
  };
};

const Color: FC<{ color: string }> = ({ color }) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const [copied, setCopied] = useState<boolean>(false);
  useEffect(() => {
    let clearToken: number | undefined = undefined;
    if (copied) {
      clearToken = window.setTimeout(() => {
        setCopied(false);
      }, 5000);
    }
    return () => {
      clearTimeout(clearToken);
    };
  }, [copied]);

  return (
    <ColorCircle
      onClick={() => {
        copyToClipboard(color);
        setCopied(true);
      }}
      key={`color-circle-${color}`}
      color={color}
    >
      <ColorText color={color}>{copied ? 'Copied!' : color}</ColorText>
    </ColorCircle>
  );
};

const PalletesPage: NextPage = ({
  address,
  palleteIndex,
  colors,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const contractName = useContractName(address);
  return (
    <>
      <NextSeo
        title={`POB - Palette ${palleteIndex === -1 ? '' : palleteIndex}`}
        description={'Color palette used to generate artworks'}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: `${HASH_PROD_LINK}${ROUTES.PALETTE}/${address}`,
          title: `POB - Palette ${palleteIndex === -1 ? '' : palleteIndex}`,
          description: 'Color palette used to generate artworks',
          site_name: 'POB',
          images: [
            {
              url: getPalletePreviewUrl(address),
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
            content: getPalletePreviewUrl(address),
          },
          {
            name: 'twitter:url',
            content: `${HASH_PROD_LINK}${ROUTES.PALETTE}/${address}`,
          },
        ]}
      />
      <ContentWrapper>
        <Header />
        <MainContent>
          <ColorPalleteWrapper>
            <ColorPalleteContent>
              <PalleteText>
                {palleteIndex === -1
                  ? 'Unique Palette'
                  : `Palette ${`${palleteIndex}`.padStart(5, '0')}`}
              </PalleteText>
              <AddressText>{contractName ?? address}</AddressText>
              <ColorsWrapper>
                {colors.map((c: string, i: number) => (
                  <Color color={c} key={`color-circle${c}-${i}`} />
                ))}
              </ColorsWrapper>
            </ColorPalleteContent>
          </ColorPalleteWrapper>
        </MainContent>
      </ContentWrapper>
    </>
  );
};

export default React.memo(PalletesPage);
