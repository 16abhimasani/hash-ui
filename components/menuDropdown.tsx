import Link from 'next/link';
import React, { FC, useEffect, useRef, useState } from 'react';
import { animated, config, SpringConfig, useSpring } from 'react-spring';
import { useClickAway } from 'react-use';
import styled from 'styled-components';
import {
  DISCORD_LINK,
  OPENSEA_LINK_V3,
  SHOP_PROD_LINK,
  STUDIO_PROD_LINK,
  TWITTER_LINK,
} from '../constants';
import { ROUTES } from '../constants/routes';
import { BREAKPTS } from '../styles';
import {
  ActionDropdown,
  DropdownActionsListContainer,
} from './actionsDropdown';
import { BaseAnchor } from './anchor';
import { BaseButton } from './button';
import { FlexEnds } from './flex';
import { AddIcon } from './icons/add';
import { DiscordIcon } from './icons/discord';
import { EllipsisIcon } from './icons/ellipsis';
import { OpenSeaIcon } from './icons/opensea';
import { TwitterIcon } from './icons/twitter';

interface DropdownProps {
  enable: boolean;
}

interface ExtendedCssProps extends React.CSSProperties {
  y: number;
  config: SpringConfig;
}
export const DropdownAnimation: { [key: string]: ExtendedCssProps } = {
  hidden: {
    y: 6,
    opacity: 0,
    pointerEvents: 'none',
    userSelect: 'none',
    config: config.stiff,
  },
  visible: {
    y: 0,
    opacity: 1,
    pointerEvents: 'auto',
    userSelect: 'auto',
    config: config.stiff,
  },
};

const RoundIconButton = styled(BaseButton)<{ isActive?: boolean }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: ${(p) =>
    p.isActive ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0)'};
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  outline: none;
  > svg {
    height: 16px;
    width: 16px;
  }
  transition: all 200ms ease-in-out;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const HeaderLogoText = styled.a`
  color: black;
  font-size: 20px;
  font-family: Bebas Neue;
  text-decoration: none;
  display: flex;
  align-items: center;
  opacity: 0.5;
  margin-left: 12px;
`;

const manageButton = (onClick: () => void, isOpen?: boolean) => (
  <RoundIconButton isActive={isOpen} onClick={onClick}>
    <AddIcon />
  </RoundIconButton>
);

export const AddMenuDropdown: FC<DropdownProps> = ({}) => {
  return (
    <ActionDropdown enable={true} button={manageButton} dropdownWidth={200}>
      {() => (
        <DropdownActionsListContainer>
          {/* <SmallLink href={ROUTES.MARKET} target={'_blank'}>
            List for sale
          </SmallLink> */}
          <SmallLink href={ROUTES.TAGS} target={'_blank'}>
            Create a list
          </SmallLink>
          <SmallLink href={ROUTES.TAGS} target={'_blank'}>
            Add a new tag
          </SmallLink>
        </DropdownActionsListContainer>
      )}
    </ActionDropdown>
  );
};

export const MenuDropdown: FC<DropdownProps> = ({ enable }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [{ y, opacity, pointerEvents, userSelect }, set] = useSpring(
    () => DropdownAnimation.hidden,
  );

  const clickAwayRef = useRef<HTMLDivElement | null>(null);
  useClickAway(clickAwayRef, () => {
    setIsOpen(false);
  });

  useEffect(() => {
    if (!enable) {
      set(DropdownAnimation.hidden);
      return;
    }
    if (isOpen) {
      set(DropdownAnimation.visible);
    }
    if (!isOpen) {
      set(DropdownAnimation.hidden);
    }
  }, [isOpen, enable]);

  return (
    <ButtonWrapper ref={clickAwayRef}>
      <RoundIconButton isActive={isOpen} onClick={() => setIsOpen((s) => !s)}>
        <EllipsisIcon />
      </RoundIconButton>
      <DropdownSpacer />
      <AnimatedMenuDropdown
        style={{
          transform: y.to((v) => `translateY(${v}%`),
          opacity,
          pointerEvents,
          userSelect,
        }}
      >
        <BigLinkGroup>
          {/* <Link href={`${ROUTES.EXPLORE.INDEX}`} passHref={true}>
            <BigLink>Explore</BigLink>
          </Link> */}
          <Link href={ROUTES.MARKET} passHref>
            <BigLink>Market</BigLink>
          </Link>
          <Link href={ROUTES.HISTORIANS.INDEX} passHref>
            <BigLink>DAO</BigLink>
          </Link>
        </BigLinkGroup>
        <SmallLinkGroup>
          <Link href={`${ROUTES.FAQ}`} passHref={true}>
            <SmallLink>FAQ</SmallLink>
          </Link>
          <Link href={`${ROUTES.TAGS}`} passHref={true}>
            <SmallLink>Tag Manager</SmallLink>
          </Link>
          <SmallLink href={SHOP_PROD_LINK} target={'_blank'}>
            Print Service
          </SmallLink>
          <Link href={`${ROUTES.CONTRACTS}`} passHref={true}>
            <SmallLink>Contracts</SmallLink>
          </Link>
          <Link href={`${ROUTES.LEGAL}`} passHref={true}>
            <SmallLink>Legal</SmallLink>
          </Link>
        </SmallLinkGroup>
        <IconBottomRow>
          <HeaderLogoText
            href={STUDIO_PROD_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            PoB
          </HeaderLogoText>
          <FlexEnds>
            <IconLink href={OPENSEA_LINK_V3} target={'_blank'}>
              <OpenSeaIcon />
            </IconLink>
            <IconLink href={DISCORD_LINK} target={'_blank'}>
              <DiscordIcon />
            </IconLink>
            <IconLink href={TWITTER_LINK} target={'_blank'}>
              <TwitterIcon />
            </IconLink>
          </FlexEnds>
        </IconBottomRow>
      </AnimatedMenuDropdown>
    </ButtonWrapper>
  );
};

const ButtonWrapper = styled.div`
  position: relative;
`;

const DropdownSpacer = styled.div`
  background: transparent;
  width: 100%;
  height: 10px;
  position: absolute;
`;

const MenuDropdownContainer = styled.div`
  position: absolute;
  right: 0;
  margin-top: 10px;
  z-index: 1100;
  background: white;
  min-width: 256px;
  box-shadow: 0px 9px 20px rgba(0, 0, 0, 0.14);
  border-radius: 8px;
  opacity: 0;
`;

const AnimatedMenuDropdown = animated(MenuDropdownContainer);

const BigLink = styled(BaseAnchor)`
  font-style: normal;
  font-weight: bold;
  font-size: 28px;
  line-height: 34px;
  color: black;
  text-decoration: none;
  display: block;
  padding: 10px;
  border-radius: 7px;
  :hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const SmallLink = styled(BaseAnchor)`
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 16px;
  color: black;
  padding: 14px;
  text-decoration: none;
  display: block;
  border-radius: 7px;
  :hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const IconLink = styled(BaseAnchor)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  width: 42px;
  border-radius: 7px;
  :hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const BigLinkGroup = styled.div`
  padding: 6px 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: none;
  @media (max-width: ${BREAKPTS.SM}px) {
    display: inherit;
  }
`;

const SmallLinkGroup = styled.div`
  padding: 6px 4px;
`;

const IconBottomRow = styled(FlexEnds)`
  padding: 0px 6px 6px 6px;
`;
