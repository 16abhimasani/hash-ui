import styled from 'styled-components';

export const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: no-wrap;
  gap: 10px;
  padding: 56px;
  background: #f8f8f8;
`;

export const HeaderBreadcrumb = styled.div`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 28px;
  color: #999998;
`;

export const HeaderTitle = styled.div`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 28px;
  color: #444444;
`;

export const PillWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: no-wrap;
  gap: 8px;
`;

export const LargePill = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;
  height: fit-content;
  padding: 7px 14px;
  font-family: Helvetica Neue;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  color: #6a6a6a;
  background: #e6e6e6;
  border-radius: 9999px;
`;

export const LightLargePill = styled(LargePill)`
  background: #f0efef;
  color: rgba(106, 106, 106, 0.8);
`;
