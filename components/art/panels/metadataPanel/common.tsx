import { deployments } from '@hash/protocol';
import { BigNumber } from 'ethers';
import { getContrast } from 'polished';
import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { CHAIN_ID } from '../../../../constants';
import { ROUTES } from '../../../../constants/routes';
import {
  useIsMigratedByContext,
  useTokenIdByContext,
  useTokenMetadataByContext,
} from '../../../../contexts/token';
import { useContractName } from '../../../../hooks/useContractName';
import { BREAKPTS } from '../../../../styles';
import { shortenHexString } from '../../../../utils/hex';
import { shortenString } from '../../../../utils/string';
import { getIpfsUrl, getOpenSeaUrl } from '../../../../utils/urls';
import { MonoAnchorWithIcon } from '../../../anchor';
import { FlexEnds } from '../../../flex';
import { P } from '../../../text';
import { PanelLineSeparator } from '../panel';

export const MetadataTableRowContainer = styled(FlexEnds)``;

export const MetadataTable = styled.div`
  ${MetadataTableRowContainer} + ${MetadataTableRowContainer} {
    margin-top: 20px;
  }
`;

export const MetadataTableLineSeperator = styled(PanelLineSeparator)`
  margin: 0 0 0 0 !important;
`;

export const MetadataTableText = styled(P)`
  color: black;
  text-transform: capitalize;
`;

export const MetadataTableLabel = styled(P)`
  color: black;
  font-weight: 600;
`;

export const ColorMetadataTableLabel = styled(MetadataTableLabel)`
  display: flex;
  align-items: center;
  &::before {
    content: '';
    width: 4px;
    height: 4px;
    background-color: black;
    border-radius: 999px;
    margin: 0 12px;
  }
`;

export const MetadataTableTextWithAnchor = styled(MonoAnchorWithIcon)`
  text-decoration: none;
  font-family: Helvetica;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  color: black;
`;

const ColorPalleteDetailsTableContainer = styled(MetadataTableRowContainer)``;

export const DetailsColorCircle = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: ${(props) => props.color};
  border: ${(p) =>
    getContrast(p.color, '#FFFFFF') <= 1.1 ? '1px solid #000' : 'none'};
`;

const DetailsColorPalleteWrapper = styled(MonoAnchorWithIcon)`
  display: flex;
  justify-content: flex-end;
  div + div {
    margin-left: 6px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    justify-content: flex-start;
  }
`;

export const ColorPalleteRow: FC<{ address: string; palette: string[] }> = ({
  address,
  palette,
}) => {
  const contractName = useContractName(address);
  return (
    <ColorPalleteDetailsTableContainer>
      <ColorMetadataTableLabel
        style={{
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {contractName?.slice(0, 24) ?? shortenHexString(address)}
      </ColorMetadataTableLabel>
      <DetailsColorPalleteWrapper
        href={`${ROUTES.PALETTE}/${address}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {palette.map((c: string) => (
          <DetailsColorCircle key={`${address}-color-circle-${c}`} color={c} />
        ))}
      </DetailsColorPalleteWrapper>
    </ColorPalleteDetailsTableContainer>
  );
};

export const CommonTokenMetadataDetails: FC = () => {
  const tokenId = useTokenIdByContext();
  const isMigrated = useIsMigratedByContext();
  const metadata = useTokenMetadataByContext();
  const baseDocument = useMemo(
    () => metadata?.documentsAndInfos?.[0]?.[0],
    [metadata],
  );

  const baseMetadataHash = useMemo(() => {
    if (!baseDocument?.text) {
      return undefined;
    }
    if (baseDocument.text.startsWith('ipfs://')) {
      return baseDocument.text.slice(7);
    }
    if (baseDocument.text.startsWith('baf')) {
      return baseDocument.text;
    }
    try {
      const { cid } = JSON.parse(baseDocument.text);
      return cid;
    } catch (e) {}
    return undefined;
  }, [baseDocument]);

  return (
    <>
      <MetadataTableRowContainer>
        <MetadataTableLineSeperator />
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Token ID</MetadataTableLabel>
        <MetadataTableTextWithAnchor
          href={
            !!tokenId
              ? getOpenSeaUrl(
                  tokenId,
                  isMigrated
                    ? deployments[CHAIN_ID].nft.v2
                    : deployments[CHAIN_ID].nft.erc1155,
                )
              : '#'
          }
          target={'_blank'}
        >
          {!!tokenId
            ? shortenString(BigNumber.from(tokenId).toString(), 6)
            : '-'}
        </MetadataTableTextWithAnchor>
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Image</MetadataTableLabel>
        <MetadataTableTextWithAnchor
          href={!!metadata ? metadata.image : '#'}
          target={'_blank'}
        >
          View Pin
        </MetadataTableTextWithAnchor>
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Metadata</MetadataTableLabel>
        <MetadataTableTextWithAnchor
          href={!!baseMetadataHash ? getIpfsUrl(baseMetadataHash) : '#'}
          target={'_blank'}
        >
          View Pin
        </MetadataTableTextWithAnchor>
      </MetadataTableRowContainer>
    </>
  );
};
