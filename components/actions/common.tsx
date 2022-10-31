import styled from 'styled-components';
import { FlexCenter } from '../flex';

export const ActionTitle = styled.h1`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  line-height: 24px;
  color: #000000;
  padding: 0;
  margin: 0;
`;

export const ActionLargeTitle = styled.h1`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 40px;
  line-height: 47px;
  color: #000000;
  padding: 0;
  margin: 0;
`;

export const ActionDescription = styled.p`
  padding: 0;
  margin: 0;
  font-size: 18px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.5);
  a {
    white-space: nowrap;
  }
`;

export const ActionAnchorList = styled.div`
  > a {
    display: block;
  }
  > a + a {
    margin-top: 16px;
  }
`;

export const ActionAnchor = styled.a`
  color: black;
  font-size: 14px;
  text-decoration: underline;
`;

export const ActionSmallContentContainer = styled.div`
  width: 480px;
`;

export const ActionSmallContentWrapper = styled(FlexCenter)`
  width: 100%;
  height: 100%;
`;

export const ActionFullContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

export const ActionFullContentCenterContainer = styled.div`
  flex-grow: 1;
  padding: 64px;
`;

export const ActionFullContentActionContainer = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 32px;
`;

export const ActionCaption = styled.p`
  color: rgba(0, 0, 0, 0.25);
  font-size: 12px;
`;
