import styled, { css, keyframes } from 'styled-components';
import { DownloadIcon } from './icons/download';

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
  animation: ${breath} 0.9s ease-in-out infinite;
`;

export const BreathingDownloadIcon = styled(DownloadIcon)<{
  isLoading?: boolean;
}>`
  ${(p) => (p.isLoading ? breathAnimation : '')};
`;
