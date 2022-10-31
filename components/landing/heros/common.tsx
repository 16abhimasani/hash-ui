import styled from 'styled-components';
import { BREAKPTS } from '../../../styles';

export const HeroWrapper = styled.div`
  margin: 128px 0;
  display: flex;
  flex-direction: column;
  width: 100vw;
  background: white;
  justify-content: flex-start;
  align-items: center;
  @media (max-width: ${BREAKPTS.MD}px) {
    margin: 64px 0;
  }
`;

export const HeroSubtitle = styled.p`
  margin: 0;
  padding: 0;
  font-family: Helvetica;
  font-style: normal;
  font-size: 24px;
  line-height: 42px;
  text-align: center;
  color: rgba(0, 0, 0, 0.5);
  max-width: 1000px;
  margin: 32px 0px;
  strong {
    font-weight: bold;
    color: black;
  }

  @media (max-width: ${BREAKPTS.MD}px) {
    font-size: 20px;
    line-height: 32px;
    padding: 0 10px;
  }
`;
