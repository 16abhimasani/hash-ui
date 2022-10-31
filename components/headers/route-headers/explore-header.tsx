import React, { FC } from 'react';
import { HeaderBreadcrumb, HeaderContainer, HeaderTitle } from './common';

export const ExploreHeader: FC<{ title?: string }> = ({ title }) => {
  return (
    <HeaderContainer>
      <HeaderBreadcrumb>explore</HeaderBreadcrumb>
      <HeaderBreadcrumb>/</HeaderBreadcrumb>
      <HeaderTitle>{title ?? 'Activity'}</HeaderTitle>
    </HeaderContainer>
  );
};
