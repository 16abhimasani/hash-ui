import { animated } from 'react-spring';
import styled from 'styled-components';
import { HEADER_HEIGHT } from '../constants';
import { BREAKPTS } from '../styles';

export const ContentWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
`;

export const MainContent = styled.div`
  width: 100%;
  background-color: #f9f9f9;
  min-height: 100vh;
`;

export const ContentRow = styled.div`
  max-width: ${BREAKPTS.LG}px;
  margin: 0 auto;
  @media (max-width: ${BREAKPTS.LG}px) {
    max-width: 100%;
    padding: 0 16px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    max-width: 100%;
    padding: 0 16px;
  }
`;

export const LargerContentRow = styled.div`
  max-width: ${BREAKPTS.XL}px;
  margin: 0 auto;
  @media (max-width: ${BREAKPTS.LG}px) {
    max-width: 100%;
    padding: 0 16px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    max-width: 100%;
    padding: 0 16px;
  }
`;
export const SplitFullPageContent = styled.div`
  height: calc(100vh - ${HEADER_HEIGHT}px);
  max-height: calc(100vh - ${HEADER_HEIGHT}px);
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
`;
export const TitleRow = animated(styled(ContentRow)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 72px;
  @media (max-width: ${BREAKPTS.SM}px) {
    padding: 0 16px;
    padding-top: 24px;
  }
`);

export const LargerTitleRow = animated(styled(LargerContentRow)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 72px;
  @media (max-width: ${BREAKPTS.SM}px) {
    padding: 0 16px;
    padding-top: 24px;
  }
`);
