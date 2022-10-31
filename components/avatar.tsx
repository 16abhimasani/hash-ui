import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useUser } from '../hooks/useUser';
import { zorbImageSVG } from '../utils/zorb';

const UnmemoizedUserAvatar: FC<{
  user: string | null | undefined;
  size?: number;
  rawImg?: boolean;
  className?: string;
}> = ({ className, user, size = 28, rawImg }) => {
  const zorbSvg = useMemo(
    () => (!!user ? zorbImageSVG(user) : undefined),
    [user],
  );

  const { profileImage } = useUser(user) ?? {};

  const patchedProfileImage = useMemo(() => {
    if (!profileImage) {
      return undefined;
    }
    return profileImage;
  }, [profileImage, size]);

  return (
    <Wrapper className={className} style={{ width: size, height: size }}>
      {(!!patchedProfileImage || !!zorbSvg) && (
        <RoundImage
          id="user-avatar"
          src={
            !!patchedProfileImage
              ? patchedProfileImage
              : !!zorbSvg
              ? `data:image/svg+xml;utf8,${encodeURIComponent(zorbSvg)}`
              : undefined
          }
          style={{ width: size, height: size }}
        />
      )}
    </Wrapper>
  );
};

export const UserAvatar = React.memo(UnmemoizedUserAvatar);

const RoundImage = styled.img`
  display: block;
`;

const Wrapper = styled.span`
  display: block;
  margin: 0;
  transform: none;
  background-color: #f8f8f8;
  border-radius: 999px;
  overflow: hidden;
`;
