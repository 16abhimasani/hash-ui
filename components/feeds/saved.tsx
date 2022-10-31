import Link from 'next/link';
import { FC } from 'react';
import styled from 'styled-components';
import { ROUTES } from '../../constants/routes';
import { useHashByContext, useSaveByByContext } from '../../contexts/token';
import { useUser } from '../../hooks/useUser';
import { CleanAnchor } from '../anchor';
import { UserAvatar } from '../avatar';
import { RoundIconButton } from '../button';
import { Flex, FlexEnds } from '../flex';
import { ChevronRightIcon } from '../icons/chevron';
import { EmptyState } from '../state/empty';
import { AddressPill } from '../web3Status';

const SavedRowContainer = styled(FlexEnds)`
  padding: 24px 8px 24px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  cursor: pointer;
  user-select: none;
  &:hover {
    button {
      background: rgba(0, 0, 0, 0.05);
    }
  }
`;

const SavedRowTitle = styled.p`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 14px;
  padding: 0;
  margin: 0;
`;
const SavedRow: FC<{ user: string | null | undefined }> = ({ user }) => {
  const { bestName } = useUser(user) ?? {};
  return (
    <Link href={`${ROUTES.USER}/${user}?tab=saves`} passHref>
      <CleanAnchor>
        <SavedRowContainer>
          <Flex>
            <div>
              <UserAvatar user={user} />
            </div>
            <SavedRowTitle style={{ marginLeft: 16 }}>{bestName}</SavedRowTitle>
            {!!user && (
              <AddressPill style={{ marginLeft: 16 }}>
                {user.slice(0, 6)}
              </AddressPill>
            )}
          </Flex>
          <RoundIconButton>
            <ChevronRightIcon />
          </RoundIconButton>
        </SavedRowContainer>
      </CleanAnchor>
    </Link>
  );
};

export const SaveFeed: FC = () => {
  const hash = useHashByContext();
  const saveBy = useSaveByByContext();

  if (saveBy?.length === 0) {
    return (
      <EmptyState
        title="No saves yet"
        description="Lorem ipsum something then doo that."
      />
    );
  }

  return (
    <div>
      {saveBy?.map((a) => (
        <SavedRow user={a} key={`saved-row-${hash}-${a}`} />
      ))}
    </div>
  );
};
