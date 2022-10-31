import styled from 'styled-components';
import { BREAKPTS } from '../styles';

export const BaseButton = styled.button`
  outline: none;
  background: none;
  border: none;
  transition: 200ms ease-in-out transform;
  padding: 0;
  cursor: pointer;
  /* @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 14px;
  } */
  :disabled {
    cursor: not-allowed;
  }
`;

export const ActionButton = styled(BaseButton)`
  font-size: 11px;
  height: 56px;
  font-weight: bold;
  padding: 20px 32px;
  text-transform: uppercase;
  position: relative;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  color: black;
  border-radius: 4px;
  transition: 125ms ease-in-out all;
  background: #f8f8f8;
  transform: scale(1, 1);
  &:hover {
    /* transform: scale(1.01, 1.01); */
  }
  :disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const PrimaryButton = styled(ActionButton)`
  color: white;
  background: black;
`;

export const SecondaryButton = styled(ActionButton)`
  color: black;
  background: #f2f2f2;
`;

export const TertiaryButton = styled(BaseButton)`
  font-weight: bold;
  font-size: 16px;
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 14px;
  }
`;

export const RoundIconButton = styled(BaseButton)<{ isActive?: boolean }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: ${(p) =>
    p.isActive ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.)'};
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  outline: none;
  > svg {
    height: 16px;
    width: 16px;
  }
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

export const SmallPrimaryActionButton = styled(PrimaryButton)`
  padding: 6px 8px;
  font-size: 10px;
  line-height: 12px;
  height: 24px;
`;

export const SmallSecondaryActionButton = styled(SecondaryButton)`
  padding: 6px 8px;
  font-size: 10px;
  line-height: 12px;
  height: 24px;
`;
