import styled from 'styled-components';

export const Bubble = styled.div<{ color?: string }>`
  display: flex;
  width: fit-content;
  height: fit-content;
  justify-content: center;
  align-items: center;
  padding: 3px 7px 3px 6px;
  font-family: Roboto Mono;
  font-style: normal;
  font-weight: normal;
  font-size: 9px;
  line-height: 10px;
  font-feature-settings: 'tnum' on, 'lnum' on, 'zero' on;
  text-transform: uppercase;
  color: ${(p) => p.color ?? '#0000ff'};
  border: 1px solid ${(p) => p.color ?? '#0000ff'};
  border-radius: 999px;
  /* margin-left: 8px; */
  transform: translateY(-1px);
`;
