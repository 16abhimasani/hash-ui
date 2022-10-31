import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { easings, useTransition } from 'react-spring';
import { TwitterEmbedMetadata } from '../../types/comments';
import { TWITTER_PROFILE_REGEX } from '../../utils/regex';
import { PrimaryRowActionButton } from '../art/panels/panel';
import { CloseIcon } from '../icons/close';
import {
  FormContainer,
  FormGroupContainer,
  FormLabel,
  FormLabelRow,
  TextInput,
  TextInputContainerRow,
} from '../input';
import { Label } from '../text';
import {
  AnimatedModalContainer,
  AnimatedModalContentContainer,
  ModalCloseButtonInRow,
  ModalCloseRow,
} from './common';

export const EmbedTweetModal: FC<{
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
  twitterEmbedMetadata?: TwitterEmbedMetadata;
  onSubmit?: (metadata: TwitterEmbedMetadata) => void;
}> = ({ isOpen, setIsOpen, twitterEmbedMetadata, onSubmit }) => {
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

  const [tweetStatusLink, setTweetStatusLink] = useState(
    twitterEmbedMetadata?.url ?? '',
  );

  useEffect(() => {
    if (!twitterEmbedMetadata) {
      return;
    }
    setTweetStatusLink(twitterEmbedMetadata.url);
  }, [twitterEmbedMetadata]);
  const isDisabled = useMemo(
    () => !TWITTER_PROFILE_REGEX.test(tweetStatusLink),
    [tweetStatusLink],
  );

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
                  <Label>Embed tweet</Label>
                  <ModalCloseButtonInRow
                    onClick={() => {
                      toggleIsOpen();
                    }}
                  >
                    <CloseIcon />
                  </ModalCloseButtonInRow>
                </ModalCloseRow>
                <FormGroupContainer style={{ marginTop: 32 }}>
                  <FormContainer>
                    <FormLabelRow>
                      <FormLabel>Tweet Status Link</FormLabel>
                    </FormLabelRow>
                    <TextInputContainerRow style={{ padding: 16 }}>
                      <TextInput
                        onChange={(e) => setTweetStatusLink(e.target.value)}
                        placeholder={'https://twitter.com/prrfbeauty/status/0'}
                        style={{ marginRight: 8 }}
                      />
                    </TextInputContainerRow>
                  </FormContainer>
                </FormGroupContainer>
                <PrimaryRowActionButton
                  disabled={isDisabled}
                  style={{ marginTop: 32 }}
                  onClick={() => {
                    onSubmit?.({ type: 'twitter-tweet', url: tweetStatusLink });
                    toggleIsOpen();
                  }}
                >
                  Add tweet
                </PrimaryRowActionButton>
              </AnimatedModalContentContainer>
            </AnimatedModalContainer>
          ),
      )}
    </>
  );
};
