import { FC, useCallback, useMemo, useState } from 'react';
import { easings, useTransition } from 'react-spring';
import styled from 'styled-components';
import { HashEmbedMetadata } from '../../types/comments';
import { TX_HASH_REGEX } from '../../utils/regex';
import {
  PanelLineSeparator,
  PrimaryRowActionButton,
} from '../art/panels/panel';
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

export const EmbedHashModal: FC<{
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
  onSubmit?: (metadata: HashEmbedMetadata) => void;
}> = ({ isOpen, setIsOpen, onSubmit }) => {
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

  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  const isDisabled = useMemo(() => !TX_HASH_REGEX.test(txHash ?? ''), [txHash]);

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
                  <Label>Embed Txn</Label>
                  <ModalCloseButtonInRow
                    onClick={() => {
                      toggleIsOpen();
                    }}
                  >
                    <CloseIcon />
                  </ModalCloseButtonInRow>
                </ModalCloseRow>
                <>
                  <FormGroupContainer style={{ marginTop: 32 }}>
                    <FormContainer>
                      <FormLabelRow>
                        <FormLabel>Tx Hash</FormLabel>
                      </FormLabelRow>
                      <TextInputContainerRow style={{ padding: 16 }}>
                        <TextInput
                          onChange={(e) => {
                            setTxHash(e.target.value);
                          }}
                          placeholder={'0xabcd...'}
                          style={{ marginRight: 8 }}
                        />
                      </TextInputContainerRow>
                    </FormContainer>
                  </FormGroupContainer>
                </>
                <PrimaryRowActionButton
                  disabled={isDisabled}
                  style={{
                    marginTop: 32,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={() => {
                    if (!txHash) {
                      return;
                    }
                    onSubmit?.({
                      type: 'hash',
                      txHash: txHash,
                    });
                    toggleIsOpen();
                  }}
                >
                  Add Txn
                </PrimaryRowActionButton>
              </AnimatedModalContentContainer>
            </AnimatedModalContainer>
          ),
      )}
    </>
  );
};

const OrPanelLineSeperatorContainer = styled.div`
  margin: 20px 0;
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.2);
  font-size: 12px;
  text-transform: uppercase;
  > p {
    padding: 0 6px;
  }
  > ${PanelLineSeparator} {
    margin: 0;
    flex-grow: 1;
  }
`;
