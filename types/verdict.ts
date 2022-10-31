import { PartialSignedRequest } from './signing';

export const AFFIRMATION_NUM_VOTES_NEEDED = 3;

export const OPINION_TYPE_TO_EMOJI = {
  verified: '✅',
  disputed: '🚫',
};

export type OpinionType = keyof typeof OPINION_TYPE_TO_EMOJI;

// high-table is the legacy panel system
export type Panel = 'high-table' | 'supreme-court';

export interface Verdict {
  network: '1';
  panel: Panel;
  txHash: string;
  contentHash: string;
  opinion: string;
  opinionType: OpinionType;
  createdAt?: number;
}

// the new verdict metadata to compose with:
export interface VerdictMetadata {
  title?: string;
  description?: string;
  originalTitle?: string;
  originalDescription?: string;
  properties: {
    verdict: any;
  };
  verdict: Verdict;
}

export interface SignedVerdictMetadata
  extends PartialSignedRequest,
    VerdictMetadata {}

export interface SignedVerdictMetadataFromFirebase
  extends SignedVerdictMetadata {
  id: string;
  offChainMetadata: {
    affirmers: string[];
    numAffirmations: number;
    hold?: boolean;
    holdLastUpdater?: string;
  };
}

export interface AffirmationWrite {
  tokenId: string;
  key: string;
  text: string;
  salt: number;
}

export interface Affirmation {
  signer: string;
  signature: string;
  salt: number;
}

export interface WriteWithAffirmationData {
  writeHash: string;
  write: AffirmationWrite;
  affirmation: Affirmation;
  id: string;
}
