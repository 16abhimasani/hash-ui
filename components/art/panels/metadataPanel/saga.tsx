import { SEASON_TO_ART_FACTORY, SEASON_TO_NUM } from '@hash/seasons';
import { FC, useMemo } from 'react';
import {
  useHashByContext,
  usePrerenderPayloadByContext,
  useTokenIdByContext,
} from '../../../../contexts/token';
import { getSagaMinterTypeFromTokenId } from '../../../../utils/getSagaMinterTypeFromTokenId';
import { shortenHexString } from '../../../../utils/hex';
import { getEtherscanTxUrl } from '../../../../utils/urls';
import {
  ColorPalleteRow,
  CommonTokenMetadataDetails,
  MetadataTable,
  MetadataTableLabel,
  MetadataTableLineSeperator,
  MetadataTableRowContainer,
  MetadataTableText,
  MetadataTableTextWithAnchor,
} from './common';

export const SagaMetadata: FC = () => {
  const hash = useHashByContext();
  const tokenId = useTokenIdByContext();
  const minterType = useMemo(
    () => (!!tokenId ? getSagaMinterTypeFromTokenId(tokenId) : undefined),
    [tokenId],
  );
  const prerenderPayload = usePrerenderPayloadByContext();
  const gene = useMemo(() => prerenderPayload?.gene, [prerenderPayload]);
  const attributes = useMemo(
    () =>
      !!gene
        ? SEASON_TO_ART_FACTORY['saga'].generateTokenAttributesFromGene(gene)
        : undefined,
    [gene],
  );

  return (
    <MetadataTable>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Season</MetadataTableLabel>
        <MetadataTableText>
          {`${SEASON_TO_NUM['saga']}: ${'SAGA'}`}
        </MetadataTableText>
      </MetadataTableRowContainer>
      {!!tokenId && !!minterType && (
        <MetadataTableRowContainer>
          <MetadataTableLabel>Minting Type</MetadataTableLabel>
          <MetadataTableText>{minterType}</MetadataTableText>
        </MetadataTableRowContainer>
      )}
      <MetadataTableRowContainer>
        <MetadataTableLabel>Transaction</MetadataTableLabel>
        <MetadataTableTextWithAnchor
          href={!!hash ? getEtherscanTxUrl(hash) : '#'}
          target={'_blank'}
        >
          {!!hash ? shortenHexString(hash, 6) : '-'}
        </MetadataTableTextWithAnchor>
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLineSeperator />
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Color Palletes</MetadataTableLabel>
        <MetadataTableText>1</MetadataTableText>
      </MetadataTableRowContainer>
      {!!gene && (
        <ColorPalleteRow
          key={`${gene.to}-color-circle-content`}
          address={gene.to}
          palette={gene.foreground.colors}
        />
      )}
      <MetadataTableRowContainer>
        <MetadataTableLineSeperator />
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Leading Zeros</MetadataTableLabel>
        <MetadataTableText>
          {!!gene
            ? `${gene.leadingZeros} - ${gene.composition.numCircles} Circles`
            : '-'}
        </MetadataTableText>
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Gas Limit</MetadataTableLabel>
        <MetadataTableText>
          {!!gene && !!attributes
            ? `${gene.gasLimit} - ${attributes.texture.display_value} texture`
            : '-'}
        </MetadataTableText>
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Nonce</MetadataTableLabel>
        <MetadataTableText>
          {!!gene && !!attributes
            ? `${gene.nonce} - ${attributes.complexity.display_value} complexity`
            : '-'}
        </MetadataTableText>
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Value</MetadataTableLabel>
        <MetadataTableText>
          {!!gene && !!attributes
            ? `${gene.valueInEth} ETH - ${attributes.shading.display_value} shading`
            : '-'}
        </MetadataTableText>
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Gas Price</MetadataTableLabel>
        <MetadataTableText>
          {!!gene && !!attributes
            ? `${gene.gasPriceInGwei} GWEI - ${attributes.circleSize.display_value} circle diversity`
            : '-'}
        </MetadataTableText>
      </MetadataTableRowContainer>
      <CommonTokenMetadataDetails />
    </MetadataTable>
  );
};
