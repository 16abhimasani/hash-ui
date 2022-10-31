import React, { FC, useEffect, useRef, useState } from 'react';
import { ReactNode } from 'react-markdown';
import { animated, config, SpringConfig, useSpring } from 'react-spring';
import { useClickAway, useMeasure } from 'react-use';
import styled from 'styled-components';
import { useCurrentUserBestRole } from '../contexts/auth';
import { useHashLogoByRole } from '../hooks/useHashLogoByRole';
import { DaoRole } from '../types/dao';
import { PanelLineSeparator } from './art/panels/panel';
import { Flex, FlexEnds } from './flex';
import { LargeRightArrow } from './icons/largeArrow';

export interface DropdownProps {
  enable: boolean;
  button: (onClick: () => void, isOpen?: boolean) => ReactNode;
  children: (onClick: () => void, isOpen?: boolean) => ReactNode;
  isToTop?: boolean;
  dropdownWidth?: number;
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

export const ActionDropdown: FC<DropdownProps> = ({
  button,
  children,
  enable,
  isToTop,
  dropdownWidth = 256,
}) => {
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

  const [measureRef, { height: buttonHeight }] = useMeasure();

  return (
    <ButtonWrapper ref={clickAwayRef}>
      <div ref={measureRef as any}>
        {button(() => setIsOpen((s) => !s), isOpen)}
      </div>
      <DropdownSpacer style={{ bottom: isToTop ? buttonHeight : undefined }} />
      <ADropdownPopover
        style={{
          transform: y.to((v) => `translateY(${v}%`),
          opacity,
          pointerEvents,
          userSelect,
          bottom: isToTop ? buttonHeight + 10 : undefined,
          width: dropdownWidth,
          minWidth: dropdownWidth,
        }}
      >
        {children(() => setIsOpen((s) => !s), isOpen)}
      </ADropdownPopover>
    </ButtonWrapper>
  );
};

export const DropdownActionTitle = styled.h4`
  padding: 0;
  margin: 0;
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  line-height: 18px;
  color: #000000;
  text-transform: capitalize;
`;

const DropdownActionDescriptionContainer = styled.div`
  margin-top: 10px;
`;

const StyledArrow = styled(LargeRightArrow)`
  height: 12px;
  width: 12px;
`;

export const DropdownActionDescription = styled.p`
  font-family: Helvetica;
  font-style: normal;
  font-weight: normal;
  font-size: 13px;
  line-height: 18px;
  color: rgba(0, 0, 0, 0.5);
  padding: 0;
  margin: 0;
  a {
    color: black;
  }
  a:hover {
    text-decoration: underline;
  }
`;

export const DropdownActionContainer = styled.button`
  display: block;
  outline: none;
  background: none;
  border: none;
  text-align: left;
  padding: 10px;
  width: 100%;
  transition: all 150ms ease-in-out;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  ${StyledArrow} {
    transition: all 150ms ease-in-out;
    transform: translateX(0px);
  }
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    ${StyledArrow} {
      transform: translateX(2px);
    }
  }
  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const DropdownAction: FC<{
  onClick?: () => void;
  disabled?: boolean;
  title: string;
  children: ReactNode;
}> = ({ onClick, disabled, title, children }) => {
  return (
    <DropdownActionContainer onClick={onClick} disabled={disabled}>
      <FlexEnds>
        <DropdownActionTitle>{title}</DropdownActionTitle>
        <StyledArrow />
      </FlexEnds>
      <DropdownActionDescriptionContainer>
        {children}
      </DropdownActionDescriptionContainer>
    </DropdownActionContainer>
  );
};

export const SimpleDropdownAction: FC<{
  onClick?: () => void;
  disabled?: boolean;
  children: string;
}> = ({ onClick, disabled, children }) => {
  return (
    <DropdownActionContainer onClick={onClick} disabled={disabled}>
      <DropdownActionTitle>{children}</DropdownActionTitle>
    </DropdownActionContainer>
  );
};

const RoundImage = styled.img`
  border-radius: 999px;
  display: block;
  border: 1px solid #f2f2f2;
`;

const RoleLabel = styled.p`
  margin: 0;
  font-style: normal;
  font-size: 12px;
  font-weight: bold;
  text-transform: capitalize;
`;

export const DropdownRoleRow: FC<{ children?: ReactNode }> = ({ children }) => {
  const bestRole = useCurrentUserBestRole();
  const hashLogoSrc = useHashLogoByRole(bestRole as DaoRole | undefined);
  return (
    <>
      <div style={{ margin: '8px 10px 8px 10px' }}>
        <PanelLineSeparator style={{ margin: 0 }} />
      </div>
      <FlexEnds style={{ padding: 10, height: 44 }}>
        <Flex>
          {!!bestRole && (
            <>
              <RoundImage src={hashLogoSrc} style={{ width: 24, height: 24 }} />
              <RoleLabel style={{ marginLeft: 8 }}>{bestRole}</RoleLabel>
            </>
          )}
        </Flex>
        {children}
      </FlexEnds>
    </>
  );
};

export const DropdownActionsListContainer = styled.div`
  padding: 6px;
  ${DropdownActionTitle} {
    white-space: nowrap;
  }
  > ${DropdownActionContainer} + ${DropdownActionContainer} {
    margin-top: 4px;
  }
`;

const ButtonWrapper = styled.div`
  position: relative;
`;

const DropdownSpacer = styled.div`
  background: transparent;
  width: 100%;
  height: 10px;
  position: absolute;
`;

const DropdownPopover = styled.div`
  position: absolute;
  right: 0;
  margin-top: 10px;
  z-index: 1100;
  background: white;
  box-shadow: 0px 9px 20px rgba(0, 0, 0, 0.14);
  border-radius: 8px;
  opacity: 0;
`;

const ADropdownPopover = animated(DropdownPopover);
