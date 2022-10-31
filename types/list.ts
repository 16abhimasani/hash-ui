export const MAX_LIST_HASHES_COUNT = 32;

export interface HashGroup {
  hashes: string[];
  title?: string;
  description?: string;
}

export interface List {
  title: string;
  description?: string;
  hashGroup?: HashGroup[];
  createdAt?: number;
  authors: string[];
}

export interface ListWithId extends List {
  id: string;
}

export interface ListPrefetchData {
  list: ListWithId;
}
