import { createGlobalStyle } from 'styled-components';

export const BREAKPTS = {
  XS: 360,
  SM: 480,
  MD: 768,
  LG: 992,
  XL: 1200,
};

export type BreakPts = keyof typeof BREAKPTS;

export const HollowText = (color: string) => `
  -webkit-text-stroke: 1px ${color}};
  text-stroke: 1px ${color};
`;
export const HollowTextUnset = `
  -webkit-text-stroke: initial;
  text-stroke: initial;
`;

export const ThemedGlobalStyle = createGlobalStyle`
    body, html, * {
        box-sizing: border-box;
        font-family: Helvetica, sans-serif, Arial;
    }
    html {
    }
    body {
        min-height: 100vh;
        width: 100%;
        margin: 0;
    }
`;

export const DEFAULT_TOAST_STYLES = {
  border: '1px solid rgba(0,0,0,0.15)',
  padding: '8px',
  color: 'black',
  fontSize: 14,
};
