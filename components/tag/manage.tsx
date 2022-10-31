import { useCallback, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import styled from 'styled-components';
import { fb } from '../../clients/firebase-app';
import { usePriorityAccount } from '../../connectors/priority';
import {
  useActiveTagByContext,
  useAllTagsByContext,
  useSelectedTagKeysByContext,
  useSetActiveTagKeyByContext,
  useSetTagManagerActionStateByContext,
  useTagManagerActionStateByContext,
  useTagManagerContext,
} from '../../contexts/tagsManager';
import { useUser } from '../../hooks/useUser';
import { Tag } from '../../types/tag';
import { ConnectWalletAction } from '../actions/connectWallet';
import { SplitFullPageContent } from '../content';
import { SplitHeader } from '../header';
import { CreateTag } from './states/create';
import { TagDetails } from './states/details';
import { IntroState } from './states/intro';
import { LearnMoreState } from './states/learn-more';
import { TabGroup, TagsContainer } from './tagGroup';

const auth = fb.auth();

const TagsWell = styled.div`
  overflow-y: auto;
  background: #f2f2f2;
  padding-top: 74px;
`;

const ActionWell = styled.div`
  overflow-y: auto;
  padding-top: 72px;
`;

const ActionState = () => {
  const account = usePriorityAccount();
  const actionState = useTagManagerActionStateByContext();

  if (!account) {
    return (
      <ActionWell>
        <ConnectWalletAction
          title={'Connect your wallet'}
          description={
            'If you are a historian, connect your wallet to manage tags'
          }
        />
      </ActionWell>
    );
  }

  return (
    <ActionWell>
      {actionState === 'intro' && <IntroState />}
      {actionState === 'learn-more' && <LearnMoreState />}
      {actionState === 'create-event-match-tag' && <CreateTag />}
      {actionState === 'create-contract-interaction-tag' && <CreateTag />}
      {actionState === 'create-tag-group-tag' && <CreateTag />}
      {actionState === 'show-tag-details' && <TagDetails />}
    </ActionWell>
  );
};
export const ManageTag = () => {
  const tags = useAllTagsByContext();

  const setActionState = useSetTagManagerActionStateByContext();
  const actionState = useTagManagerActionStateByContext();
  const activeTag = useActiveTagByContext();
  const setActiveTagKey = useSetActiveTagKeyByContext();
  const isSelectable = useTagManagerContext().isTagsSelectable;

  const [currentUser] = useAuthState(auth);
  const { roles } = useUser(currentUser?.uid) ?? {};

  const contractInteractionTags = useMemo(
    () => tags?.filter((t) => t.metadata.type === 'contract-interaction-tag'),
    [tags],
  );
  const customTags = useMemo(
    () =>
      tags?.filter(
        (t) =>
          t.metadata.type === 'custom-tag' ||
          t.metadata.type === 'live-custom-tag',
      ),
    [tags],
  );
  const tagGroupTags = useMemo(
    () => tags?.filter((t) => t.metadata.type === 'tag-group-tag'),
    [tags],
  );

  const eventMatchTags = useMemo(
    () => tags?.filter((t) => t.metadata.type === 'event-match-tag'),
    [tags],
  );

  const selectedTagKeys = useSelectedTagKeysByContext();

  const selectedTagKeysForUI = useMemo(() => {
    if (actionState === 'show-tag-details' && !!activeTag && !isSelectable) {
      return [activeTag.key];
    }
    return selectedTagKeys;
  }, [selectedTagKeys, actionState, activeTag, isSelectable]);

  const setSelectedTagKeys = useTagManagerContext()?.setSelectedTagKeys;

  const handleOnTagClick = useCallback(
    (t: Tag) => {
      if (isSelectable) {
        setSelectedTagKeys?.((ks) =>
          !ks.includes(t.key)
            ? ks.concat([t.key])
            : ks.filter((k) => k !== t.key),
        );
        return;
      }
      if (activeTag?.key === t.key) {
        setActionState?.('intro');
        setActiveTagKey?.(undefined);
        return;
      }
      setActionState?.('show-tag-details');
      setActiveTagKey?.(t.key);
    },
    [isSelectable, activeTag],
  );

  return (
    <SplitFullPageContent>
      <SplitHeader />
      <TagsWell>
        <TagsContainer>
          {!!customTags && (
            <TabGroup
              onTagClick={handleOnTagClick}
              title={'Automatic tags'}
              tags={customTags}
              selectedTagKeys={selectedTagKeysForUI}
            />
          )}
          {!!eventMatchTags && (
            <TabGroup
              onTagClick={handleOnTagClick}
              isTagAddable={roles?.historian}
              title={'Event match tags'}
              tags={eventMatchTags}
              onAddClick={() => setActionState?.('create-event-match-tag')}
              selectedTagKeys={selectedTagKeysForUI}
            />
          )}
          {!!contractInteractionTags && (
            <TabGroup
              onTagClick={handleOnTagClick}
              isTagAddable={roles?.historian}
              title={'Known Contracts tags'}
              tags={contractInteractionTags}
              onAddClick={() =>
                setActionState?.('create-contract-interaction-tag')
              }
              selectedTagKeys={selectedTagKeysForUI}
            />
          )}
          {!!tagGroupTags && !isSelectable && (
            <TabGroup
              onTagClick={handleOnTagClick}
              isTagAddable={roles?.historian}
              title={'Tag groups'}
              tags={tagGroupTags}
              onAddClick={() => setActionState?.('create-tag-group-tag')}
              selectedTagKeys={selectedTagKeysForUI}
            />
          )}
        </TagsContainer>
      </TagsWell>
      <ActionState />
    </SplitFullPageContent>
  );
};
