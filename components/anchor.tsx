import styled from 'styled-components';

export const BaseAnchor = styled.a`
  outline: none;
  background: none;
  border: none;
  transition: 200ms ease-in-out all;
  transform: scale(1, 1);
  color: inherit;
  text-decoration: none;
  padding: 0;
  &:hover {
    /* transform: scale(0.98, 0.98); */
  }
`;

export const CleanAnchor = styled.a`
  outline: none;
  background: none;
  border: none;
  text-decoration: none;
  margin: 0;
  padding: 0;
  color: unset;
  cursor: pointer;
`;

export const PrimaryAnchor = styled(BaseAnchor)`
  position: relative;
  &::after {
    content: '';
    transition: 200ms ease-in-out all;
    background: #f8f8f8;
    opacity: 0;
    position: absolute;
    z-index: -1;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }
  :hover {
    &::after {
      opacity: 1;
      /* transform: scale(1.05, 1.15); */
    }
  }
`;

export const PrimaryTextAnchor = styled.a`
  color: black;
  font-size: 12px;
  opacity: 1;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;

export const SecondaryTextAnchor = styled.a`
  color: black;
  font-size: 12px;
  opacity: 0.2;
  text-decoration: none;
  :hover {
    text-decoration: underline;
  }
`;

export const MonoAnchorWithIcon = styled.a`
  padding: 0;
  margin: 0;
  word-wrap: break-word;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  text-decoration: none;
  white-space: nowrap;
  &::after {
    content: '';
    background-image: url('/icons/arrow-top-right.svg');
    opacity: 0.3;
    margin-left: 4px;
    margin-top: 0px;
    width: 10px;
    height: 10px;
    background-size: 10px 10px;
  }
  :hover {
    text-decoration: underline;
  }
`;

export const LabelAnchor = styled.a`
  font-family: Helvetica;
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 11px;
  text-transform: uppercase;
  text-decoration: underline;
  color: rgba(0, 0, 0, 0.33);
`;
