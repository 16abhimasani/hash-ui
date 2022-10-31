import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import isEqual from 'lodash/isEqual';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { fb } from '../../../clients/firebase-app';
import { usePriorityAccount } from '../../../connectors/priority';
import {
  useActiveTagByContext,
  useSetTagManagerActionStateByContext,
  useTagManagerContext,
} from '../../../contexts/tagsManager';
import { useUser } from '../../../hooks/useUser';
import {
  ContractInteractionTagMetadata,
  EventMatchTagMetadata,
  TagGroupTagMetadata,
  TagMetadata,
} from '../../../types/tag';
import {
  ActionDescription,
  ActionFullContentActionContainer,
  ActionFullContentCenterContainer,
  ActionFullContentContainer,
  ActionLargeTitle,
} from '../../actions/common';
import {
  ActionDropdown,
  DropdownAction,
  DropdownActionDescription,
  DropdownActionsListContainer,
} from '../../actionsDropdown';
import {
  PanelLineSeparator,
  PrimaryRowActionButton,
  SecondaryRowActionButton,
} from '../../art/panels/panel';
import { UserAvatar } from '../../avatar';
import { Flex, FlexEnds } from '../../flex';
import { FormContainer, FormGroupContainer, FormLabel } from '../../input';
import {
  AddAddresses,
  AddTabGroup,
  AddTopics,
  EmptyMetadataContainer,
} from './create';

const auth = fb.auth();

const manageButton = (onClick: () => void) => (
  <SecondaryRowActionButton onClick={onClick}>
    {'Manage'}
  </SecondaryRowActionButton>
);

const EventMatchTagMetadataDetails: FC<{
  isEditing?: boolean;
  onMetadata: (t: EventMatchTagMetadata | undefined) => void;
  topics: string[];
}> = ({ isEditing, onMetadata, topics }) => {
  if (!isEditing && !!topics) {
    return <AddTopics isEditing={false} topics={topics} setTopics={() => {}} />;
  }

  return (
    <EditEventMatchTagMetadataDetails
      isEditing={true}
      onMetadata={onMetadata}
      topics={topics}
    />
  );
};

const EditEventMatchTagMetadataDetails: FC<{
  isEditing?: boolean;
  onMetadata: (t: EventMatchTagMetadata | undefined) => void;
  topics?: string[];
}> = ({ isEditing, onMetadata, topics: topicsFromProps }) => {
  const [topics, setTopics] = useState<string[]>([]);
  useEffect(() => {
    if (!!topicsFromProps) {
      setTopics(topicsFromProps);
    }
  }, [topicsFromProps]);
  useEffect(() => {
    if (topics.length === 0) {
      onMetadata(undefined);
      return;
    }
    onMetadata({
      type: 'event-match-tag',
      topics,
    });
  }, [topics]);
  return (
    <AddTopics isEditing={isEditing} topics={topics} setTopics={setTopics} />
  );
};

const ContractInteractionTagMetadataDetails: FC<{
  isEditing?: boolean;
  onMetadata: (t: ContractInteractionTagMetadata | undefined) => void;
  contractAddresses: string[];
}> = ({ isEditing, onMetadata, contractAddresses }) => {
  if (!isEditing && !!contractAddresses) {
    return (
      <AddAddresses
        isEditing={false}
        addresses={contractAddresses}
        setAddresses={() => {}}
      />
    );
  }

  return (
    <EditContractInteractionTagMetadataDetails
      isEditing={true}
      onMetadata={onMetadata}
      contractAddresses={contractAddresses}
    />
  );
};

const EditContractInteractionTagMetadataDetails: FC<{
  isEditing?: boolean;
  onMetadata: (t: ContractInteractionTagMetadata | undefined) => void;
  contractAddresses?: string[];
}> = ({ isEditing, onMetadata, contractAddresses }) => {
  const [addresses, setAddresses] = useState<string[]>([]);
  useEffect(() => {
    if (!!contractAddresses) {
      setAddresses(contractAddresses);
    }
  }, [contractAddresses]);
  useEffect(() => {
    if (addresses.length === 0) {
      onMetadata(undefined);
      return;
    }
    onMetadata({
      type: 'contract-interaction-tag',
      contractAddresses: addresses,
    });
  }, [addresses]);
  return (
    <AddAddresses
      isEditing={isEditing}
      addresses={addresses}
      setAddresses={setAddresses}
    />
  );
};

const TabGroupTagMetadataDetails: FC<{
  isEditing?: boolean;
  onMetadata: (t: TagGroupTagMetadata | undefined) => void;
  selectedTagKeys: string[];
}> = ({ isEditing, onMetadata, selectedTagKeys }) => {
  if (isEditing) {
    return (
      <EditTabGroupTagMetadataDetails
        selectedTagKeys={selectedTagKeys}
        isEditing={true}
        onMetadata={onMetadata}
      />
    );
  }

  return (
    <FormContainer>
      <FlexEnds>
        <FormLabel>Selected Tags</FormLabel>
        <FormLabel>{selectedTagKeys.length ?? 0}</FormLabel>
      </FlexEnds>
      {selectedTagKeys.length === 0 && (
        <EmptyMetadataContainer>No tags added yet.</EmptyMetadataContainer>
      )}
      {selectedTagKeys.length !== 0 && (
        <AddTabGroup
          isEditing={false}
          onTagClick={() => {}}
          tagKeys={selectedTagKeys}
        />
      )}
    </FormContainer>
  );
};

const EditTabGroupTagMetadataDetails: FC<{
  isEditing?: boolean;
  onMetadata: (t: TagGroupTagMetadata | undefined) => void;
  selectedTagKeys: string[];
}> = ({ isEditing, onMetadata, selectedTagKeys: selectedTagKeysFromProps }) => {
  const selectedTagKeys = useTagManagerContext()?.selectedTagKeys;
  const setSelectedTagKeys = useTagManagerContext()?.setSelectedTagKeys;
  useEffect(() => {
    if (!!selectedTagKeysFromProps) {
      setSelectedTagKeys?.(selectedTagKeysFromProps);
    }
    return () => setSelectedTagKeys?.([]);
  }, [selectedTagKeysFromProps]);
  useEffect(() => {
    if (!selectedTagKeys || selectedTagKeys?.length === 0) {
      onMetadata(undefined);
      return;
    }
    onMetadata({
      type: 'tag-group-tag',
      keys: selectedTagKeys,
    });
  }, [selectedTagKeys]);

  const handleOnTagClick = useCallback((key: string) => {
    setSelectedTagKeys?.((ks) => ks.filter((k) => k !== key));
  }, []);

  return (
    <FormContainer>
      <FlexEnds>
        <FormLabel>Selected Tags</FormLabel>
        <FormLabel>{selectedTagKeys?.length ?? 0}</FormLabel>
      </FlexEnds>
      {selectedTagKeys?.length === 0 && (
        <EmptyMetadataContainer>Select tags on the left</EmptyMetadataContainer>
      )}
      {selectedTagKeys?.length !== 0 && (
        <AddTabGroup
          isEditing={isEditing}
          onTagClick={handleOnTagClick}
          tagKeys={selectedTagKeys}
        />
      )}
    </FormContainer>
  );
};

const NotCustomTagDetails: FC = () => {
  const tag = useActiveTagByContext();
  const setActionState = useSetTagManagerActionStateByContext();
  const account = usePriorityAccount();
  const userMetadata = useUser(tag?.creator);

  const handleDelete = useCallback(async () => {
    if (!tag) {
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${tag.key}?`)) {
      return;
    }
    setActionState?.('intro');
    await fb
      .firestore()
      .collection(FIRESTORE_ROUTES.TAGS)
      .doc(tag.key)
      .delete();
  }, [tag]);

  const [metadata, setMetadata] = useState<TagMetadata | undefined>(undefined);

  // HACK: this is done to rerender the setting components
  const activeTagMetadata = useMemo(() => {
    return tag?.metadata;
  }, [metadata, tag]);

  const isEditing = useTagManagerContext()?.isEditing;
  const setIsEditing = useTagManagerContext()?.setIsEditing;

  const [currentUser] = useAuthState(auth);
  const { roles } = useUser(currentUser?.uid) ?? {};

  const hasMadeChanges = useMemo(() => {
    return !!metadata && !isEqual(tag?.metadata, metadata);
  }, [metadata, tag]);

  const updateTag = useCallback(async () => {
    if (!account || !tag) {
      return;
    }

    await fb.firestore().collection(FIRESTORE_ROUTES.TAGS).doc(tag.key).update({
      metadata: metadata,
    });
    setIsEditing?.(false);
  }, [metadata, tag]);

  return (
    <ActionFullContentContainer>
      <ActionFullContentCenterContainer style={{ paddingTop: 64 }}>
        <FormLabel>
          {(() => {
            if (tag?.metadata.type === 'contract-interaction-tag') {
              return 'Known contract tag';
            }
            if (tag?.metadata.type === 'tag-group-tag') {
              return 'Tab group';
            }
            return '';
          })()}
        </FormLabel>
        <ActionLargeTitle style={{ marginTop: 8 }}>{tag?.key}</ActionLargeTitle>
        <FormLabel style={{ marginTop: 20 }}>Description</FormLabel>
        <ActionDescription style={{ marginTop: 8 }}>
          {tag?.description}
        </ActionDescription>

        <PanelLineSeparator />
        <Flex>
          <div>
            <FormLabel style={{ marginBottom: 8 }}>Creator</FormLabel>
            <Flex>
              <UserAvatar user={tag?.creator} />
              <ActionDescription style={{ marginLeft: 8 }}>
                <strong>{userMetadata?.bestName}</strong>
              </ActionDescription>
            </Flex>
          </div>
        </Flex>
        <PanelLineSeparator />
        <FormGroupContainer>
          {activeTagMetadata?.type === 'contract-interaction-tag' &&
            !!activeTagMetadata?.contractAddresses && (
              <ContractInteractionTagMetadataDetails
                contractAddresses={activeTagMetadata.contractAddresses}
                isEditing={isEditing}
                onMetadata={setMetadata}
              />
            )}
          {activeTagMetadata?.type === 'tag-group-tag' &&
            !!activeTagMetadata?.keys && (
              <TabGroupTagMetadataDetails
                selectedTagKeys={activeTagMetadata.keys}
                isEditing={isEditing}
                onMetadata={setMetadata}
              />
            )}
          {activeTagMetadata?.type === 'event-match-tag' &&
            !!activeTagMetadata?.topics && (
              <EventMatchTagMetadataDetails
                topics={activeTagMetadata.topics}
                isEditing={isEditing}
                onMetadata={setMetadata}
              />
            )}
        </FormGroupContainer>
      </ActionFullContentCenterContainer>
      <ActionFullContentActionContainer>
        {isEditing && (
          <>
            <PrimaryRowActionButton
              disabled={!hasMadeChanges}
              onClick={updateTag}
            >
              Save changes
            </PrimaryRowActionButton>
            <SecondaryRowActionButton
              onClick={() => {
                setIsEditing?.(false);
                setMetadata(undefined);
              }}
              style={{ marginTop: 20 }}
            >
              Discard changes
            </SecondaryRowActionButton>
          </>
        )}
        {!isEditing && roles?.historian && (
          <ActionDropdown enable={true} button={manageButton} isToTop={true}>
            {(onClick: () => void, isOpen?: boolean) => (
              <DropdownActionsListContainer>
                <DropdownAction
                  title={'Delete Tag'}
                  onClick={() => {
                    handleDelete();
                    onClick();
                  }}
                >
                  <DropdownActionDescription>
                    Remove this tag from the HASH experience.
                  </DropdownActionDescription>
                </DropdownAction>
                <DropdownAction
                  onClick={() => {
                    setIsEditing?.(true);
                    onClick();
                  }}
                  title={'Edit'}
                >
                  <DropdownActionDescription>
                    Modify the settings of the tag. <strong>NOTE: </strong>{' '}
                    altering any tags should be done carefully.
                  </DropdownActionDescription>
                </DropdownAction>
              </DropdownActionsListContainer>
            )}
          </ActionDropdown>
        )}
      </ActionFullContentActionContainer>
    </ActionFullContentContainer>
  );
};

const CustomTagDetails: FC = () => {
  const tag = useActiveTagByContext();
  const userMetadata = useUser(tag?.creator);
  return (
    <ActionFullContentContainer>
      <ActionFullContentCenterContainer style={{ paddingTop: 64 }}>
        <FormLabel>Automatic tag</FormLabel>
        <ActionLargeTitle style={{ marginTop: 8 }}>{tag?.key}</ActionLargeTitle>
        <FormLabel style={{ marginTop: 20 }}>Description</FormLabel>
        <ActionDescription style={{ marginTop: 8 }}>
          {tag?.description}
        </ActionDescription>

        <PanelLineSeparator />
        <Flex>
          <div>
            <FormLabel style={{ marginBottom: 8 }}>Creator</FormLabel>
            <Flex>
              <UserAvatar user={tag?.creator} />
              <ActionDescription style={{ marginLeft: 8 }}>
                <strong>{userMetadata?.bestName}</strong>
              </ActionDescription>
            </Flex>
          </div>
        </Flex>
      </ActionFullContentCenterContainer>
      <ActionFullContentActionContainer>
        <ActionDescription style={{ textAlign: 'center', opacity: 0.25 }}>
          Automatic tags are created and managed by POB studios.
        </ActionDescription>
      </ActionFullContentActionContainer>
    </ActionFullContentContainer>
  );
};
export const TagDetails: FC = () => {
  const tag = useActiveTagByContext();

  if (tag?.metadata.type === 'custom-tag') {
    return <CustomTagDetails />;
  }

  return <NotCustomTagDetails />;
};
