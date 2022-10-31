import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

export const StyledReactMarkdown = styled(ReactMarkdown)`
  p {
    /* padding: 0;
    margin: 0; */
    font-family: Helvetica;
    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 18px;
    color: rgba(0, 0, 0, 0.5);
    word-break: break-word;
  }
  a {
    color: rgba(0, 0, 0, 0.75);
  }
  li {
    font-family: Helvetica;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 14px;
    color: rgba(0, 0, 0, 0.5);
    word-break: break-word;
  }
`;
