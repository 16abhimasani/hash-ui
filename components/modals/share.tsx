import { FC, useCallback, useMemo, useState } from 'react';
import { easings, useTransition } from 'react-spring';
import { useCopyToClipboard } from 'react-use';
import styled from 'styled-components';
import { getTwitterShareLink } from '../../bots/twitter';
import { HASH_PROD_LINK } from '../../constants';
import { ROUTES } from '../../constants/routes';
import { ActionDescription, ActionTitle } from '../actions/common';
import {
  PanelLineSeparator,
  SecondaryRowActionButton,
} from '../art/panels/panel';
import { CloseIcon } from '../icons/close';
import { CopyAddressIcon } from '../icons/copyAddress';
import { TwitterIcon } from '../icons/twitter';
import {
  AnimatedModalContainer,
  AnimatedModalContentContainer,
  ModalCloseButton,
  ModalCloseRow,
} from './common';

const ShareIconRowActionButton = styled(SecondaryRowActionButton)`
  display: flex;
  align-items: center;
`;

const ShareIconContainer = styled.div`
  margin-right: 4px;
  height: 16px;
  width: 16px;
  > svg {
    height: 16px;
    width: 16px;
  }
`;

export const ShareModal: FC<{
  hash: string;
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
}> = ({ hash, isOpen, setIsOpen }) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const [copied, setCopied] = useState<boolean>(false);
  const copyClick = useCallback(() => {
    const link = `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${hash}`;
    copyToClipboard(link);
    setCopied(true);
  }, [hash]);

  const toggleIsOpen = useCallback(
    () => setIsOpen(!isOpen),
    [setIsOpen, isOpen],
  );

  const transitions = useTransition(isOpen, {
    from: { opacity: 0, transform: 'translateY(-40px)' },
    enter: { opacity: 1, transform: 'translateY(0)' },
    leave: { opacity: 0, transform: 'translateY(-40px)' },
    config: {
      duration: 150,
      easing: easings.easeInOutQuart,
    },
  });

  const tweetLink = useMemo(() => {
    const link = `${HASH_PROD_LINK}${ROUTES.ART.INDEX}/${hash}`;
    return getTwitterShareLink(
      link,
      'Check out this cool HASH I found @historiansDAO!',
    );
  }, [hash]);

  return (
    <>
      {transitions(
        (props, item) =>
          item && (
            <AnimatedModalContainer
              style={{
                opacity: props.opacity,
                display: props.opacity.to((o) => (o !== 0 ? 'flex' : 'none')),
              }}
            >
              <AnimatedModalContentContainer style={props}>
                <ModalCloseRow>
                  <ModalCloseButton
                    onClick={() => {
                      toggleIsOpen();
                    }}
                  >
                    <CloseIcon />
                  </ModalCloseButton>
                </ModalCloseRow>
                <ActionTitle style={{ textAlign: 'center', marginTop: 12 }}>
                  Share HASH
                </ActionTitle>
                <ActionDescription
                  style={{ textAlign: 'center', marginTop: 12 }}
                >
                  Share to the world this moment of history!
                </ActionDescription>
                <PanelLineSeparator />
                <ShareIconRowActionButton
                  as={'a'}
                  href={tweetLink}
                  target={'_blank'}
                  style={{ textDecoration: 'none' }}
                >
                  <ShareIconContainer>
                    <TwitterIcon />
                  </ShareIconContainer>
                  <div>Tweet HASH</div>
                </ShareIconRowActionButton>
                <ShareIconRowActionButton
                  onClick={copyClick}
                  style={{ marginTop: 20 }}
                >
                  <ShareIconContainer>
                    <CopyAddressIcon />
                  </ShareIconContainer>
                  <div>{copied ? 'Copied!' : 'Copy Link'}</div>
                </ShareIconRowActionButton>
              </AnimatedModalContentContainer>
            </AnimatedModalContainer>
          ),
      )}
    </>
  );
};
