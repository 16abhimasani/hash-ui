import { animated } from 'react-spring';
import styled, { keyframes } from 'styled-components';

export const Spinner: React.FC = () => (
  <AnimateSpin>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      className="spinner undefined"
      viewBox="0 0 24 24"
      display="block"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        strokeDasharray="32"
        strokeLinecap="round"
        strokeWidth="2"
      ></circle>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        strokeLinecap="round"
        strokeWidth="2"
        opacity="0.25"
      ></circle>
    </svg>
  </AnimateSpin>
);

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const AnimateSpin = animated(styled.div`
  animation: ${spin} 1s linear infinite;
  width: fit-content;
  height: fit-content;
  svg {
    width: 16px;
    height: 16px;
  }
`);
