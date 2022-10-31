import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { utils } from 'ethers';
import firebase from 'firebase';
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';
import { fb } from '../../../clients/firebase-app';
import { usePriorityAccount } from '../../../connectors/priority';
import { WHAT_ARE_TOPICS } from '../../../constants';
import {
  useAllTagsByContext,
  useSetActiveTagKeyByContext,
  useSetTagManagerActionStateByContext,
  useTagManagerActionStateByContext,
  useTagManagerContext,
} from '../../../contexts/tagsManager';
import { useENSLookup, useResolveToEnsLookup } from '../../../hooks/useENS';
import {
  ContractInteractionTagMetadata,
  EventMatchTagMetadata,
  Tag,
  TagGroupTagMetadata,
  TagMetadata,
  TAG_DESCRIPTION_CHAR_LIMIT,
  TAG_KEY_CHAR_LIMIT,
} from '../../../types/tag';
import { shortenHexString } from '../../../utils/hex';
import { ADDRESS_REGEX, TOPIC_HASH_REGEX } from '../../../utils/regex';
import {
  ActionDescription,
  ActionFullContentActionContainer,
  ActionFullContentCenterContainer,
  ActionFullContentContainer,
} from '../../actions/common';
import { BaseAnchor } from '../../anchor';
import {
  PanelLineSeparator,
  PrimaryRowActionButton,
  SecondaryRowActionButton,
} from '../../art/panels/panel';
import { BaseButton, PrimaryButton } from '../../button';
import { Flex, FlexCenter, FlexEnds } from '../../flex';
import { CloseIcon } from '../../icons/close';
import { LargeRightArrow } from '../../icons/largeArrow';
import {
  FormContainer,
  FormGroupContainer,
  FormLabel,
  TextInput,
  TextInputContainer,
  TitleInput,
} from '../../input';
import { Tags } from '../../tag';
import { AddressPill } from '../../web3Status';
import { TagGroupContainer, WrappedTag } from '../tagGroup';

const AddressRowContainer = styled(FlexEnds)``;

const AddressesContainer = styled.div`
  padding: 10px 20px 0 10px;
  > ${AddressRowContainer} + ${AddressRowContainer} {
    margin-top: 10px;
  }
`;

export const EmptyMetadataContainer = styled(FlexCenter)`
  opacity: 0.25;
  font-size: 14px;
  height: 80px;
`;

const EnterButton = styled(PrimaryButton)`
  height: 50px;
  padding: 0;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  > svg {
    width: 18px;
    height: 18px;
    fill: white;
  }
  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CloseButton = styled(BaseButton)`
  > svg {
    width: 14px;
    height: 14px;
    opacity: 0.5;
  }
  :hover {
    > svg {
      opacity: 1;
    }
  }
`;

const AddressRow: FC<{ children: string; onDelete?: () => void }> = ({
  children,
  onDelete,
}) => {
  const ens = useENSLookup(children);
  return (
    <AddressRowContainer>
      <Flex>
        <ActionDescription style={{ fontSize: 14 }}>
          <strong>{ens ?? children}</strong>
        </ActionDescription>
        {!!ens && (
          <AddressPill style={{ marginLeft: 8 }}>
            {shortenHexString(children)}
          </AddressPill>
        )}
      </Flex>
      {!!onDelete && (
        <CloseButton onClick={onDelete}>
          <CloseIcon />
        </CloseButton>
      )}
    </AddressRowContainer>
  );
};

export const AddTopics: FC<{
  topics: string[];
  setTopics: Dispatch<SetStateAction<string[]>>;
  isEditing?: boolean;
}> = ({ isEditing, topics, setTopics }) => {
  const [currentTopic, setCurrentTopic] = useState('');

  const isCurrentTopicGood = useMemo(() => {
    return TOPIC_HASH_REGEX.test(currentTopic) && currentTopic.length !== 0;
  }, [currentTopic]);

  const addTopic = useCallback(() => {
    if (isCurrentTopicGood) {
      setTopics((s) => s.concat([currentTopic]));
      setCurrentTopic('');
    }
  }, [isCurrentTopicGood, currentTopic, setCurrentTopic, setTopics]);

  return (
    <>
      {' '}
      <FormContainer>
        <FlexEnds>
          <FormLabel>Topics</FormLabel>
          <FormLabel>{topics.length}</FormLabel>
        </FlexEnds>
        {topics.length !== 0 ? (
          <AddressesContainer>
            {topics.map((a, i) => {
              return (
                <AddressRow
                  onDelete={
                    isEditing
                      ? () =>
                          setTopics((topics) =>
                            topics.filter((topic) => topic !== a),
                          )
                      : undefined
                  }
                >
                  {`${i}: ${a}`}
                </AddressRow>
              );
            })}
          </AddressesContainer>
        ) : (
          <EmptyMetadataContainer>No topics added.</EmptyMetadataContainer>
        )}
      </FormContainer>
      {isEditing && topics.length < 4 && (
        <FormContainer>
          <Flex>
            <TextInputContainer style={{ flexGrow: 1 }}>
              <TextInput
                value={currentTopic}
                onChange={(e) => setCurrentTopic(e.target.value)}
                placeholder={'Add topic hex string'}
              />
            </TextInputContainer>
            <EnterButton
              disabled={!isCurrentTopicGood}
              onClick={addTopic}
              style={{ marginLeft: 8 }}
            >
              <LargeRightArrow />
            </EnterButton>
          </Flex>
          <FlexEnds style={{ marginTop: 10 }}>
            {isCurrentTopicGood ? (
              <FormLabel>Valid topic</FormLabel>
            ) : (
              <FormLabel></FormLabel>
            )}
            <FormLabel>
              <BaseAnchor
                style={{ textDecoration: 'underline' }}
                href={WHAT_ARE_TOPICS}
                target={'_blank'}
              >
                Wtf is a topic?
              </BaseAnchor>
            </FormLabel>
            {/* {isCurrentAddressGood && (
              <FormLabel>
                Resolves to:{' '}
                {shortenHexString(resolvedAddress ?? currentAddress)}
              </FormLabel>
            )} */}
          </FlexEnds>
        </FormContainer>
      )}
    </>
  );
};

export const AddAddresses: FC<{
  addresses: string[];
  setAddresses: Dispatch<SetStateAction<string[]>>;
  isEditing?: boolean;
}> = ({ isEditing, addresses, setAddresses }) => {
  const [currentAddress, setCurrentAddress] = useState('');

  const resolvedAddress = useResolveToEnsLookup(currentAddress);

  const isCurrentAddressGood = useMemo(() => {
    if (currentAddress.endsWith('.eth') && !resolvedAddress) {
      return false;
    }
    if (!!resolvedAddress) {
      return !addresses.includes(resolvedAddress);
    }
    return (
      ADDRESS_REGEX.test(currentAddress) &&
      currentAddress.length !== 0 &&
      !addresses.includes(currentAddress)
    );
  }, [currentAddress, resolvedAddress]);

  const addAddress = useCallback(() => {
    if (isCurrentAddressGood) {
      const addr = utils.getAddress(resolvedAddress ?? currentAddress);
      setAddresses((s) => s.concat([addr]));
      setCurrentAddress('');
    }
  }, [
    resolvedAddress,
    isCurrentAddressGood,
    currentAddress,
    setCurrentAddress,
    setAddresses,
  ]);

  return (
    <>
      {' '}
      <FormContainer>
        <FlexEnds>
          <FormLabel>Addresses</FormLabel>
          <FormLabel>{addresses.length}</FormLabel>
        </FlexEnds>
        {addresses.length !== 0 ? (
          <AddressesContainer>
            {addresses.map((a) => {
              return (
                <AddressRow
                  onDelete={
                    isEditing
                      ? () =>
                          setAddresses((addrs) =>
                            addrs.filter((addr) => addr !== a),
                          )
                      : undefined
                  }
                >
                  {a}
                </AddressRow>
              );
            })}
          </AddressesContainer>
        ) : (
          <EmptyMetadataContainer>No addresses added.</EmptyMetadataContainer>
        )}
      </FormContainer>
      {isEditing && (
        <FormContainer>
          <Flex>
            <TextInputContainer style={{ flexGrow: 1 }}>
              <TextInput
                value={currentAddress}
                onChange={(e) => setCurrentAddress(e.target.value)}
                placeholder={'Add address or ens name'}
              />
            </TextInputContainer>
            <EnterButton
              disabled={!isCurrentAddressGood}
              onClick={addAddress}
              style={{ marginLeft: 8 }}
            >
              <LargeRightArrow />
            </EnterButton>
          </Flex>
          <FlexEnds style={{ marginTop: 10 }}>
            {isCurrentAddressGood ? (
              <FormLabel>Valid address</FormLabel>
            ) : (
              <FormLabel></FormLabel>
            )}
            {isCurrentAddressGood && (
              <FormLabel>
                Resolves to:{' '}
                {shortenHexString(resolvedAddress ?? currentAddress)}
              </FormLabel>
            )}
          </FlexEnds>
        </FormContainer>
      )}
    </>
  );
};

const StyledWrappedTag = styled(WrappedTag)`
  padding: 0 8px 0 16px;
  > svg {
    margin-left: 8px;
    width: 14px;
    height: 14px;
  }
`;

export const AddTabGroup: FC<{
  tagKeys?: string[];
  isEditing?: boolean;
  onTagClick: (tagKey: string) => void;
}> = ({ onTagClick, tagKeys, isEditing }) => {
  return (
    <TagGroupContainer>
      <Tags>
        {tagKeys?.map((key: string) => {
          if (isEditing) {
            return (
              <StyledWrappedTag
                onClick={isEditing ? () => onTagClick(key) : undefined}
                isSelected={true}
                key={`tag-${key}`}
              >
                {key}
                <CloseIcon />
              </StyledWrappedTag>
            );
          }
          return (
            <WrappedTag isSelected={true} key={`tag-${key}`}>
              {key}
            </WrappedTag>
          );
        })}
      </Tags>
    </TagGroupContainer>
  );
};

export const CreateEventMatchMetadata: FC<{
  isEditing?: boolean;
  onMetadata: (t: EventMatchTagMetadata | undefined) => void;
}> = ({ isEditing, onMetadata }) => {
  const [topics, setTopics] = useState<string[]>([]);
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

export const CreateContractInteractionTagMetadata: FC<{
  isEditing?: boolean;
  onMetadata: (t: ContractInteractionTagMetadata | undefined) => void;
}> = ({ isEditing, onMetadata }) => {
  const [addresses, setAddresses] = useState<string[]>([]);
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

export const CreateTabGroupTagMetadata: FC<{
  isEditing?: boolean;
  onMetadata: (t: TagGroupTagMetadata | undefined) => void;
}> = ({ isEditing, onMetadata }) => {
  const selectedTagKeys = useTagManagerContext()?.selectedTagKeys;
  const setSelectedTagKeys = useTagManagerContext()?.setSelectedTagKeys;
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
        <FormLabel>
          Selected Tags (only automatic + known contracts tags can be added)
        </FormLabel>
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

export const CreateTag: FC = () => {
  const tags = useAllTagsByContext();
  const account = usePriorityAccount();
  const [tagName, setTagName] = useState('');
  const [description, setDescription] = useState('');
  const setActiveTagkey = useSetActiveTagKeyByContext();
  const setActionState = useSetTagManagerActionStateByContext();
  const [metadata, setMetadata] = useState<TagMetadata | undefined>(undefined);

  const handleTagNameChange = useCallback((e: any) => {
    const cutDownedValue = e.target.value.slice(
      0,
      TAG_KEY_CHAR_LIMIT,
    ) as string;
    setTagName(
      cutDownedValue.replace(' ', '').replace('\\', '').replace('/', ''),
    );
  }, []);

  const handleDescriptionChange = useCallback((e: any) => {
    const cutDownedValue = e.target.value.slice(
      0,
      TAG_DESCRIPTION_CHAR_LIMIT,
    ) as string;
    setDescription(cutDownedValue);
  }, []);

  const isTagAlreadyCreated = useMemo(
    () => tags?.map((t) => t.key.toLowerCase())?.includes(tagName),
    [tagName, tags],
  );

  const isValidTag = useMemo(
    () =>
      !isTagAlreadyCreated &&
      description !== '' &&
      tagName !== '' &&
      !!metadata,
    [isTagAlreadyCreated, description, tagName, metadata],
  );

  const createTag = useCallback(async () => {
    if (!account || !metadata) {
      return;
    }

    const tag: Tag = {
      key: tagName,
      description,
      creator: account,
      metadata,
    };

    await fb
      .firestore()
      .collection(FIRESTORE_ROUTES.TAGS)
      .doc(tagName)
      .set({
        ...tag,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    setActiveTagkey?.(tag.key);
    setActionState?.('show-tag-details');
  }, [description, tagName, metadata, setActionState]);

  const actionState = useTagManagerActionStateByContext();

  return (
    <ActionFullContentContainer>
      <ActionFullContentCenterContainer style={{ paddingTop: 64 }}>
        <FormGroupContainer>
          <FormContainer>
            <FlexEnds>
              <FormLabel>
                Create{' '}
                {(() => {
                  if (actionState === 'create-contract-interaction-tag') {
                    return 'Known contract tag';
                  }
                  if (actionState === 'create-tag-group-tag') {
                    return 'Tab group tag';
                  }
                  if (actionState === 'create-event-match-tag') {
                    return 'Event match tag';
                  }
                  return '';
                })()}
              </FormLabel>
            </FlexEnds>
            <TitleInput
              value={tagName}
              onChange={handleTagNameChange}
              placeholder={'New tag name...'}
            />
          </FormContainer>
          <FormContainer>
            <FlexEnds>
              <FormLabel>Description</FormLabel>
              <FormLabel>{TAG_DESCRIPTION_CHAR_LIMIT} char limit</FormLabel>
            </FlexEnds>
            <TextInputContainer>
              <TextInput
                value={description}
                onChange={handleDescriptionChange}
                placeholder={'Describe when this tag should be given to a hash'}
              />
            </TextInputContainer>
          </FormContainer>
          <PanelLineSeparator />
          {actionState === 'create-contract-interaction-tag' && (
            <CreateContractInteractionTagMetadata
              isEditing={true}
              onMetadata={setMetadata}
            />
          )}
          {actionState === 'create-tag-group-tag' && (
            <CreateTabGroupTagMetadata
              isEditing={true}
              onMetadata={setMetadata}
            />
          )}
          {actionState === 'create-event-match-tag' && (
            <CreateEventMatchMetadata
              isEditing={true}
              onMetadata={setMetadata}
            />
          )}
        </FormGroupContainer>
      </ActionFullContentCenterContainer>
      <ActionFullContentActionContainer>
        <PrimaryRowActionButton
          onClick={() => createTag()}
          disabled={!isValidTag}
        >
          {isTagAlreadyCreated ? 'Tag already created' : 'Create tag'}
        </PrimaryRowActionButton>
        <SecondaryRowActionButton
          style={{ marginTop: 20 }}
          onClick={() => setActionState?.('intro')}
        >
          Dismiss
        </SecondaryRowActionButton>
      </ActionFullContentActionContainer>
    </ActionFullContentContainer>
  );
};
