import styled from 'styled-components';
import { BREAKPTS } from '../styles';

export const LargeTitle = styled.h1`
  font-family: Helvetica;
  font-style: normal;
  font-weight: 600;
  font-size: 72px;
  line-height: 72px;
  margin: 0;
  transform: translateX(-6px);
  text-transform: uppercase;
  padding-top: 128px;
  @media (max-width: ${BREAKPTS.LG}px) {
    font-size: 48px;
    line-height: 48px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 48px;
    line-height: 48px;
  }
`;

export const SubTitle = styled.p`
  font-family: Helvetica;
  font-style: normal;
  font-size: 18px;
  line-height: 18px;
  margin: 0;
  text-transform: uppercase;
  padding-top: 8px;
  @media (max-width: ${BREAKPTS.LG}px) {
    font-size: 18px;
    line-height: 18px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 16px;
    line-height: 16px;
  }
`;
