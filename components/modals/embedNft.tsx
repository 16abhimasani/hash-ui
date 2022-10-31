import { BigNumber } from 'ethers';
import { FC, useCallback, useMemo, useState } from 'react';
import { easings, useTransition } from 'react-spring';
import styled from 'styled-components';
import { useNftMetadata } from '../../hooks/useNft';
import { NftEmbedMetadata } from '../../types/comments';
import { ADDRESS_REGEX } from '../../utils/regex';
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
import { Spinner } from '../spinner';
import { Label } from '../text';
import {
  AnimatedModalContainer,
  AnimatedModalContentContainer,
  ModalCloseButtonInRow,
  ModalCloseRow,
} from './common';

export const EmbedNFTModal: FC<{
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
  onSubmit?: (metadata: NftEmbedMetadata) => void;
}> = ({ isOpen, setIsOpen, onSubmit }) => {
  const [inputTab, setInputTab] = useState<'contract' | 'opensea'>('opensea');

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

  const [contractAddress, setContractAddress] = useState<string | undefined>(
    undefined,
  );
  const [tokenIdStr, setTokenIdStr] = useState<string | undefined>(undefined);

  const tokenId = useMemo(() => {
    if (!tokenIdStr) {
      return undefined;
    }
    try {
      return BigNumber.from(tokenIdStr);
    } catch (e) {
      return undefined;
    }
  }, [tokenIdStr]);

  const metadata = useNftMetadata(contractAddress, tokenId?.toHexString());

  const isDisabled = useMemo(
    () =>
      !metadata ||
      !tokenId ||
      !contractAddress ||
      !ADDRESS_REGEX.test(contractAddress),
    [contractAddress, metadata],
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
                  <Label>Embed NFT</Label>
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
                        <FormLabel>OpenSea Link</FormLabel>
                      </FormLabelRow>
                      <TextInputContainerRow style={{ padding: 16 }}>
                        <TextInput
                          onChange={(e) => {
                            if (
                              !e.target.value.startsWith(
                                'https://opensea.io/assets',
                              )
                            ) {
                              return;
                            }
                            const splittedValues = e.target.value
                              .slice(26)
                              .split('/');
                            if (
                              !ADDRESS_REGEX.test(splittedValues[0]) ||
                              parseInt(splittedValues[1]) === NaN
                            ) {
                              return;
                            }
                            setContractAddress(splittedValues[0]);
                            setTokenIdStr(splittedValues[1]);
                          }}
                          placeholder={'https://opensea.io/assets/0x.../1'}
                          style={{ marginRight: 8 }}
                        />
                      </TextInputContainerRow>
                    </FormContainer>
                  </FormGroupContainer>
                </>
                <OrPanelLineSeperatorContainer>
                  <PanelLineSeparator />
                  <p>or</p>
                  <PanelLineSeparator />
                </OrPanelLineSeperatorContainer>
                <>
                  <FormGroupContainer>
                    <FormContainer>
                      <FormLabelRow>
                        <FormLabel>Contract Address</FormLabel>
                      </FormLabelRow>
                      <TextInputContainerRow style={{ padding: 16 }}>
                        <TextInput
                          onChange={(e) => setContractAddress(e.target.value)}
                          placeholder={'0x1234...abcd'}
                          style={{ marginRight: 8 }}
                        />
                      </TextInputContainerRow>
                    </FormContainer>
                  </FormGroupContainer>
                  <FormGroupContainer style={{ marginTop: 20 }}>
                    <FormContainer>
                      <FormLabelRow>
                        <FormLabel>Token Id</FormLabel>
                      </FormLabelRow>
                      <TextInputContainerRow style={{ padding: 16 }}>
                        <TextInput
                          onChange={(e) => setTokenIdStr(e.target.value)}
                          placeholder={'0'}
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
                    if (!contractAddress || !tokenId) {
                      return;
                    }
                    onSubmit?.({
                      type: 'nft',
                      tokenId: tokenId.toHexString(),
                      contract: contractAddress,
                    });
                    toggleIsOpen();
                  }}
                >
                  {!metadata && !!contractAddress && !!tokenId ? (
                    <Spinner />
                  ) : (
                    'Add NFT'
                  )}
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
