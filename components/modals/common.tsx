import { animated } from 'react-spring';
import styled from 'styled-components';
import { HEADER_HEIGHT } from '../../constants';
import { BREAKPTS } from '../../styles';
import { BaseButton } from '../button';
import { FlexEnds } from '../flex';

export const ModalContainer = styled.div`
  position: fixed;
  z-index: 1100;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  transition: all 150ms ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: scroll;
  padding-top: ${HEADER_HEIGHT}px;
`;

export const AnimatedModalContainer = animated(ModalContainer);

export const ModalCloseRow = styled(FlexEnds)`
  display: flex;
  position: absolute;
  top: 24px;
  right: 20px;
  left: 32px;
  position: absolute;
  @media (max-width: ${BREAKPTS.SM}px) {
    display: none;
  }
`;

export const ModalCloseButtonInRow = styled(BaseButton)`
  opacity: 1;
  height: 16px;
  width: 16px;
  > svg {
    height: 16px;
    width: 16px;
  }
`;

export const ModalCloseButton = styled(BaseButton)`
  opacity: 1;
  height: 16px;
  width: 16px;
  position: absolute;
  top: 24px;
  right: 20px;
  > svg {
    height: 16px;
    width: 16px;
  }
`;

export const ModalContentContainer = styled.div`
  background: white;
  box-shadow: 0px 9px 20px rgba(0, 0, 0, 0.14);
  border-radius: 8px;
  width: 540px;
  padding: 32px;
  position: relative;
`;

export const AnimatedModalContentContainer = animated(ModalContentContainer);
