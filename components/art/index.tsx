import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import {
  CURRENT_SEASON,
  NUM_TO_SEASON,
  Season,
  SEASON_TO_NUM,
} from '@hash/seasons';
import { NATIVE_RATIO } from '@hash/types';
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import useMeasure from 'react-use-measure';
import styled from 'styled-components';
import { fb } from '../../clients/firebase-app';
import { usePriorityAccount } from '../../connectors/priority';
import { HEADER_HEIGHT } from '../../constants';
import { useAuthContext, useIsHashSaved } from '../../contexts/auth';
import {
  TokenProvider,
  useHashByContext,
  useIsMigratedByContext,
  usePreferredSeasonByContext,
  useSetChosenSeasonByContext,
  useTokenMetadataByContext,
} from '../../contexts/token';
import { useModalStore } from '../../stores/modal';
import { BREAKPTS } from '../../styles';
import { BaseButton } from '../button';
import { Feeds } from '../feeds';
import { Flex, FlexEnds } from '../flex';
import { BookmarkIcon } from '../icons/bookmark';
import { LargeLeftArrow, LargeRightArrow } from '../icons/largeArrow';
import { ShareIcon } from '../icons/share';
import { ExpandIcon, RecedeIcon } from '../icons/spotlight';
import { BidModal } from '../modals/bid';
import { ListModalWithApprovalStep } from '../modals/list';
import { LowerModal } from '../modals/lower';
import { MigrateModal } from '../modals/migrate';
import { ShareModal } from '../modals/share';
import { Render } from '../render';
import { ArtworkDescription } from './panels/description';
import { HistoryPanel } from './panels/historyPanel';
import { LicenseFooter } from './panels/licenseFooter';
import { MetadataDetailsPanel } from './panels/metadataPanel';
import { OffersPanel } from './panels/offersPanel';
import { TokenStatePanel } from './panels/tokenStatePanel';

const CARD_PADDING = 60;

const ArtContainer = styled.div<{ isSpotlight?: boolean }>`
  min-height: 100%;
  position: relative;
  display: grid;
  grid-template-columns: ${(p) => (p.isSpotlight ? '1fr' : '1fr 1fr')};

  @media (max-width: ${BREAKPTS.MD}px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }
`;

const LeftWell = styled.div`
  background: #f8f8f8;
  min-height: calc(100vh - ${HEADER_HEIGHT}px);
  padding-bottom: 8px;
`;

const ArtImageWell = styled.div<{ isSpotlight?: boolean }>`
  position: relative;
  background: #f8f8f8;
  height: calc(
    ${(p) => (p.isSpotlight ? '100vh' : '75vh')} - ${HEADER_HEIGHT}px
  );
  min-height: 512px;
`;

const ArtDescriptionContainer = styled('div')<{ isSpotlight?: boolean }>`
  display: ${(p) => (p.isSpotlight ? 'none' : 'block')};
  position: relative;
  padding-top: 36px;
  padding-bottom: 256px;
  @media (max-width: ${BREAKPTS.SM}px) {
    padding-bottom: 128px;
  }
`;

const RenderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
`;

const IconButton = styled(BaseButton)`
  transition: opacity 150ms ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;
  svg {
    height: 24px;
    width: 24px;
  }
`;

const IconWithTextButton = styled(BaseButton)<{ isActive?: boolean }>`
  transition: opacity 150ms ease-out;
  display: flex;
  align-items: center;
  font-weight: bold;
  padding: 0px 16px;
  color: ${(p) => (p.isActive ? '#FF4500' : 'black')};
  svg {
    height: 16px;
    width: 16px;
    margin-right: 8px;
    * {
      fill: ${(p) => (p.isActive ? '#FF4500' : 'black')};
    }
  }
`;

const ArrowControlsButton = styled(IconButton)`
  height: 14px;
  width: 14px;
  svg {
    height: 12px;
    width: 12px;
  }
  :disabled {
    cursor: not-allowed;
    opacity: 0.25;
  }
`;

const LeftArrow = styled(LargeLeftArrow)`
  width: 12px;
  height: 12px;
`;

const RightArrow = styled(LargeRightArrow)`
  width: 12px;
  height: 12px;
`;

const ControlsWell = styled(Flex)`
  justify-content: center;
  background: white;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.05);
  border-radius: 999px;
  font-weight: bold;
  :hover {
    background-color: rgb(250, 250, 250);
  }
`;

const ControlsContainer = styled(FlexEnds)`
  position: absolute;
  left: 18px;
  right: 18px;
  top: 18px;
  z-index: 2;
`;

const ControlsRightContainer = styled(Flex)`
  > ${ControlsWell} + ${ControlsWell} {
    margin-left: 14px;
  }
`;

const SeasonLabel = styled.p`
  font-size: 12px;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  margin: 0;
  padding: 0 12px;
`;

const Controls: FC<{
  season: Season | undefined;
  preferredSeason: Season | undefined;
  setChosenSeason: Dispatch<SetStateAction<Season | undefined>>;
  isSpotlight?: boolean;
  setIsSpotlight: Dispatch<SetStateAction<boolean>>;
}> = ({
  season,
  preferredSeason,
  setChosenSeason,
  setIsSpotlight,
  isSpotlight,
}) => {
  const hash = useHashByContext();
  const isPreviousSeasonDisabled = useMemo(() => {
    if (!preferredSeason || !season) {
      return true;
    }
    const preferredSeasonNum = SEASON_TO_NUM[preferredSeason];
    const seasonNum = SEASON_TO_NUM[season];
    return !(preferredSeasonNum > seasonNum);
  }, [preferredSeason, season]);

  const handleClickPreviousSeason = useCallback(() => {
    if (!preferredSeason) {
      return;
    }
    if (!isPreviousSeasonDisabled) {
      // decrement a season
      const preferredSeasonNum = SEASON_TO_NUM[preferredSeason];
      setChosenSeason?.(NUM_TO_SEASON[preferredSeasonNum - 1]);
    }
  }, [isPreviousSeasonDisabled, preferredSeason]);

  const isNextSeasonDisabled = useMemo(() => {
    if (!preferredSeason) {
      return true;
    }
    const preferredSeasonNum = SEASON_TO_NUM[preferredSeason];
    return !(preferredSeasonNum < (SEASON_TO_NUM as any)[CURRENT_SEASON]);
  }, [preferredSeason]);

  const handleClickNextSeason = useCallback(() => {
    if (!preferredSeason) {
      return;
    }
    if (!isNextSeasonDisabled) {
      // increment a season
      const preferredSeasonNum = SEASON_TO_NUM[preferredSeason];
      setChosenSeason?.(NUM_TO_SEASON[preferredSeasonNum + 1]);
    }
  }, [preferredSeason]);

  const toggleIsSpotlight = useCallback(() => setIsSpotlight((s) => !s), []);

  const [isShareOpen, setIsShareOpen] = useState(false);

  const account = usePriorityAccount();
  const isSaved = useIsHashSaved(hash);
  const isAuthenticated = useAuthContext()?.isAuthenticated;
  const toggleLoginModal = useModalStore((s) => s.toggleIsLoginModalOpen);

  const toggleSave = useCallback(async () => {
    if (!account) {
      return;
    }
    if (!hash) {
      return;
    }
    if (!isAuthenticated) {
      toggleLoginModal();
      return;
    }
    const firestore = fb.firestore();
    const ref = firestore.collection(FIRESTORE_ROUTES.SAVES).doc(account);
    await firestore.runTransaction(async (u) => {
      const snapshot = await u.get(ref);
      if (snapshot.exists) {
        await u.update(ref, { [hash]: !snapshot.data()?.[hash] });
      } else {
        await u.set(ref, { [hash]: true });
      }
    });
  }, [isAuthenticated, toggleLoginModal, account, hash]);

  return (
    <>
      {!!hash && (
        <ShareModal
          isOpen={isShareOpen}
          setIsOpen={setIsShareOpen}
          hash={hash}
        />
      )}
      <ControlsContainer>
        <ControlsWell style={{ height: 38, padding: '0 12px' }}>
          <ArrowControlsButton
            onClick={handleClickPreviousSeason}
            disabled={isPreviousSeasonDisabled}
          >
            <LeftArrow />
          </ArrowControlsButton>
          <SeasonLabel>{preferredSeason}</SeasonLabel>
          <ArrowControlsButton
            onClick={handleClickNextSeason}
            disabled={isNextSeasonDisabled}
          >
            <RightArrow />
          </ArrowControlsButton>
        </ControlsWell>
        <ControlsRightContainer>
          <ControlsWell>
            <IconWithTextButton
              onClick={() => setIsShareOpen((s) => !s)}
              style={{ height: 38 }}
            >
              <ShareIcon />
              Share
            </IconWithTextButton>
          </ControlsWell>
          <ControlsWell>
            <IconWithTextButton
              isActive={isSaved}
              onClick={() => toggleSave()}
              style={{ height: 38 }}
            >
              <BookmarkIcon />
              {/* {!!sharedCount ? sharedCount + ' ' : ' '} */}
              {isSaved ? 'Saved' : 'Save'}
            </IconWithTextButton>
          </ControlsWell>
          <ControlsWell>
            <IconButton
              onClick={toggleIsSpotlight}
              style={{ height: 38, width: 38 }}
            >
              {isSpotlight ? <RecedeIcon /> : <ExpandIcon />}
            </IconButton>
          </ControlsWell>
        </ControlsRightContainer>
      </ControlsContainer>
    </>
  );
};
const ArtContent: FC = ({}) => {
  const [imageWellRef, imageWellBounds] = useMeasure();

  const cardDimensionsBySketchDimensions: [number, number] = useMemo(() => {
    const { height, width } = imageWellBounds;
    const mW = width / NATIVE_RATIO[0];
    const mH = height / NATIVE_RATIO[1];

    return mH < mW
      ? [
          (NATIVE_RATIO[0] / NATIVE_RATIO[1]) * (height - CARD_PADDING),
          height - CARD_PADDING,
        ]
      : [width, (NATIVE_RATIO[1] * width) / NATIVE_RATIO[0]];
  }, [imageWellBounds]);

  const [isParallax, setIsParallax] = useState(false);
  const [isSpotlight, setIsSpotlight] = useState(false);
  const handleArtworkClick = useCallback(() => setIsParallax((s) => !s), []);

  const hash = useHashByContext();
  const hashOrUndefined = useMemo(() => hash ?? undefined, [hash]);

  const preferredSeason = usePreferredSeasonByContext();
  const setChosenSeason = useSetChosenSeasonByContext();

  const tokenMetadata = useTokenMetadataByContext();

  const season = useMemo(() => {
    return tokenMetadata?.properties?.season?.value?.toLowerCase() as
      | Season
      | undefined;
  }, [tokenMetadata]);

  const [isMigrateOpen, setIsMigrateOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isLowerOpen, setIsLowerOpen] = useState(false);
  const [isBidOpen, setIsBidOpen] = useState(false);

  const isMigrated = useIsMigratedByContext();

  useEffect(() => {
    if (isMigrateOpen && isMigrated) {
      setIsMigrateOpen(false);
    }
  }, [isMigrated, isMigrateOpen]);
  return (
    <>
      <MigrateModal isOpen={isMigrateOpen} setIsOpen={setIsMigrateOpen} />
      <ListModalWithApprovalStep
        isOpen={isListOpen}
        setIsOpen={setIsListOpen}
      />
      <LowerModal isOpen={isLowerOpen} setIsOpen={setIsLowerOpen} />
      <BidModal isOpen={isBidOpen} setIsOpen={setIsBidOpen} />
      <ArtContainer isSpotlight={isSpotlight}>
        <LeftWell>
          <ArtImageWell isSpotlight={isSpotlight} ref={imageWellRef}>
            <RenderContainer>
              {!!hashOrUndefined && (
                <Render
                  key={`art-well-${hash}`}
                  dimensions={cardDimensionsBySketchDimensions}
                  hash={hashOrUndefined}
                  shouldEnableRAFLoop={false}
                  isParallax={isParallax}
                  preferredSeason={preferredSeason}
                  handleArtworkClick={handleArtworkClick}
                />
              )}
            </RenderContainer>
            <Controls
              setChosenSeason={setChosenSeason}
              preferredSeason={preferredSeason}
              season={season}
              isSpotlight={isSpotlight}
              setIsSpotlight={setIsSpotlight}
            />
          </ArtImageWell>
          <PanelsContainer isSpotlight={isSpotlight}>
            <TokenStatePanel
              setIsBidOpen={setIsBidOpen}
              setIsListOpen={setIsListOpen}
              setIsMigrateOpen={setIsMigrateOpen}
              setIsLowerOpen={setIsLowerOpen}
            />
            <OffersPanel setIsMigrateOpen={setIsMigrateOpen} />
            <MetadataDetailsPanel />
            <HistoryPanel />
            <LicenseFooter />
          </PanelsContainer>
        </LeftWell>
        <ArtDescriptionContainer isSpotlight={isSpotlight}>
          <ArtworkDescription key={`art-description-${hash}`} />
          <Feeds />
        </ArtDescriptionContainer>
      </ArtContainer>
    </>
  );
};

const PanelsContainer = styled.div<{ isSpotlight?: boolean }>`
  display: ${(p) => (p.isSpotlight ? 'none' : 'block')};
  padding: 0 40px;
  > div + div {
    margin-top: 20px;
  }
`;

export const Art: FC<{ hash: string }> = ({ hash }) => {
  return (
    <TokenProvider
      hash={hash}
      shouldGetPrerenderPayload={true}
      shouldFetchMarketData={true}
      shouldFetchTags={true}
      shouldFetchSaveCount={true}
      shouldFetchComments={true}
    >
      <ArtContent />
    </TokenProvider>
  );
};
