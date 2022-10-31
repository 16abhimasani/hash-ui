import { utils } from 'ethers';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePreviousDistinct } from 'react-use';
import useSWR from 'swr';
import { algoliaClient } from '../clients/algolia';
import { usePriorityAccount } from '../connectors/priority';
import {
  ALGOLIA_HASH_INDEX,
  ALGOLIA_TAGS_INDEX,
  ALGOLIA_USER_METADATA_INDEX,
} from '../constants';
import { ROUTES } from '../constants/routes';
import { useCollectionsStore } from '../stores/collections';
import { TokenMetadataWithDocumentsAndInfos } from '../types/metadata';
import { fetcher } from '../utils/fetcher';
import { ADDRESS_REGEX, TX_HASH_REGEX } from '../utils/regex';
import { useAccountMyTx } from './useAccountMyTx';

export const SEARCHABLE_ATTRIBUTES = [
  'metadata.originalName',
  'metadata.name',
  'metadata.originalDescription',
  'metadata.description',
];

export type SearchResultType = 'profile' | 'hash' | 'tag';

export interface SearchResultContext {
  title: string;
  hits: any[];
  labels: (string | undefined)[];
  isLoading?: boolean;
  type: SearchResultType;
  loadMore?: () => Promise<void>;
}

export interface HashSearchResultContext extends SearchResultContext {
  hits: (string | TokenMetadataWithDocumentsAndInfos)[];
  type: 'hash';
}

export interface ProfileSearchResultContext extends SearchResultContext {
  hits: string[];
  type: 'profile';
}

export interface TagSearchResultContext extends SearchResultContext {
  hits: string[];
  type: 'tag';
}

export const MAX_RESULTS_IN_CONTEXT = 12;
export const PAGE_SIZE = 4;

export const useSearch = () => {
  const router = useRouter();
  const account = usePriorityAccount();
  useAccountMyTx(account ?? undefined);

  const [searchTerm, setSearchTerm] = useState('');

  const previousSearchTerm = usePreviousDistinct(searchTerm);

  const [relevantPage, setRelevantPage] = useState(0);

  const [relevantResults, setRelevantResults] = useState<any>({});
  const [relevantProfiles, setRelevantProfiles] = useState<any>({});
  const [relevantTags, setRelevantTags] = useState<any>({});

  const loadMoreRelevantResults = useMemo(() => {
    return () => setRelevantPage((s) => s + 1);
  }, []);

  const isValidTxSearch = useMemo(() => {
    return TX_HASH_REGEX.test(searchTerm);
  }, [searchTerm]);

  const relevantResultsContext = useMemo(() => {
    if (!relevantResults) {
      return undefined;
    }
    let serializedResults: any[] = [];
    for (let i = 0; i <= relevantPage; ++i) {
      serializedResults = serializedResults.concat(relevantResults[i] ?? []);
    }
    if (serializedResults.length === 0 && !isValidTxSearch) {
      return undefined;
    }

    const prefixHit = isValidTxSearch ? [searchTerm] : [];
    const prefixLabel = isValidTxSearch ? ['-'] : [];

    return {
      title: 'Relevant Hashes',
      hits: [...prefixHit, ...serializedResults.map((r: any) => r.objectID)],
      labels: [
        ...prefixLabel,
        ...serializedResults.map((r: any) => {
          // TODO(dave4506): super fucking jank: clean up code later
          const results = r._snippetResult;
          if (
            !!results?.metadata?.originalName &&
            results?.metadata?.originalName?.matchLevel !== 'none'
          ) {
            return results?.metadata?.originalName.value;
          }
          if (
            !!results?.metadata?.name &&
            results?.metadata?.name?.matchLevel !== 'none'
          ) {
            return results?.metadata?.name.value;
          }
          if (
            !!results?.metadata?.originalDescription &&
            results?.metadata?.originalDescription?.matchLevel !== 'none'
          ) {
            return results?.metadata?.originalDescription.value;
          }
          if (
            !!results?.metadata?.description &&
            results?.metadata?.description?.matchLevel !== 'none'
          ) {
            return results?.metadata?.description.value;
          }
          return '-';
        }),
      ],
      type: 'hash',
      loadMore: loadMoreRelevantResults,
    } as HashSearchResultContext;
  }, [isValidTxSearch, searchTerm, relevantPage, relevantResults]);

  useEffect(() => {
    if (searchTerm === '') {
      return;
    }

    algoliaClient
      .search([
        {
          query: searchTerm,
          indexName: ALGOLIA_HASH_INDEX,
          params: {
            hitsPerPage: 24,
            page: relevantPage,
            attributesToSnippet: SEARCHABLE_ATTRIBUTES.map((a) => `${a}:6;`),
            highlightPreTag: '<strong>',
            highlightPostTag: '</strong>',
            snippetEllipsisText: '',
            restrictHighlightAndSnippetArrays: true,
          },
        },
        {
          query: searchTerm,
          indexName: ALGOLIA_USER_METADATA_INDEX,
          params: {
            hitsPerPage: 6,
          },
        },
        {
          query: searchTerm,
          indexName: ALGOLIA_TAGS_INDEX,
          params: {
            hitsPerPage: 4,
          },
        },
      ])
      .then(({ results }) => {
        setRelevantResults((s: any) => ({
          ...s,
          [relevantPage]: results[0].hits,
        }));
        setRelevantProfiles((s: any) => ({ ...s, [0]: results[1].hits }));
        setRelevantTags((s: any) => ({ ...s, [0]: results[2].hits }));
      });
  }, [searchTerm, relevantPage]);

  const [loadingSearch, setLoadingSearch] = useState(false);

  const gasStationHashes = useCollectionsStore(
    (s) => s.collectionHashesMap['gas-station'] ?? [],
  );

  const handleSearchTerm = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const isValidEnsSearch = useMemo(() => {
    return searchTerm.endsWith('.eth') && !searchTerm.includes(' ');
  }, [searchTerm]);

  const { data: ensResolutionData } = useSWR(
    useMemo(
      () =>
        isValidEnsSearch
          ? `${ROUTES.API.PROXY.RESOLVE_ENS}?name=${searchTerm}`
          : null,
      [isValidEnsSearch, searchTerm],
    ),
    fetcher,
    {},
  );

  const isValidAccountSearch = useMemo(() => {
    return ADDRESS_REGEX.test(searchTerm);
  }, [searchTerm]);

  const accountToFindCollection = useMemo(() => {
    if (isValidEnsSearch) {
      if (!!ensResolutionData?.address) {
        return ensResolutionData.address;
      }
    }
    if (isValidAccountSearch) {
      return utils.getAddress(searchTerm);
    }
    return undefined;
  }, [isValidAccountSearch, ensResolutionData, isValidEnsSearch, searchTerm]);

  useAccountMyTx(accountToFindCollection);

  const { data: sagaResults } = useSWR(
    useMemo(
      () =>
        !!accountToFindCollection
          ? `${ROUTES.API.COLLECTION.REVIEW}?address=${accountToFindCollection}`
          : null,
      [accountToFindCollection],
    ),
    fetcher,
    {},
  );

  const sagaResultContext = useMemo(() => {
    if (!accountToFindCollection) {
      return undefined;
    }
    const hashes = sagaResults?.data;
    if (!hashes) {
      return {
        title: 'Important moments',
        hits: [],
        labels: [],
        isLoading: true,
        type: 'hash',
        loadMore: undefined,
      } as HashSearchResultContext;
    }
    const prunedHashes = hashes
      .slice(5, 9)
      .concat(hashes.slice(0, 4))
      .slice(0, 4);

    const hits = prunedHashes.map((h: any) => h.id);

    return {
      title: 'Important moments',
      hits,
      labels: prunedHashes.map((h: any) => h.title),
      type: 'hash',
      loadMore: undefined,
    } as HashSearchResultContext;
  }, [sagaResults, accountToFindCollection]);

  const [myTxsPageSize, setMyTxsPageSize] = useState(PAGE_SIZE);

  const myTxsHashes = useCollectionsStore(
    useCallback(
      (s) => s.collectionHashesMap[`my-txs/${accountToFindCollection}`] ?? [],
      [accountToFindCollection],
    ),
  );

  const loadMoreMyTxs = useMemo(() => {
    if (myTxsPageSize < MAX_RESULTS_IN_CONTEXT) {
      return () =>
        setMyTxsPageSize((s) =>
          Math.min(s + PAGE_SIZE, MAX_RESULTS_IN_CONTEXT),
        );
    }
    return undefined;
  }, [myTxsPageSize]);

  const tagsResultContext = useMemo(() => {
    if (!relevantTags?.[0] || relevantTags[0].length === 0) {
      return undefined;
    }
    const hits = relevantTags[0].map((h: any) => h.key);
    return {
      title: 'Relevant Tags',
      hits,
      labels: hits.map(() => undefined),
      type: 'tag',
      loadMore: undefined,
    } as TagSearchResultContext;
  }, [relevantTags]);

  const myTxsResultContext = useMemo(() => {
    if (!accountToFindCollection) {
      return undefined;
    }
    if (!myTxsHashes) {
      return {
        title: 'Latest txns from account',
        hits: [],
        labels: [],
        isLoading: true,
        type: 'hash',
        loadMore: loadMoreMyTxs,
      } as HashSearchResultContext;
    }

    const hits = myTxsHashes.slice(0, myTxsPageSize);
    return {
      title: 'Latest txns from account',
      hits,
      labels: hits.map(() => '-'),
      type: 'hash',
      loadMore: loadMoreMyTxs,
    } as HashSearchResultContext;
  }, [myTxsHashes, myTxsPageSize, accountToFindCollection, loadMoreMyTxs]);

  const profileResultsContext = useMemo(() => {
    if (isValidEnsSearch && !accountToFindCollection) {
      return {
        title: 'Profiles',
        hits: [],
        isLoading: true,
        labels: [],
        type: 'profile',
        loadMore: undefined,
      } as ProfileSearchResultContext;
    }

    if (
      !accountToFindCollection &&
      (!relevantProfiles?.[0] || relevantProfiles?.[0].length === 0)
    ) {
      return undefined;
    }

    return {
      title: 'Profiles',
      hits: (!!accountToFindCollection ? [accountToFindCollection] : []).concat(
        (relevantProfiles?.[0] ?? []).map((p: any) => p.objectID),
      ),
      labels: ['View account'],
      type: 'profile',
      loadMore: undefined,
    } as ProfileSearchResultContext;
  }, [searchTerm, accountToFindCollection, relevantProfiles]);

  useEffect(() => {
    if (previousSearchTerm !== searchTerm) {
      setRelevantPage(0);
      setRelevantResults({});
      setRelevantProfiles({});
      setRelevantTags({});
      setMyTxsPageSize(PAGE_SIZE);
    }
  }, [previousSearchTerm, searchTerm]);

  const goToRandomTx = useCallback(() => {
    const txns = gasStationHashes;
    if (router.pathname === '/art/[hash]') {
      let randomTx = '';
      let tries = 0;
      while (randomTx === '' || tries < 10) {
        const possibleRandomTx = txns[Math.floor(Math.random() * txns.length)];
        if (router.query.hash !== possibleRandomTx) {
          randomTx = possibleRandomTx;
        }
        tries++;
      }
      router.push(`${ROUTES.ART.INDEX}/${randomTx}`);
      setTimeout(() => {
        setLoadingSearch(false);
      }, 1500); // timeout and reset if something goes wrong
    } else {
      const randomTx = txns[Math.floor(Math.random() * txns.length)];
      router.push(`${ROUTES.ART.INDEX}/${randomTx}`);
      setTimeout(() => {
        setLoadingSearch(false);
      }, 6000); // timeout and reset if something goes wrong
    }
    setSearchTerm('');
  }, [gasStationHashes]);

  const handleLucky = useCallback(async () => {
    if (!loadingSearch) {
      setLoadingSearch(true);
      goToRandomTx();
    }
  }, [loadingSearch, goToRandomTx]);

  const isShuffleDisabled = useMemo(() => {
    return !gasStationHashes || gasStationHashes.length <= 1;
  }, [myTxsHashes, gasStationHashes]);

  const resultContexts = useMemo(
    () =>
      [
        tagsResultContext,
        profileResultsContext,
        sagaResultContext,
        myTxsResultContext,
        relevantResultsContext,
      ].filter((r) => !!r) as SearchResultContext[],
    [
      relevantResultsContext,
      profileResultsContext,
      sagaResultContext,
      myTxsResultContext,
      tagsResultContext,
    ],
  );

  return {
    resultContexts,
    searchTerm,
    handleSearchTerm,
    handleLucky,
    loadingSearch,
    setLoadingSearch,
    isShuffleDisabled,
  };
};
