import Link from 'next/link';
import { FC } from 'react';
import styled from 'styled-components';
import { ROUTES } from '../constants/routes';
import { useUser } from '../hooks/useUser';
import { PrimaryTextAnchor } from './anchor';
import { UserAvatar } from './avatar';
import { Text } from './text';

export const UserCellContainer = styled(Text)`
  display: block;
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  line-height: 13px;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.25);
  &:not(:first-child) {
    margin-left: 32px;
  }
  a {
    display: flex;
    align-items: center;
    font-size: 13px;
    margin-top: 8px;
    text-transform: none;
    img,
    svg {
      width: 20px;
      height: 20px;
    }
    span {
      margin-left: 0;
      margin-right: 5px;
      transform: none;
    }
  }
`;

export const UserCell: FC<{
  className?: string;
  label?: string;
  user: string | undefined | null;
}> = ({ label, user, className }) => {
  const userMetadata = useUser(user);

  return (
    <UserCellContainer className={className}>
      {label}{' '}
      <Link href={`${ROUTES.USER}/${user}`} passHref>
        <PrimaryTextAnchor>
          <UserAvatar user={user} />
          {userMetadata?.bestName}
        </PrimaryTextAnchor>
      </Link>
    </UserCellContainer>
  );
};
