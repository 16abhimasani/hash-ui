import { SEASON_TO_ART_FACTORY, SEASON_TO_NUM } from '@hash/seasons';
import { PATTERN_BY_OPCODE } from '@hash/seasons/art/hunt/patterns';
import { FC, useMemo } from 'react';
import {
  useHashByContext,
  usePrerenderPayloadByContext,
  useTokenIdByContext,
} from '../../../../contexts/token';
import { getSagaMinterTypeFromTokenId } from '../../../../utils/getSagaMinterTypeFromTokenId';
import { shortenHexString } from '../../../../utils/hex';
import { getEtherscanTxUrl } from '../../../../utils/urls';
import { Flex } from '../../../flex';
import {
  ColorPalleteRow,
  CommonTokenMetadataDetails,
  DetailsColorCircle,
  MetadataTable,
  MetadataTableLabel,
  MetadataTableLineSeperator,
  MetadataTableRowContainer,
  MetadataTableText,
  MetadataTableTextWithAnchor,
} from './common';

export const HuntMetadata: FC = () => {
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
        ? SEASON_TO_ART_FACTORY['hunt'].generateTokenAttributesFromGene(gene)
        : undefined,
    [gene],
  );

  return (
    <MetadataTable>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Season</MetadataTableLabel>
        <MetadataTableText>
          {`${SEASON_TO_NUM['hunt']}: ${'HUNT'}`}
        </MetadataTableText>
      </MetadataTableRowContainer>
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
          palette={gene.pallete}
        />
      )}
      <MetadataTableRowContainer>
        <MetadataTableLineSeperator />
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Patterns</MetadataTableLabel>
        <MetadataTableText>
          {!!gene ? `${gene.patternOpCodes.length}` : '-'}
        </MetadataTableText>
      </MetadataTableRowContainer>
      {gene?.patternOpCodes.map((opcode: any) => {
        return (
          <MetadataTableRowContainer
            key={`hunt-metadata-table-row-${opcode}-${hash}`}
          >
            <MetadataTableLabel>{opcode}</MetadataTableLabel>
            <MetadataTableText>
              {PATTERN_BY_OPCODE[opcode].name.replaceAll('-', ' ')}
            </MetadataTableText>
          </MetadataTableRowContainer>
        );
      })}
      <MetadataTableRowContainer>
        <MetadataTableLineSeperator />
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Leading Zeros</MetadataTableLabel>
        <MetadataTableText>
          {!!gene
            ? `${gene.leadingZeros} - ${gene.patternOpCodes.length} Patterns`
            : '-'}
        </MetadataTableText>
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>From</MetadataTableLabel>
        <MetadataTableText>
          {!!gene && !!attributes
            ? `${shortenHexString(gene.from)} - ${
                attributes.modulateColor.display_value
              } color modulation`
            : '-'}
        </MetadataTableText>
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Data length</MetadataTableLabel>
        <MetadataTableText>
          {!!gene && !!attributes
            ? `${gene.dataLength} - ${attributes.pointilism.display_value} Composition Complexity`
            : '-'}
        </MetadataTableText>
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Gas Price</MetadataTableLabel>
        <MetadataTableText>
          {!!gene && !!attributes
            ? `${gene.gasPriceInGwei} gwei - ${attributes.minQuadTreeCordsToSplit.display_value} Composition Density`
            : '-'}
        </MetadataTableText>
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Txn Type</MetadataTableLabel>
        <Flex>
          <MetadataTableText style={{ marginRight: 4 }}>
            {!!gene && !!attributes ? (
              <>
                {gene.type}
                {' - '}
              </>
            ) : (
              '-'
            )}
          </MetadataTableText>
          {!!gene && <DetailsColorCircle color={gene.backgroundColor} />}
        </Flex>
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Value</MetadataTableLabel>
        <Flex>
          <MetadataTableText style={{ marginRight: 4 }}>
            {!!gene && !!attributes ? (
              <>
                {gene.valueInEth}
                {' ETH - '}
                {`${attributes.turbulence.display_value} Turbulence`}
              </>
            ) : (
              '-'
            )}
          </MetadataTableText>
        </Flex>
      </MetadataTableRowContainer>
      <CommonTokenMetadataDetails />
    </MetadataTable>
  );
};
