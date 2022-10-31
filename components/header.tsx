import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { animated } from 'react-spring';
import { useMeasure } from 'react-use';
import styled, { keyframes } from 'styled-components';
import { HEADER_HEIGHT } from '../constants';
import { ROUTES } from '../constants/routes';
import { useIsHeaderTransparent } from '../hooks/useIsHeaderTransparent';
import { useTransactionsStore } from '../stores/transaction';
import { BREAKPTS } from '../styles';
import { BaseAnchor, CleanAnchor } from './anchor';
import { BaseButton } from './button';
import { Flex, FlexCenter, FlexEnds } from './flex';
import { CloseIcon } from './icons/close';
import { LargeLeftArrow } from './icons/largeArrow';
import { MenuDropdown } from './menuDropdown';
import { NavigationLoadingProgressBar } from './nProgress';
import { Search } from './search';
import { Web3Status } from './web3Status';

const SPACER_HEIGHT = 0;
export const BANNER_HEIGHT = 50;

const HeaderSpacer = styled.div`
  width: 100%;
  height: ${SPACER_HEIGHT}px;
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const HeaderSpacerWell = styled.div`
  background: #f2f2f2;
`;

export const BannerText = styled.p`
  padding: 0;
  margin: 0;
  word-wrap: break-word;
  font-size: 14px;
  text-align: center;
`;

const HeaderLink = styled(BaseAnchor)<{ isActive?: boolean }>`
  color: ${(p) => (p.isActive ? 'black' : 'rgba(0,0,0,0.3)')};
  font-weight: bold;
  :hover {
    color: black;
  }
`;

const HeaderLinkRow = styled(Flex)`
  margin-right: 24px;
  @media (max-width: ${BREAKPTS.SM}px) {
    display: none;
  }
  > ${HeaderLink} + ${HeaderLink} {
    margin-left: 24px;
  }
`;

const StyledCloseIcon = styled(CloseIcon)`
  * {
    fill: white;
  }
`;

const BannerWrapper = styled(FlexCenter)`
  width: 100%;
  height: ${BANNER_HEIGHT}px;
  background: black;
  color: white;
  padding: 0 15px 0 20px;
  position: relative;
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  height: ${HEADER_HEIGHT - SPACER_HEIGHT}px;
  padding: 0 24px 0 24px;
  @media (max-width: ${BREAKPTS.LG}px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const SplitHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  height: ${HEADER_HEIGHT - SPACER_HEIGHT}px;
  padding: 0 24px 0 24px;
`;

const SplitHeaderWrapper = styled.div<{ isHeaderTransparent?: boolean }>`
  transition: all 150ms ease-in-out;
  background: ${(p) =>
    p.isHeaderTransparent ? 'transparent' : 'rgba(255, 255, 255, 1)'};
  border-bottom: ${(p) =>
    p.isHeaderTransparent
      ? '1px solid rgba(0, 0, 0, 0.0)'
      : '1px solid rgba(0, 0, 0, 0.05)'};
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`;

const HeaderWrapper = styled.div<{ isHeaderTransparent?: boolean }>`
  transition: all 150ms ease-in-out;
  background: ${(p) =>
    p.isHeaderTransparent ? 'transparent' : 'rgba(255, 255, 255, 1)'};
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  border-bottom: ${(p) =>
    p.isHeaderTransparent
      ? '1px solid rgba(0, 0, 0, 0.0)'
      : '1px solid rgba(0, 0, 0, 0.05)'};
`;

const HeaderSideContentWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRightSideContentWrapper = styled(HeaderSideContentWrapper)`
  justify-content: flex-end;
`;
const HeaderLogoWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderLogoText = styled.a`
  color: black;
  font-size: 24px;
  font-family: Bebas Neue;
  text-decoration: none;
  opacity: 0.5;
`;

const HeaderSlash = styled.div`
  background: black;
  width: 19px;
  height: 1px;
  transform: rotate(112deg);
`;
const HeaderSlashWrapper = styled.div`
  transform: translateY(1.5px);
  margin: 0 -1px 0 -2px;
`;

const ProjectTitleText = styled.a`
  padding-top: 2px;
  color: black;
  font-size: 20px;
  font-weight: 700;
  font-family: Helvetica;
  text-decoration: none;
  text-transform: uppercase;
  transform: translateY(-1px);
`;

const PlainInputWrapper = styled.div`
  background: #f0efef;
  border-radius: 999px;
  width: 440px;
  transition: 125ms ease-in-out all;
  :hover {
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
  }
`;

export const PlainInput = styled.input.attrs({ type: 'text' })`
  font-size: 14px;
  background: none;
  border: none;
  border-radius: none;
  padding: 0 8px 0 0;
  outline: none;
  overflow: hidden;
  flex-grow: 1;
  ::placeholder {
    color: black;
    opacity: 0.3;
  }
`;

export const PlainTextAreaWrapper = styled(PlainInputWrapper)`
  height: 128px;
`;

export const PlainTextArea = styled(PlainInput)`
  width: 100%;
  height: 100%;
`;

export const IconButton = styled.button`
  width: 16px;
  height: 16px;
  outline: none;
  background: none;
  border-radius: 0;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  > svg {
    height: 16px;
    width: 16px;
  }
  :disabled {
    cursor: not-allowed;
    opacity: 0.2;
  }
`;

const HeaderIconImage = styled.img`
  width: 32px;
  height: 32px;
  display: block;
  object-fit: contain;
  object-position: center;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 4px;
`;

const breath = keyframes`
  0% {
    opacity: 0.2;
  }

  50% {
    opacity: 0.6;
  }

  100% {
    opacity: 0.2;
  }
`;

const Circle = styled.div`
  background-color: blue;
  animation: ${breath} 0.9s ease-in-out infinite;
  height: 12px;
  width: 12px;
  border-radius: 999px;
`;

const AnimatedStatusIndicator = animated(StatusIndicator);

const ActiveTransactionIndicator: React.FC = () => {
  const transactionMap = useTransactionsStore((s) => s.transactionMap);

  const numLoadingCount = useMemo(() => {
    return Object.values(transactionMap).reduce(
      (a, tx) => (tx.status === 'in-progress' ? a + 1 : a),
      0,
    );
  }, [transactionMap]);
  return (
    <>
      {numLoadingCount > 0 && (
        <AnimatedStatusIndicator>
          <Circle />
          {/* {numLoadingCount} */}
        </AnimatedStatusIndicator>
      )}
    </>
  );
};

export const HeaderRightNav: React.FC = () => {
  return (
    <HeaderRightSideContentWrapper>
      <ActiveTransactionIndicator />
      {/* {!!account && <AddMenuDropdown enable={true} />} */}
      <div style={{ width: 8 }}></div>
      <Web3Status />
      <div style={{ width: 8 }}></div>
      <MenuDropdown enable={true} />
    </HeaderRightSideContentWrapper>
  );
};

export const RoundBackIconButton = styled(BaseButton)<{ isActive?: boolean }>`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  position: absolute;
  top: 24px;
  left: 24px;
  background: white;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  outline: none;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.05);
  > svg {
    height: 16px;
    width: 16px;
  }
  transform: scale(1, 1);
  &:hover {
    /* transform: scale(1.03, 1.03); */
  }
`;

export const SplitHeader: React.FC = () => {
  const [wrapperRef, { height: wrapperHeight }] = useMeasure();
  const router = useRouter();

  return (
    <>
      <RoundBackIconButton onClick={() => router.back()}>
        <LargeLeftArrow />
      </RoundBackIconButton>
    </>
  );
};

export const Header: React.FC = () => {
  const isHeaderTransparent = useIsHeaderTransparent();

  const [wrapperRef, { height: wrapperHeight }] = useMeasure();

  const router = useRouter();

  return (
    <>
      <NavigationLoadingProgressBar
        color={'black'}
        height={3}
        startPosition={0}
        stopDelayMs={1000}
      />
      <HeaderWrapper
        ref={wrapperRef as any}
        isHeaderTransparent={isHeaderTransparent}
      >
        <HeaderRow>
          <HeaderSideContentWrapper>
            <HeaderLogoWrapper>
              <Link href={'/'} passHref>
                <CleanAnchor>
                  <HeaderIconImage
                    style={{ cursor: 'pointer' }}
                    src={'/assets/logos/hash.png'}
                  />
                </CleanAnchor>
              </Link>
            </HeaderLogoWrapper>
          </HeaderSideContentWrapper>
          <Search />
          <FlexEnds>
            <div></div>
            <Flex>
              <HeaderLinkRow>
                <Link href={ROUTES.EXPLORE.INDEX} passHref>
                  <HeaderLink
                    isActive={router.pathname.includes(ROUTES.EXPLORE.INDEX)}
                  >
                    Explore
                  </HeaderLink>
                </Link>
                <Link href={ROUTES.MARKET} passHref>
                  <HeaderLink
                    isActive={router.pathname.includes(ROUTES.MARKET)}
                  >
                    Market
                  </HeaderLink>
                </Link>
                {/* <Link href={ROUTES.HISTORIANS.INDEX} passHref>
                  <HeaderLink
                    isActive={router.pathname.includes(ROUTES.HISTORIANS.INDEX)}
                  >
                    DAO
                  </HeaderLink>
                </Link> */}
              </HeaderLinkRow>
              <HeaderRightNav />
            </Flex>
          </FlexEnds>
        </HeaderRow>
      </HeaderWrapper>
      <HeaderSpacer style={{ height: wrapperHeight }} />
    </>
  );
};
