import styled from 'styled-components';
import { MonoAnchorWithIcon } from '../../anchor';
import { PrimaryButton } from '../../button';
import { FlexEnds } from '../../flex';
import { MonoText } from '../../text';

export const DetailsContentContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  grid-gap: 36px;
`;

export const DetailsContentColumnContainer = styled.div`
  > div + div {
    margin-top: 24px;
  }
`;

export const DetailsTableText = styled(MonoText)`
  text-transform: uppercase;
  text-decoration: none;
  color: rgba(0, 0, 0, 0.6);
`;

export const DetailsTableLabel = styled(MonoText)`
  text-transform: uppercase;
  text-decoration: none;
`;

export const DetailsTableLabelAnchor = styled(MonoAnchorWithIcon)``;

export const ActionButton = styled(PrimaryButton)`
  font-size: 11px;
  height: 48px;
  font-weight: bold;
  padding: 16px 32px;
  text-transform: uppercase;
  color: white;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  :disabled {
    opacity: 0.2;
  }
  ::after {
    opacity: 1;
    background: black;
  }
  &:hover {
    &::after {
      opacity: 1;
      transform: scale(1, 1);
    }
  }
`;

export const SecondaryButton = styled(PrimaryButton)`
  font-size: 12px;
  font-weight: bold;
  padding: 16px 24px;
  text-transform: uppercase;
  color: black;
  border: 1px solid black;
  :disabled {
    opacity: 0.2;
  }
  ::after {
    opacity: 1;
    background: white;
  }
  &:hover {
    &::after {
      opacity: 1;
      transform: scale(1, 1);
    }
  }
`;

export const IconButton = styled(PrimaryButton)`
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  :disabled {
    opacity: 0.2;
  }
  ::after {
    opacity: 1;
    background: #f9f9f9;
  }
  &:hover {
    &::after {
      opacity: 1;
      transform: scale(1, 1);
    }
  }
  > svg {
    width: 20px;
    height: 20px;
  }
  > svg * {
  }
`;

export const SecondaryIconButton = styled(IconButton)`
  ::after {
    background: none;
    border: 1px solid black;
  }
`;

export const TertiaryButton = styled(PrimaryButton)`
  font-size: 12px;
  font-weight: bold;
  padding: 16px 24px;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 1);
  :disabled {
    opacity: 0.1;
  }
  ::after {
    opacity: 1;
  }
`;

export const DetailsTableRowContainer = styled(FlexEnds)<{ hover?: boolean }>`
  padding: 16px;
  transition: background 200ms ease-in-out;
  &:hover {
    background: ${(props) =>
      props.hover ? 'rgba(0, 0, 0, 0.024)' : 'transparent'};
  }
  text-decoration: none;
  cursor: ${(props) => (props.hover ? 'pointer' : 'default')};
  ${MonoAnchorWithIcon} {
    &:hover {
      text-decoration: none;
    }
  }
`;

export const DetailsTableContainer = styled.div`
  border: 1px solid #f0f0f0;
  > ${DetailsTableRowContainer} {
    border-bottom: 1px solid #f0f0f0;
  }
  > ${DetailsTableRowContainer}:last-child {
    border: none;
  }
`;

export const Panel = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 12px;
`;

export const PanelBlock = styled.div`
  padding: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

export const ClickablePanelBlock = styled.div<{ disabled?: boolean }>`
  padding: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  cursor: ${(p) => (p.disabled ? 'not-allowed' : 'pointer')};
  :hover {
    background: ${(p) => (p.disabled ? 'none' : '#F5F5F5')};
  }
`;

export const PanelRowButton = styled.button`
  display: block;
  padding: 12px;
  border: none;
  background: none;
  width: 100%;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  text-align: left;
  outline: none;
  :hover {
    background: #f5f5f5;
  }
`;
