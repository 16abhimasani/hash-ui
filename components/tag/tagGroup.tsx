import { FC } from 'react';
import styled from 'styled-components';
import { Tag } from '../../types/tag';
import { FlexEnds } from '../flex';
import { AddIcon } from '../icons/add';
import { Tag as TagJsx, Tags } from '../tag';

export const TagGroupContainer = styled.div`
  padding: 0;
`;

export const TagsContainer = styled.div`
  padding: 64px 24px;
  ${TagGroupContainer}:not(:first-child) {
    margin-top: 48px;
  }
`;

export const WrappedTag = styled(TagJsx)<{ isSelected?: boolean }>`
  margin-top: 10px;
  background-color: white;
  color: ${(p) => (p.isSelected ? 'black' : 'rgba(17, 10, 10, 0.5)')};
  border-color: ${(p) => (p.isSelected ? 'black' : 'rgba(17, 10, 10, 0.2)')};
  :hover {
    color: black;
    border-color: black;
  }
`;

export const TabGroupLabel = styled.p`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.25);
  text-transform: uppercase;
  padding: 0;
  margin: 0;
`;

const AddTagButton = styled(WrappedTag)`
  width: 34px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  > svg {
    height: 14px;
    width: 14px;
    opacity: 0.5;
  }
  :hover {
    > svg {
      opacity: 1;
    }
  }
`;

export const TabGroup: FC<{
  title: string;
  tags: Tag[];
  isTagAddable?: boolean;
  onAddClick?: () => void;
  onTagClick: (tag: Tag) => void;
  selectedTagKeys?: string[];
}> = ({
  onTagClick,
  title,
  tags,
  onAddClick,
  isTagAddable,
  selectedTagKeys,
}) => {
  return (
    <TagGroupContainer>
      <FlexEnds style={{}}>
        <TabGroupLabel>{title}</TabGroupLabel>
      </FlexEnds>
      <Tags>
        {tags.map((tag: Tag) => {
          return (
            <WrappedTag
              isSelected={selectedTagKeys?.includes(tag.key)}
              key={`tag-${tag.key}`}
              onClick={() => onTagClick(tag)}
            >
              {tag.key}
            </WrappedTag>
          );
        })}
        {isTagAddable && (
          <AddTagButton onClick={onAddClick}>
            <AddIcon />
          </AddTagButton>
        )}
      </Tags>
    </TagGroupContainer>
  );
};
