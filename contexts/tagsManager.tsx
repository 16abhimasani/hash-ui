import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import findIndex from 'lodash/findIndex';
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { fb } from '../clients/firebase-app';
import { TagWithId } from '../types/tag';

export type ManageTagActionState =
  | 'intro'
  | 'learn-more'
  | 'create-contract-interaction-tag'
  | 'create-tag-group-tag'
  | 'create-event-match-tag'
  | 'show-tag-details';

export interface TagsManagerProviderContext {
  actionState: ManageTagActionState;
  setActionState?: Dispatch<SetStateAction<ManageTagActionState>>;
  setActiveTagKey?: Dispatch<SetStateAction<string | undefined>>;
  setIsEditing?: Dispatch<SetStateAction<boolean>>;
  tags?: TagWithId[];
  activeTag?: TagWithId;
  isTagsSelectable?: boolean;
  isEditing?: boolean;
  selectedTagKeys?: string[];
  setSelectedTagKeys?: Dispatch<SetStateAction<string[]>>;
}
export type TagsManagerProviderState = TagsManagerProviderContext;

const initialState: TagsManagerProviderState = {
  actionState: 'intro',
  setActionState: undefined,
  setActiveTagKey: undefined,
  setIsEditing: undefined,
  tags: undefined,
  activeTag: undefined,
  isTagsSelectable: undefined,
  isEditing: undefined,
  selectedTagKeys: undefined,
  setSelectedTagKeys: undefined,
};

const TagsManagerContext =
  createContext<TagsManagerProviderState>(initialState);

export const TagsManagerProvider: React.FC = ({ children }) => {
  const tagsRef = useMemo(() => {
    return fb.firestore().collection(FIRESTORE_ROUTES.TAGS);
  }, []);
  const [tags] = useCollectionData<TagWithId>(tagsRef, {
    idField: 'id',
  });

  const [actionState, setActionState] = useState<ManageTagActionState>('intro');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedTagKeys, setSelectedTagKeys] = useState<string[]>([]);
  const [activeTagKey, setActiveTagKey] = useState<string | undefined>(
    undefined,
  );

  const activeTag = useMemo(() => {
    if (!tags || !activeTagKey) return undefined;
    const tagIndex = findIndex(tags, (t) => t.key === activeTagKey);
    return tags[tagIndex];
  }, [tags, activeTagKey]);

  const isTagsSelectable = useMemo(
    () =>
      actionState === 'create-tag-group-tag' ||
      (actionState === 'show-tag-details' &&
        activeTag?.metadata.type === 'tag-group-tag' &&
        isEditing),
    [isEditing, actionState, activeTag],
  );

  const authStateObject = useMemo(() => {
    return {
      actionState,
      setActionState,
      tags,
      setActiveTagKey,
      activeTag,
      setIsEditing,
      isEditing,
      isTagsSelectable,
      selectedTagKeys: isTagsSelectable ? selectedTagKeys : [],
      setSelectedTagKeys,
    };
  }, [
    actionState,
    selectedTagKeys,
    activeTag,
    isEditing,
    tags,
    isTagsSelectable,
  ]);

  return (
    <TagsManagerContext.Provider value={authStateObject}>
      {children}
    </TagsManagerContext.Provider>
  );
};

export const useSelectedTagKeysByContext = () => {
  return useContext(TagsManagerContext)?.selectedTagKeys;
};

export const usIsTagsSelectableByContext = () => {
  return useContext(TagsManagerContext)?.isTagsSelectable;
};

export const useAllTagsByContext = () => {
  return useContext(TagsManagerContext)?.tags;
};

export const useActiveTagByContext = () => {
  return useContext(TagsManagerContext)?.activeTag;
};

export const useSetActiveTagKeyByContext = () => {
  return useContext(TagsManagerContext)?.setActiveTagKey;
};

export const useTagManagerContext = (): TagsManagerProviderState => {
  return useContext(TagsManagerContext);
};

export const useTagManagerActionStateByContext = () => {
  return useContext(TagsManagerContext)?.actionState;
};

export const useSetTagManagerActionStateByContext = () => {
  return useContext(TagsManagerContext)?.setActionState;
};
