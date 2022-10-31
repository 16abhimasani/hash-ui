import { BigNumber } from '@ethersproject/bignumber';
import { deployments } from '@hash/protocol';
import {
  getTxDataFromProvider,
  Season,
  SEASON_TO_ART_FACTORY,
} from '@hash/seasons';
import { MetadataDocument } from '..';
import { MAINNET_PROVIDER } from '../../clients/provider';
import { CHAIN_ID, HASH_PROD_LINK } from '../../constants';
import { ROUTES } from '../../constants/routes';
import { padHexString, shortenHexString } from '../../utils/hex';
import { getArtworkPreviewUrl } from '../../utils/urls';
import { OptimisticCoordinatorOptions } from '../optimistic';

export const getMetadata = async (season: Season, hash: string) => {
  const paddedHashStr = padHexString(hash);
  const artFactory = SEASON_TO_ART_FACTORY[season];

  const txData = await getTxDataFromProvider(MAINNET_PROVIDER, paddedHashStr);
  const gene = await artFactory.generateGeneFromTxData(txData);

  const attributes = await artFactory.generateTokenAttributesFromGene(gene);

  return {
    name: shortenHexString(paddedHashStr),
    description: `Painted by POB. Go to [hash.pob.studio](https://hash.pob.studio) to add your own description. [Etherscan](https://etherscan.io/tx/${hash})`,
    image: getArtworkPreviewUrl(paddedHashStr),
    external_link: `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${paddedHashStr}`,
    mediaUrl: getArtworkPreviewUrl(paddedHashStr),
    mediaMimeType: 'image/jpeg',
    algorithmStoredTxHash: deployments[CHAIN_ID].art[season],
    properties: {
      ...attributes,
      season: {
        name: 'Season',
        value: season.toUpperCase(),
      },
      tx: {
        name: 'Tx',
        value: paddedHashStr,
        display_value: shortenHexString(paddedHashStr),
      },
    },
    background_color: 'FFFFFF',
  };
};

export const getBaseMetadata = async (
  hash: string,
  season: Season,
  options?: OptimisticCoordinatorOptions,
): Promise<MetadataDocument> => {
  const metadata = await getMetadata(season, hash);
  return {
    writer: deployments[CHAIN_ID].pob.multisig,
    text: JSON.stringify(metadata),
    creationTime: BigNumber.from((Date.now() / 1000) | 0),
  };
};
