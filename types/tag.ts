export interface LiveCustomTagMetadata {
  type: 'live-custom-tag';
  funcName: string;
}

export interface CustomTagMetadata {
  type: 'custom-tag';
  funcName: string;
}

export interface ContractInteractionTagMetadata {
  type: 'contract-interaction-tag';
  contractAddresses: string[];
}

export interface TagGroupTagMetadata {
  type: 'tag-group-tag';
  keys: string[];
}

export interface EventMatchTagMetadata {
  type: 'event-match-tag';
  topics: string[];
}

export type TagMetadata =
  | LiveCustomTagMetadata
  | TagGroupTagMetadata
  | CustomTagMetadata
  | ContractInteractionTagMetadata
  | EventMatchTagMetadata;

export interface Tag {
  key: string;
  description: string;
  creator: string;
  priority?: number;
  metadata: TagMetadata;
}

export interface TagWithDates extends Tag {
  lastUpdatedBy: string;
}

export interface TagWithId extends TagWithDates {
  id: string;
}

export const TAG_KEY_CHAR_LIMIT = 26;
export const TAG_KEY_CHAR_FILTERS = [' ', '/', '\\'];
export const TAG_DESCRIPTION_CHAR_LIMIT = 320;
