import { FC } from 'react';
import styled from 'styled-components';
import { useUser } from '../../../hooks/useUser';
import { ListWithId } from '../../../types/list';
import { PanelLineSeparator } from '../../art/panels/panel';
import { UserAvatar } from '../../avatar';
import { Flex } from '../../flex';
import { Text } from '../../text';

export const ListHeaderContainer = styled.div`
  padding: 56px;
  background-color: rgba(0, 0, 0, 0.025);
`;
export const ListHeaderPanelLineSeperator = styled(PanelLineSeparator)`
  margin: 40px 0 12px 0;
`;

export const HeaderTitle = styled.h1`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 32px;
  align-items: center;
  color: #6a6a6a;
  margin: 0;
`;

export const HeaderPrefixSpan = styled.span`
  opacity: 0.5;
`;

export const HeaderSlashSpan = styled.span`
  padding: 0 16px;
  opacity: 0.5;
`;

export const AuthorLabel = styled(Text)`
  margin-right: 8px;
  font-weight: bold;
  color: black;
`;

export const AuthorRow = styled(Flex)`
  > div + div {
    margin-left: 8px;
  }
`;

const Author: FC<{ address: string }> = ({ address }) => {
  const { bestName } = useUser(address) ?? {};
  return (
    <Flex>
      <AuthorLabel>{bestName}</AuthorLabel>
      <div>
        <UserAvatar size={20} user={address} />
      </div>
    </Flex>
  );
};

export const ListHeader: FC<Partial<ListWithId>> = ({
  id,
  title,
  description,
  authors,
}) => {
  return (
    <ListHeaderContainer>
      <HeaderTitle>
        <HeaderPrefixSpan>list</HeaderPrefixSpan>
        <HeaderSlashSpan>/</HeaderSlashSpan>
        {title ?? '-'}
      </HeaderTitle>
      <ListHeaderPanelLineSeperator />
      <AuthorRow>
        <Text style={{ fontWeight: 'bold', opacity: 0.35, marginRight: 8 }}>
          Created by
        </Text>
        {authors?.map((a) => (
          <Author address={a} key={`list-author-row-${id}-${a}`} />
        ))}
      </AuthorRow>
    </ListHeaderContainer>
  );
};
