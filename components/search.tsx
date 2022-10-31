import parse from 'html-react-parser';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FadeIn from 'react-lazyload-fadein';
import { animated, easings, useSpring } from 'react-spring';
import { useMeasure, useWindowSize } from 'react-use';
import styled from 'styled-components';
import { ROUTES } from '../constants/routes';
import {
  TokenProvider,
  useHashByContext,
  useTokenMetadataByContext,
  useUserAddedMetadataByContext,
} from '../contexts/token';
import { TokenPrefetchProvider } from '../contexts/tokenPrefetch';
import { useBreakPts } from '../hooks/useBreakPts';
import { useIsHeaderTransparent } from '../hooks/useIsHeaderTransparent';
import {
  HashSearchResultContext,
  ProfileSearchResultContext,
  TagSearchResultContext,
  useSearch,
} from '../hooks/useSearch';
import { useUser } from '../hooks/useUser';
import { useModalStore } from '../stores/modal';
import { BREAKPTS } from '../styles';
import { shortenHexString } from '../utils/hex';
import { getArtworkPreviewUrl } from '../utils/urls';
import { CleanAnchor } from './anchor';
import { UserAvatar } from './avatar';
import { Flex, FlexCenter, FlexEnds } from './flex';
import { SearchIcon } from './icons/search';
import { ShuffleIcon } from './icons/shuffle';
import { LoadingCard } from './loadingCard';
import { Spinner } from './spinner';
import { Tag } from './tag';

const SEARCH_ROW_HEIGHT = 64 + 32;
const SEARCH_ROW_CONTENT_HEIGHT = 64;
const TAG_SEARCH_ROW_HEIGHT = 34;

const SearchInputUnanimated = styled.input.attrs({ type: 'text' })`
  font-size: 14px;
  background: none;
  border: none;
  border-radius: none;
  padding: 0 8px 0 0;
  outline: none;
  overflow: hidden;
  flex-grow: 1;
  ::placeholder {
    color: black;
    opacity: 0.3;
  }
`;

const SearchInputContent = styled(FlexEnds)`
  height: 48px;
  padding: 16px 16px;
  width: 100%;
`;

const SearchInput = animated(SearchInputUnanimated);

const SearchInputWrapperUnanimated = styled.div<{
  isHeaderTransparent?: boolean;
}>`
  background: #f0efef;
  border-radius: 999px;
  width: 440px;
  transition: 125ms ease-in-out all;
  will-change: width, box-shadow, border-radius;
  z-index: 1101;
  position: fixed;
  top: 18px;
  left: 100px;
  margin: auto;
  @media (max-width: ${BREAKPTS.MD}px) {
    left: 72px;
  }
`;

const SearchInputWrapper = animated(SearchInputWrapperUnanimated);

const IconButton = styled.button`
  width: 16px;
  height: 16px;
  outline: none;
  background: none;
  border-radius: 0;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  > svg {
    height: 16px;
    width: 16px;
  }
  :disabled {
    cursor: not-allowed;
    opacity: 0.2;
  }
`;

const SearchModalBackground = styled(animated.div)`
  position: fixed;
  z-index: 1100;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  transition: all 150ms ease-in-out;
`;

const SearchExpandoContainer = styled(animated.div)`
  position: relative;
  will-change: transform, opacity, height;
  overflow-x: hidden;
  overflow-y: auto;
  > div + div {
    margin-top: 24px;
  }
`;

const SearchExpandoAbsoluteContainer = styled.div`
  position: absolute;
  width: 100%;
`;

const SearchExpandoContent = styled.div`
  width: 100%;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 8px;
`;

const SearchResultGroupContainer = styled.div`
  padding: 8px 0;
  width: 100%;
`;

const SearchResultGroupTitle = styled.p`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.25);
  text-transform: uppercase;
  padding: 0;
  margin: 0;
`;

const SearchResultStateBox = styled(FlexCenter)`
  height: ${SEARCH_ROW_HEIGHT}px;
  font-family: Helvetica Neue;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.25);
`;

const SearchResultsGroup: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <SearchResultGroupContainer>
      <FlexEnds style={{ padding: '8px 12px', paddingTop: 0 }}>
        <SearchResultGroupTitle>{title}</SearchResultGroupTitle>
      </FlexEnds>
      {children}
    </SearchResultGroupContainer>
  );
};

const SearchResultsContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-auto-rows: ${SEARCH_ROW_HEIGHT}px;
  @media (max-width: ${BREAKPTS.MD}px) {
    grid-template-columns: minmax(0, 1fr);
  }
  width: 100%;
  padding: 0 9px 0 9px;
`;

const TagSearchResultsContainer = styled.div`
  /* width: 100%;
  max-width: 100%; */
  height: ${TAG_SEARCH_ROW_HEIGHT}px;
  overflow-x: auto;
  margin: 14px 0;
  padding: 0 18px 0 19px;
`;

const TagSearchResultsScrollContainer = styled.div`
  display: flex;
  gap: 8px;
  > a {
    flex-grow: 1;
  }
  width: fit-content;
`;

export const SearchResultContainer = styled.div`
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  padding: 4px;
  background: rgba(0, 0, 0, 0);
  transition: background 150ms ease-in-out;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  height: ${SEARCH_ROW_CONTENT_HEIGHT}px;
  width: ${SEARCH_ROW_CONTENT_HEIGHT}px;
  object-fit: cover;
  object-position: center;
  border-radius: 4px;
  overflow: hidden;
  min-width: 0;
`;

const AnimatedImageContainer = animated(ImageContainer);

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  position: relative;
`;

const AnimatedImage = animated(StyledImage);

const SearchResultTitle = styled.h3`
  font-family: Helvetica Neue;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  height: 20px;
  margin: 0;
  padding: 0;
  color: black;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SearchResultSubTitle = styled.p`
  font-family: Helvetica Neue;
  font-size: 14px;
  line-height: 17px;
  height: 17px;
  margin: 0;
  padding: 0;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SearchResultTextContainer = styled.div`
  padding-left: 12px;
  min-width: 0;
`;

const SearchResultImage: React.FC<{ className?: string; src?: string }> = ({
  className,
  src,
}) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  return (
    <AnimatedImageContainer className={className}>
      <LoadingCard isLoading={isImageLoading} />
      <FadeIn height={SEARCH_ROW_HEIGHT}>
        {(onload: any) =>
          !!src && (
            <AnimatedImage
              src={src}
              onLoad={() => {
                onload();
                setIsImageLoading(false);
              }}
            />
          )
        }
      </FadeIn>
    </AnimatedImageContainer>
  );
};

const HashResultContent: React.FC<{
  label?: string;
}> = ({ label }) => {
  const hash = useHashByContext();
  const metadata = useTokenMetadataByContext();
  const userAddedMetadata = useUserAddedMetadataByContext();
  const imageUrl = useMemo(() => {
    return metadata?.cachedImage ?? getArtworkPreviewUrl(hash ?? '');
  }, [hash, metadata]);
  return (
    <Link href={`${ROUTES.ART.INDEX}/${hash ?? '#'}`} passHref>
      <CleanAnchor>
        <SearchResultContainer>
          <Flex>
            <SearchResultImage src={imageUrl} />
          </Flex>
          <Flex>
            <SearchResultTextContainer>
              <SearchResultTitle>{userAddedMetadata?.name}</SearchResultTitle>
              <SearchResultSubTitle>
                {parse(
                  label ??
                    userAddedMetadata?.description ??
                    (!!hash ? shortenHexString(hash) : ''),
                )}
              </SearchResultSubTitle>
            </SearchResultTextContainer>
          </Flex>
        </SearchResultContainer>
      </CleanAnchor>
    </Link>
  );
};

export const HashResult: React.FC<{
  hash: string;
  label?: string;
}> = ({ hash, label }) => {
  return (
    <TokenProvider hash={hash}>
      <HashResultContent label={label} />
    </TokenProvider>
  );
};

const ProfileResult: React.FC<{ label?: string; address: string }> = ({
  address,
  label,
}) => {
  const user = useUser(address);
  return (
    <Link href={`${ROUTES.USER}/${address}`} passHref>
      <CleanAnchor>
        <SearchResultContainer>
          <Flex>
            <UserAvatar size={SEARCH_ROW_CONTENT_HEIGHT} user={address} />
          </Flex>
          <Flex>
            <SearchResultTextContainer>
              <SearchResultTitle>{user?.bestName}</SearchResultTitle>
              <SearchResultSubTitle>{label ?? ''}</SearchResultSubTitle>
            </SearchResultTextContainer>
          </Flex>
        </SearchResultContainer>
      </CleanAnchor>
    </Link>
  );
};

// const LoadMorePill = styled.button`
//   font-family: Helvetica;
//   font-style: normal;
//   font-weight: normal;
//   font-size: 12px;
//   text-transform: uppercase;
//   color: #808080;
//   background: #f8f8f8;
//   border: 1px solid rgba(16, 16, 16, 0.1);
//   box-sizing: border-box;
//   border-radius: 9999px;
//   padding: 4px 8px;
//   cursor: pointer;
//   :hover {
//     background: #eeeeee;
//   }
// `;

const HashSearchResultContentGroup: React.FC<HashSearchResultContext> = ({
  title,
  hits,
  labels,
  isLoading,
}) => {
  return (
    <SearchResultsGroup title={title}>
      {isLoading && (
        <SearchResultStateBox>Give us a sec...</SearchResultStateBox>
      )}
      {hits.length === 0 && !isLoading && (
        <SearchResultStateBox>No results found.</SearchResultStateBox>
      )}
      {hits.length !== 0 && (
        <SearchResultsContainer>
          {hits.map((h, i) => (
            <TokenPrefetchProvider
              key={`search-results--token-prefetch-provider-${h}-${i}`}
            >
              <HashResult hash={h as string} label={labels?.[i]} />
            </TokenPrefetchProvider>
          ))}
        </SearchResultsContainer>
      )}
    </SearchResultsGroup>
  );
};

const TagSearchResultContentGroup: React.FC<TagSearchResultContext> = ({
  title,
  hits,
}) => {
  return (
    <SearchResultsGroup title={title}>
      {hits.length === 0 && (
        <SearchResultStateBox style={{ height: TAG_SEARCH_ROW_HEIGHT }}>
          No results found.
        </SearchResultStateBox>
      )}
      {hits.length !== 0 && (
        <TagSearchResultsContainer>
          <TagSearchResultsScrollContainer>
            {hits.map((h, i) => {
              return (
                <React.Fragment key={`search-result-${title}-${i}`}>
                  <Link href={`${ROUTES.MARKET}?tags=${h}`} passHref>
                    <CleanAnchor>
                      <Tag>{h}</Tag>
                    </CleanAnchor>
                  </Link>
                </React.Fragment>
              );
            })}
          </TagSearchResultsScrollContainer>
        </TagSearchResultsContainer>
      )}
    </SearchResultsGroup>
  );
};

const ProfileSearchResultContentGroup: React.FC<ProfileSearchResultContext> = ({
  title,
  hits,
  labels,
  isLoading,
}) => {
  return (
    <SearchResultsGroup title={title}>
      {isLoading && (
        <SearchResultStateBox>Give us a sec...</SearchResultStateBox>
      )}
      {hits.length === 0 && !isLoading && (
        <SearchResultStateBox>No results found.</SearchResultStateBox>
      )}
      {hits.length !== 0 && (
        <SearchResultsContainer>
          {hits.map((h, i) => {
            return (
              <ProfileResult
                address={h}
                label={labels?.[i]}
                key={`search-result-profile-${h}`}
              />
            );
          })}
        </SearchResultsContainer>
      )}
    </SearchResultsGroup>
  );
};

export const Search: React.FC = () => {
  const router = useRouter();

  const {
    searchTerm,
    handleSearchTerm,
    handleLucky,
    loadingSearch,
    isShuffleDisabled,
    resultContexts,
  } = useSearch();

  useEffect(() => {
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const isSearchModalOpen = useModalStore((s) => s.isSearchModalOpen);
  const setIsSearchModal = useModalStore((s) => s.setIsSearchModalOpen);

  const handleRouteChange = useCallback(() => {
    handleSearchTerm({ target: { value: '' } });
    setIsSearchModal(false);
  }, [handleSearchTerm]);

  const isHeaderTransparent = useIsHeaderTransparent();

  const breakPt = useBreakPts();

  const left = useMemo(() => {
    if (!isSearchModalOpen) {
      if (breakPt === 'LG') {
        return 72;
      }
      if (breakPt === 'MD') {
        return 72;
      }
      if (breakPt === 'SM') {
        return 72;
      }
      return 100;
    }
    if (isSearchModalOpen) {
      if (breakPt === 'LG') {
        return 72;
      }
      if (breakPt === 'MD') {
        return 72;
      }
      if (breakPt === 'SM') {
        return 20;
      }
      return 100;
    }
    return 0;
  }, [breakPt, isSearchModalOpen]);

  const windowSize = useWindowSize();

  const contentWidth = useMemo(() => {
    if (!isSearchModalOpen) {
      if (breakPt === 'LG') {
        return 400;
      }
      if (breakPt === 'MD') {
        return 80;
      }
      if (breakPt === 'SM') {
        return 80;
      }
      return windowSize.width ? Math.min(windowSize.width - 640, 1200) : 540;
    }
    if (isSearchModalOpen) {
      if (breakPt === 'LG') {
        return 512;
      }
      if (breakPt === 'MD') {
        return windowSize.width ? windowSize.width - 92 : 480;
      }
      if (breakPt === 'SM') {
        return windowSize.width ? windowSize.width - 40 : 340;
      }
      return windowSize.width ? windowSize.width - 540 : 480;
    }
    return 0;
  }, [breakPt, windowSize.width, isSearchModalOpen]);

  const isSearchFieldDisplayed = useMemo(() => {
    return isSearchModalOpen || (breakPt !== 'SM' && breakPt !== 'MD');
  }, [breakPt, isSearchModalOpen]);

  const {
    opacity,
    borderRadius,
    boxShadow,
    width,
    searchFieldOpacity,
    backgroundColor,
  } = useSpring(
    useMemo(
      () => ({
        opacity: isSearchModalOpen ? 1 : 0,
        borderRadius: isSearchModalOpen ? 8 : 24,
        boxShadow: isSearchModalOpen
          ? '0px 9px 20px rgba(0, 0, 0, 0.14)'
          : '0px 9px 20px rgba(0, 0, 0, 0)',
        width: contentWidth,
        searchFieldOpacity: isSearchFieldDisplayed ? 1 : 0,
        backgroundColor: isSearchModalOpen ? 'white' : '#f0efef',
        config: {
          duration: 150,
          easing: easings.easeInOutQuart,
        },
      }),
      [isSearchFieldDisplayed, isSearchModalOpen, contentWidth],
    ),
  );

  const [expandoContentRef, expandoContentBounds] = useMeasure();

  const maxExpandoHeight = useMemo(() => {
    if (breakPt === 'LG') {
      return 640;
    }
    if (breakPt === 'MD') {
      return 660;
    }
    if (breakPt === 'SM') {
      return 660;
    }
    return 720;
  }, [breakPt]);

  const expandoClippedHeight = useMemo(
    () => Math.min(maxExpandoHeight, expandoContentBounds.height),
    [maxExpandoHeight, expandoContentBounds.height],
  );

  const { height: expandoHeight, opacity: expandoOpacity } = useSpring({
    from: { height: 0, opacity: 0 },
    to: {
      height: isSearchModalOpen ? expandoClippedHeight : 0,
      opacity: isSearchModalOpen ? 1 : 0,
    },
    config: {
      duration: 250,
      easing: easings.easeInOutQuart,
    },
  });

  return (
    <>
      <SearchModalBackground
        style={{
          opacity,
          visibility: opacity.to((o) => (o === 0 ? 'hidden' : 'visible')),
        }}
        onClick={() => {
          if (isSearchModalOpen) {
            setIsSearchModal(false);
          }
        }}
      />
      <SearchInputWrapper
        style={{
          borderRadius,
          boxShadow,
          backgroundColor,
          width,
          left,
        }}
        isHeaderTransparent={isHeaderTransparent}
      >
        <SearchInputContent>
          <SearchInput
            style={{
              opacity: searchFieldOpacity,
              display: searchFieldOpacity.to((o) =>
                o === 0 ? 'none' : 'inherit',
              ),
            }}
            spellCheck="false"
            onChange={handleSearchTerm}
            value={searchTerm}
            placeholder={'Search by subject, txn, or account'}
            onClick={() => {
              if (!isSearchModalOpen) {
                setIsSearchModal(true);
              }
            }}
          />
          <IconButton
            onClick={handleLucky}
            style={{ marginRight: 14 }}
            title="I'm feeling lucky"
            disabled={isShuffleDisabled}
          >
            {loadingSearch ? <Spinner /> : <ShuffleIcon />}
          </IconButton>
          <IconButton
            onClick={() => {
              if (!isSearchModalOpen) {
                setIsSearchModal(true);
              }
            }}
            title="Search"
          >
            <SearchIcon />
          </IconButton>
        </SearchInputContent>
        <SearchExpandoContainer
          style={{ opacity: expandoOpacity, height: expandoHeight }}
        >
          <SearchExpandoAbsoluteContainer ref={expandoContentRef as any}>
            <SearchExpandoContent
              style={{
                display: resultContexts.length === 0 ? 'none' : 'block',
              }}
            >
              {resultContexts.map((r) => {
                if (r.type === 'profile') {
                  return (
                    <ProfileSearchResultContentGroup
                      key={`result-group-profile-${r.title}`}
                      {...(r as ProfileSearchResultContext)}
                    />
                  );
                }
                if (r.type === 'tag') {
                  return (
                    <TagSearchResultContentGroup
                      key={`result-group-tag-${r.title}`}
                      {...(r as TagSearchResultContext)}
                    />
                  );
                }
                if (r.type === 'hash') {
                  return (
                    <HashSearchResultContentGroup
                      key={`result-group-hash-${r.title}`}
                      {...(r as HashSearchResultContext)}
                    />
                  );
                }
                return <React.Fragment key={'null-frag'}></React.Fragment>;
              })}
            </SearchExpandoContent>
          </SearchExpandoAbsoluteContainer>
        </SearchExpandoContainer>
      </SearchInputWrapper>
    </>
  );
};
