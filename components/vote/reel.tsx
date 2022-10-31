import { FC } from 'react';
import styled from 'styled-components';
import { UserAvatar } from '../avatar';
import { Flex } from '../flex';
import { AddressPill } from '../web3Status';

const VoterReelContainer = styled(Flex)`
  padding-right: 10px;
`;

const UserAvatarContainer = styled.div`
  width: 18px;
  height: 28px;
  position: relative;
  > * {
    top: 0;
    bottom: 0;
    left: 0;
    position: absolute;
  }
`;

const NumLeft = styled(AddressPill)`
  border: 1px solid #e1e1e1;
  z-index: 1;
  padding: 2px 8px;
`;

export const VoterReel: FC<{ users: string[] }> = ({ users }) => {
  return (
    <VoterReelContainer>
      {users.slice(0, 3).map((u) => (
        <UserAvatarContainer key={`voter-user-avatar-${u}`}>
          <UserAvatar user={u} />
        </UserAvatarContainer>
      ))}
      {users.slice(3).length !== 0 && (
        <NumLeft>+{users.slice(3).length}</NumLeft>
      )}
    </VoterReelContainer>
  );
};
