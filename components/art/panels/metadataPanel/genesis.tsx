import { SEASON_TO_ART_FACTORY, SEASON_TO_NUM } from '@hash/seasons';
import { FC, useMemo } from 'react';
import {
  useHashByContext,
  usePrerenderPayloadByContext,
  useTokenIdByContext,
} from '../../../../contexts/token';
import { shortenHexString } from '../../../../utils/hex';
import { getEditionFromTokenId } from '../../../../utils/token';
import { getEtherscanTxUrl } from '../../../../utils/urls';
import { maybePluralizeWord } from '../../../../utils/words';
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

export const GenesisMetadata: FC = () => {
  const hash = useHashByContext();
  const tokenId = useTokenIdByContext();
  const prerenderPayload = usePrerenderPayloadByContext();
  const gene = useMemo(() => prerenderPayload?.gene, [prerenderPayload]);
  const attributes = useMemo(
    () =>
      !!gene
        ? SEASON_TO_ART_FACTORY['genesis'].generateTokenAttributesFromGene(gene)
        : undefined,
    [gene],
  );
  return (
    <MetadataTable>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Season</MetadataTableLabel>
        <MetadataTableText>
          {`${SEASON_TO_NUM['genesis']}: ${'GENESIS'}`}
        </MetadataTableText>
      </MetadataTableRowContainer>
      {!!tokenId && (
        <MetadataTableRowContainer>
          <MetadataTableLabel>Edition</MetadataTableLabel>
          <MetadataTableText>
            {getEditionFromTokenId(tokenId)} / {2555}
          </MetadataTableText>
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
        <MetadataTableText>
          {gene?.foreground.colorPalletes.length}
        </MetadataTableText>
      </MetadataTableRowContainer>
      {gene?.foreground.colorPalletes.map((p: any, i: number) => {
        return (
          <ColorPalleteRow
            key={`${gene.addresses[i]}-${i}-color-circle-content`}
            address={gene.addresses[i]}
            palette={p.tintColors}
          />
        );
      })}
      <MetadataTableRowContainer>
        <MetadataTableLineSeperator />
      </MetadataTableRowContainer>
      <MetadataTableRowContainer>
        <MetadataTableLabel>Leading Zeros</MetadataTableLabel>
        {!!gene ? (
          <MetadataTableText>
            {gene.leadingZeros} -{' '}
            {`${
              gene?.foreground.colorPalletes.length ?? '-'
            } ${maybePluralizeWord(
              'palette',
              gene?.foreground.colorPalletes.length ?? 0,
            )}`}
          </MetadataTableText>
        ) : (
          <MetadataTableText>{'-'}</MetadataTableText>
        )}
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
        <MetadataTableLabel>Gas Price</MetadataTableLabel>
        <MetadataTableText>
          {!!gene && !!attributes
            ? `${gene.gasPriceInGwei} GWEI - ${attributes.quarters.display_value} grid`
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
            ? `${gene.valueInEth} ETH - ${attributes.size.display_value} size diversity`
            : '-'}
        </MetadataTableText>
      </MetadataTableRowContainer>
      <CommonTokenMetadataDetails />
    </MetadataTable>
  );
};
