import React, { FC, useCallback, useEffect } from 'react';
import { animated, config, SpringConfig, useSpring } from 'react-spring';
import styled from 'styled-components';

type DropdownCell = { text: string; handler: () => void };
interface DropdownProps {
  enable: boolean;
  children: React.ReactChild;
  cells: DropdownCell[];
}

interface ExtendedCssProps extends React.CSSProperties {
  y: number;
  config: SpringConfig;
}
export const DropdownAnimation: { [key: string]: ExtendedCssProps } = {
  hidden: {
    y: 8,
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

export const Dropdown: FC<DropdownProps> = ({ enable, children, cells }) => {
  const [{ y, opacity, pointerEvents, userSelect }, set] = useSpring(
    () => DropdownAnimation.hidden,
  );
  const mouseEnter = useCallback(() => {
    if (enable) {
      set(DropdownAnimation.visible);
    }
  }, [enable]);
  const mouseLeave = useCallback(() => {
    if (enable) {
      set(DropdownAnimation.hidden);
    }
  }, [enable]);
  useEffect(() => {
    if (!enable) {
      set(DropdownAnimation.hidden);
    }
  }, [enable]);

  return (
    <ButtonWrapper onMouseEnter={mouseEnter} onMouseLeave={mouseLeave}>
      {children}
      <DropdownSpacer />
      <AWeb3Dropdown
        style={{
          transform: y.to((v) => `translateY(${v}%`),
          opacity,
          pointerEvents,
          userSelect,
        }}
      >
        {cells.map((cell: DropdownCell, i: number) => (
          <Web3DropdownCell
            key={`web3-dropdown-cell-${i}`}
            onClick={cell.handler}
          >
            {cell.text}
          </Web3DropdownCell>
        ))}
      </AWeb3Dropdown>
    </ButtonWrapper>
  );
};

const ButtonWrapper = styled.div`
  position: relative;
`;
const DropdownSpacer = styled.div`
  background: transparent;
  width: 100%;
  height: 8px;
  position: absolute;
`;
const Web3Dropdown = styled.div`
  position: absolute;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.25);
  min-width: 200px;
  opacity: 0;
`;
const AWeb3Dropdown = animated(Web3Dropdown);
const Web3DropdownCell = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  transition: all 300ms ease;
  padding: 16px;
  cursor: pointer;
  background: white;
  &:hover {
    background: #f8f8f8;
  }
  &:not(:first-child) {
    border-top: 1px solid rgba(0, 0, 0, 0.25);
  }
`;
