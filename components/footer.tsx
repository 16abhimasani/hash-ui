import { useWindowSize } from 'react-use';
import styled from 'styled-components';
import { STUDIO_PROD_LINK } from '../constants';
import { BREAKPTS } from '../styles';
import { BaseAnchor } from './anchor';
import { Flex, FlexCenter } from './flex';

const FooterWrapper = styled(FlexCenter)`
  width: 100%;
  background: black;
  padding: 48px;
`;

const FooterSideContentWrappper = styled.div`
  position: relative;
`;

const FooterLeftSideContentWrapper = styled(FooterSideContentWrappper)`
  display: flex;
  align-items: flex-start;
  padding-left: 24px;
  @media (max-width: ${BREAKPTS.SM}px) {
    flex-direction: column;
    padding-bottom: 24px;
  }
`;

const FooterRightSideContentWrappper = styled(FooterSideContentWrappper)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  @media (max-width: ${BREAKPTS.SM}px) {
    justify-content: center;
    padding-top: 10px;
    padding-left: 24px;
    padding-right: 24px;
  }
`;

const FooterLink = styled(BaseAnchor)`
  font-weight: 500;
  color: rgba(255, 255, 255, 1);
  font-size: 14px;
  line-height: 14px;
  text-decoration: none;
  display: block;
  &:focus {
    color: rgba(0, 0, 0, 1);
  }
`;

const FooterLogoText = styled.a`
  color: white;
  font-size: 20px;
  height: 20px;
  font-family: Bebas Neue;
  text-decoration: none;
  display: flex;
  align-items: center;
`;

export const Footer: React.FC = () => {
  const { width } = useWindowSize();

  return (
    <FooterWrapper>
      <FooterLeftSideContentWrapper>
        <Flex>
          <FooterLink style={{ opacity: 1 }} href={'#'} target={'_blank'}>
            <strong>HASH</strong> made with 🩸 💦 💧 by{' '}
          </FooterLink>
          <FooterLogoText
            style={{ marginLeft: 8 }}
            href={STUDIO_PROD_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            PoB
          </FooterLogoText>
        </Flex>
      </FooterLeftSideContentWrapper>
      {/* <FooterRightSideContentWrappper>
        <FooterLinksContainer>
          <FooterLinksColumn>
            <FooterColumnLabel>Metaverse</FooterColumnLabel>
            <FooterLink
              href={OPENSEA_LINK_V3}
              target={'_blank'}
              onClick={() => {}}
            >
              OpenSea
            </FooterLink>
          </FooterLinksColumn>
        </FooterLinksContainer>
      </FooterRightSideContentWrappper> */}
    </FooterWrapper>
  );
};
