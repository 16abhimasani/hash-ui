import { FC, useState } from 'react';
import { easings, useTransition } from 'react-spring';
import { usePriorityAccount } from '../../connectors/priority';
import { useTwitterLink } from '../../hooks/useAuth';
import { useModalStore } from '../../stores/modal';
import { ActionDescription, ActionTitle } from '../actions/common';
import {
  PanelLineSeparator,
  PrimaryRowActionButton,
  SecondaryRowActionButton,
} from '../art/panels/panel';
import { BaseButton } from '../button';
import { FlexCenter } from '../flex';
import { CloseIcon } from '../icons/close';
import { SpinnerIcon } from '../icons/spinner';
import { TwitterIcon } from '../icons/twitter';
import {
  AnimatedModalContainer,
  AnimatedModalContentContainer,
  ModalCloseRow,
} from './common';

export const TwitterModal: FC = () => {
  const account = usePriorityAccount();
  const {
    tweetSignatureHref,
    isTwitterLinked,
    togglePollingTwitter,
    isTwitterPolling,
  } = useTwitterLink(account);
  const [isTweetLinkClicked, setIsTweetLinkClicked] = useState(false);

  const isOpen = useModalStore((s) => s.isTwitterModalOpen);
  const toggleIsOpen = useModalStore((s) => s.toggleIsTwitterModalOpen);

  const transitions = useTransition(isOpen, {
    from: { opacity: 0, transform: 'translateY(-40px)' },
    enter: { opacity: 1, transform: 'translateY(0)' },
    leave: { opacity: 0, transform: 'translateY(-40px)' },
    config: {
      duration: 150,
      easing: easings.easeInOutQuart,
    },
  });

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
                  <BaseButton
                    style={{ opacity: 1, height: 24, width: 24 }}
                    onClick={() => {
                      toggleIsOpen();
                    }}
                  >
                    <CloseIcon />
                  </BaseButton>
                </ModalCloseRow>
                <FlexCenter>
                  <TwitterIcon />
                </FlexCenter>
                <ActionTitle style={{ textAlign: 'center', marginTop: 8 }}>
                  Connect Twitter
                </ActionTitle>
                <ActionDescription
                  style={{ textAlign: 'center', marginTop: 12 }}
                >
                  Connecting your twitter will allow your PFP and username to be
                  shown throughout the HASH experience.
                </ActionDescription>
                <PanelLineSeparator />
                {!isTwitterLinked ? (
                  <>
                    {!!tweetSignatureHref && (
                      <SecondaryRowActionButton
                        onClick={() => setIsTweetLinkClicked(true)}
                        as={'a'}
                        target={'_blank'}
                        href={tweetSignatureHref}
                        style={{ color: 'black', textDecoration: 'none' }}
                      >
                        1. Send Tweet
                      </SecondaryRowActionButton>
                    )}
                    <PrimaryRowActionButton
                      onClick={togglePollingTwitter}
                      style={{ marginTop: 20 }}
                    >
                      {isTwitterPolling ? (
                        <SpinnerIcon />
                      ) : (
                        '2. Check for Tweet'
                      )}
                    </PrimaryRowActionButton>
                  </>
                ) : (
                  <PrimaryRowActionButton disabled>
                    Linked!
                  </PrimaryRowActionButton>
                )}
              </AnimatedModalContentContainer>
            </AnimatedModalContainer>
          ),
      )}
    </>
  );
};
