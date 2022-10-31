import styled, { css, keyframes } from 'styled-components';

const breath = keyframes`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
`;

const breathAnimation = css`
  animation: ${breath} 1.8s ease-in-out infinite;
`;

export const BreathingActiveIndicator = styled.div<{
  isLoading?: boolean;
  color?: string;
}>`
  ${(p) => (p.isLoading ? breathAnimation : '')};
  width: 8px;
  height: 8px;
  background-color: ${(p) => (p.color ? p.color : '#1EFF27')};
  border-radius: 8px;
`;
