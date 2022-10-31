import { NextPage } from 'next';
import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { BreathingDownloadIcon } from '../../../components/breathingDownloadIcon';
import { BaseButton } from '../../../components/button';
import { ContentWrapper, MainContent } from '../../../components/content';
import { Flex, FlexEnds } from '../../../components/flex';
import { Header } from '../../../components/header';
import { Title } from '../../../components/text';
import { useDownloadFile } from '../../../hooks/useDownloadFile';
import { useTokenId } from '../../../hooks/useTokenId';
import { getPrintedArtworkPreviewUrl } from '../../../utils/urls';

const HighResDownloadPage: NextPage = () => {
  const input = useRef<HTMLInputElement>(null);
  const boxClick = useCallback(() => {
    input?.current?.focus();
  }, [input]);
  const [hash, setHash] = useState('');
  const typing = useCallback((e) => {
    setHash(e.target.value);
  }, []);
  // TODO fix
  const id = useTokenId(hash);

  const { isDownloading, handleDownload } = useDownloadFile(
    !!id ? getPrintedArtworkPreviewUrl(id) : undefined,
  );
  return (
    <ContentWrapper>
      <Header />
      <MainContent
        style={{
          background: '#F8F8F8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 80,
        }}
      >
        <Title>High-Res Downloader</Title>
        <InputBox onClick={boxClick}>
          <FlexEnds style={{ width: '100%' }}>
            <SearchInput
              ref={input}
              spellCheck="false"
              onChange={typing}
              value={hash}
              placeholder={'Download official image for any minted HASH...'}
            />
            <Flex>
              <SearchButton onClick={handleDownload}>
                Download <BreathingDownloadIcon isLoading={isDownloading} />
              </SearchButton>
            </Flex>
          </FlexEnds>
        </InputBox>
      </MainContent>
    </ContentWrapper>
  );
};

const SearchInput = styled.input.attrs({ type: 'text' })`
  font-size: 14px;
  background: none;
  border: none;
  border-radius: none;
  padding: 0 8px 0 0;
  outline: none;
  flex-grow: 1;

  ::placeholder {
    color: black;
    transition: 200ms ease-in-out all;
  }
  &:hover {
    ::placeholder {
      opacity: 0.75;
    }
  }
  color: black;
`;
export const SearchButton = styled(BaseButton)`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 20px;
  text-align: right;
  text-transform: uppercase;
  color: white;
  background: black;
  padding: 14px 24px 14px 32px;
  margin-left: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid black;
  &:disabled {
    opacity: 0.1;
    cursor: not-allowed;
  }
  svg {
    margin-left: 8px;
    height: 20px;
    width: 20px;
    fill: white;
  }
`;
export const InputBox = styled.div`
  display: flex;
  width: 1024px;
  background: #f8f8f8;
  border: 1px solid rgba(0, 0, 0, 0.5);
  margin: 40px 64px;
  padding: 16px 18px 16px 32px;
  z-index: 3;
  cursor: text;
`;

export default React.memo(HighResDownloadPage);
