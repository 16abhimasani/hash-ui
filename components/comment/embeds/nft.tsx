import { FC, useState } from 'react';
import FadeIn from 'react-lazyload-fadein';
import styled from 'styled-components';
import { useNftContractMetadata, useNftMetadata } from '../../../hooks/useNft';
import { getOpenSeaUrl } from '../../../utils/urls';
import { PrimaryRowActionButton } from '../../art/panels/panel';
import { Flex } from '../../flex';
import { LoadingCard } from '../../loadingCard';
import { UserCell } from '../../userCell';
import { AddressPill } from '../../web3Status';

const NftEmbedContainer = styled.div`
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  width: 420px;
`;

const NftEmbedContractContainer = styled(Flex)`
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
`;

const NftEmbedDescriptionContainer = styled.div``;

const NftEmbedDetailsContainer = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.15);
`;

const NftEmbedTitle = styled.h4`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 16px;
  display: block;
  margin: 0;
  padding: 0;
`;

const NftEmbedDescription = styled.p`
  font-family: Helvetica;
  font-style: normal;
  font-size: 12px;
  line-height: 16px;
  color: rgba(0, 0, 0, 0.5);
  display: block;
  margin: 0;
  padding: 0;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  position: relative;
  display: block;
  object-fit: cover;
`;

const ImageContainer = styled.div`
  position: relative;
  display: block;
`;

const ViewNftButton = styled(PrimaryRowActionButton)`
  color: black;
  border: 1px solid black;
  background-color: transparent;
  height: auto;
  padding: 14px;
  text-decoration: none;
  :hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const NftEmbedImage: FC<{
  src?: string;
  width: number;
}> = ({ src, width }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);

  return (
    <ImageContainer
      style={{
        width,
        height: width,
      }}
    >
      <LoadingCard isLoading={isImageLoading} />
      <FadeIn height={width}>
        {(onload: any) =>
          !!src ? (
            <Image
              style={{
                width,
                height: width,
              }}
              src={src}
              onLoad={() => {
                onload();
                setIsImageLoading(false);
              }}
            />
          ) : null
        }
      </FadeIn>
    </ImageContainer>
  );
};

export const NftEmbed: FC<{
  contract: string;
  tokenId: string;
  width?: number;
}> = ({ contract, tokenId, width = 480 }) => {
  const metadata = useNftMetadata(contract, tokenId);
  const contractMetadata = useNftContractMetadata(contract);

  return (
    <NftEmbedContainer style={{ width }}>
      <NftEmbedContractContainer>
        <NftEmbedTitle>{contractMetadata?.name ?? '-'}</NftEmbedTitle>
        <AddressPill style={{ marginLeft: 14 }}>
          {contract.slice(0, 6)}
        </AddressPill>
      </NftEmbedContractContainer>
      <NftEmbedImage src={metadata?.image_url} width={width - 2} />
      <NftEmbedDetailsContainer>
        <NftEmbedDescriptionContainer>
          <NftEmbedTitle>{metadata?.name ?? '-'}</NftEmbedTitle>
          <NftEmbedDescription style={{ marginTop: 10 }}>
            {metadata?.description ?? '-'}
          </NftEmbedDescription>
        </NftEmbedDescriptionContainer>
        <Flex style={{ margin: '16px 0' }}>
          {!!metadata?.creator?.address && (
            <UserCell user={metadata?.creator?.address} label={'Creator'} />
          )}
          {!!metadata?.owner?.address && (
            <UserCell user={metadata?.owner?.address} label={'Owner'} />
          )}
        </Flex>
        <ViewNftButton
          as={'a'}
          href={getOpenSeaUrl(tokenId, contract)}
          target={'_blank'}
        >
          View NFT
        </ViewNftButton>
      </NftEmbedDetailsContainer>
    </NftEmbedContainer>
  );
};
