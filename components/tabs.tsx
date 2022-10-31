import styled from 'styled-components';
import { BaseButton } from './button';
import { Flex } from './flex';

export const Tab = styled(BaseButton)<{ isActive?: boolean }>`
  font-family: Helvetica Neue;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  padding: 12px 0;
  color: rgba(0, 0, 0, ${(p) => (p.isActive ? 1 : 0.4)});
  border-bottom: 1px solid rgba(0, 0, 0, ${(p) => (p.isActive ? 1 : 0)});
  transition: all 150ms ease-in-out;
  :hover {
    color: rgba(0, 0, 0, 1);
    border-bottom: 1px solid black;
  }
`;

export const TabsContainer = styled(Flex)`
  position: relative;
  > ${Tab} + ${Tab} {
    margin-left: 28px;
  }
  ::after {
    position: absolute;
    content: '';
    height: 1px;
    right: 0;
    left: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.15);
  }
`;

export const TabsGroup = styled.div`
  > ${Tab} + ${Tab} {
    margin-left: 28px;
  }
`;

export const MiddotSpan = styled.span`
  padding: 0 2px;
`;
