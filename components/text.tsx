import styled from 'styled-components';
import { BREAKPTS } from '../styles';

export const SpanBold = styled.span`
  font-weight: 600;
`;

export const Label = styled.div`
  font-family: Helvetica;
  font-style: normal;
  font-weight: normal;
  line-height: 12px;
  font-size: 12px;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.33);
`;

export const LargeLabel = styled.div`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  line-height: 13px;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.25);
`;

export const Text = styled.p`
  padding: 0;
  margin: 0;
  word-wrap: break-word;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
  a {
    white-space: nowrap;
  }
`;

export const P = styled.p`
  padding: 0;
  margin: 0;
  word-wrap: break-word;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.5);
  a {
    white-space: nowrap;
  }
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 72px;
  color: black;
  opacity: 0.1;
  font-weight: 600;
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 36px;
  }
`;

export const DescriptionUnderTitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.4);
  a {
    color: rgba(0, 0, 0, 0.8);
    text-decoration: underline;
  }
`;

export const H4 = styled.h4`
  padding: 0;
  margin: 0;
  word-wrap: break-word;
  font-size: 18px;
  color: rgba(0, 0, 0, 1);
`;

export const H5 = styled.h5`
  padding: 0;
  margin: 0;
  word-wrap: break-word;
  font-size: 16px;
  color: rgba(0, 0, 0, 1);
`;

export const MonoText = styled.p`
  font-family: 'Roboto Mono', monospace;
  padding: 0;
  margin: 0;
  word-wrap: break-word;
  font-size: 12px;
  /* opacity: 0.2; */
  color: rgba(0, 0, 0, 0.4);
`;
