import Link from 'next/link';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useCopyToClipboard } from 'react-use';
import styled from 'styled-components';
import { useUser } from '../../../hooks/useUser';
import { capitalizeFirstLetter } from '../../../utils/string';
import { CleanAnchor } from '../../anchor';
import { UserAvatar } from '../../avatar';
import {
  HeaderBreadcrumb,
  HeaderContainer,
  HeaderTitle,
  LargePill,
  LightLargePill,
  PillWrapper,
} from './common';

export const UserHeader: FC<{ account: string }> = ({ account }) => {
  const { bestName, bestUserLink, shortenedAddress, roles } =
    useUser(account) ?? {};
  const bestRoles = useMemo(() => {
    if (!roles) {
      return undefined;
    }
    const final: string[] = [];
    if (roles['organizer']) {
      final.push('organizer');
    } else if (roles['historian']) {
      final.push('archeologist');
    } else if (roles['hunter']) {
      final.push('hunter');
    }
    return final;
  }, [roles]);
  return (
    <HeaderContainer>
      <HeaderBreadcrumb>user</HeaderBreadcrumb>
      <HeaderBreadcrumb>/</HeaderBreadcrumb>
      <UserContent>
        <Link href={bestUserLink ?? ''} passHref>
          <CleanAnchor target="_blank" rel="noopener noreferrer">
            <HeaderTitle>{bestName}</HeaderTitle>
          </CleanAnchor>
        </Link>
        <UserAvatar size={36} user={account} />
        <PillWrapper>
          <AddressPill displayText={shortenedAddress} textToCopy={account} />
          {bestRoles && (
            <>
              <LightLargePill>HistoriansDAO</LightLargePill>
              {bestRoles.map((role: string) => (
                <LightLargePill key={`user-header-${role}-pill`}>
                  {capitalizeFirstLetter(role)}
                </LightLargePill>
              ))}
            </>
          )}
        </PillWrapper>
      </UserContent>
    </HeaderContainer>
  );
};

const AddressPill: FC<{
  displayText: string | undefined;
  textToCopy: string | undefined;
}> = ({ displayText, textToCopy }) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const [copied, setCopied] = useState<boolean>(false);
  useEffect(() => {
    let clearToken: number | undefined = undefined;
    if (copied) {
      clearToken = window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
    return () => {
      clearTimeout(clearToken);
    };
  }, [copied]);
  return (
    <LargePill
      onClick={() => {
        copyToClipboard(textToCopy ?? '');
        setCopied(true);
      }}
      key={`address-pill-${displayText}`}
      style={{ cursor: 'pointer' }}
    >
      {copied ? 'Copied!' : displayText}
    </LargePill>
  );
};

const UserContent = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: no-wrap;
  gap: 16px;
`;
