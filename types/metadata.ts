import { MetadataRegistryInfo } from '@hash/protocol/deployments/types';
import { MetadataDocument } from '../coordinator';
import { SignedOrderWithCidAndOrderStatus } from './trader';
import { Verdict } from './verdict';

export const TOKEN_METADATA_HASH_TO_READABLE_KEYS_MAP = {
  title: '0xd2129090dde473b4355599dbb953ca35e3ad8907f1750f1ee17e77f3cfabbbce',
  description:
    '0x1596dc38e2ac5a6ddc5e019af4adcc1e017a04f510d57e69d6879d5d2996bb8e',
  metadataCID:
    '0x21cfc0bf6e6e555acacf8cb12972bf46b44f590ff19de3a2119eed91067eaf96',
};

export type TokenMetadataKey =
  keyof typeof TOKEN_METADATA_HASH_TO_READABLE_KEYS_MAP;

/**
 * Composited from numerous sources with middlewares applied.
 */
export interface TokenMetadata {
  tokenId?: string;
  name: string;
  description: string;
  descriptionHtml?: string;
  originalName?: string;
  originalDescription?: string;
  cachedImage?: string;
  image: string;
  external_link: string;
  mediaMimeType: string;
  algorithmStoredTxHash: string;
  properties: any;
  background_color: string;
  titleAndDescriptionContentHash?: string;
  verdictMetadataContentHash?: string;
  verdict: Verdict;
}

export interface FirestoreToken {
  metadata?: TokenMetadata;
  metadataHash?: string;
  tags?: string[];
  bestOrderToDisplay?: SignedOrderWithCidAndOrderStatus;
  bestFilledOrderToDisplay?: SignedOrderWithCidAndOrderStatus;
  isMinted?: boolean;
  mintPrice?: string;
  mintPriceNum?: number;
  mintedAt?: number;
  minter?: string;
}

export interface TokenMetadataWithDocumentsAndInfos extends TokenMetadata {
  documentsAndInfos: [MetadataDocument[], MetadataRegistryInfo[]];
}
