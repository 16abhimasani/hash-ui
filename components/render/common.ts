import { Bound } from '@hash/sketch-utils';
import { animated } from 'react-spring';
import styled from 'styled-components';

export const StyledImg = styled.img`
  width: 100%;
  height: 100%;
  z-index: 1;
  position: relative;
  display: block;
`;

const StyledCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  z-index: 1;
  position: relative;
`;

export const SketchCanvas = animated(StyledCanvas);

export const CanvasWrapper = styled.div<{ dimensions: Bound }>`
  position: relative;
  width: ${(p) => p.dimensions[0]}px;
  height: ${(p) => p.dimensions[1]}px;
`;

export const MintedArtSignature = styled.img<{ multiplier: number }>`
  position: absolute;
  bottom: ${(p) => p.multiplier * 44}px;
  right: ${(p) => p.multiplier * 44}px;
  width: ${(p) => p.multiplier * 256}px;
  z-index: 2;
`;
