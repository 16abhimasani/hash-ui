import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useBeforeUnload, usePrevious } from 'react-use';
import styled from 'styled-components';
import { usePriorityAccount } from '../../connectors/priority';
import { ROUTES } from '../../constants/routes';
import { useCurrentUserHasEitherRoles } from '../../contexts/auth';
import {
  useHashByContext,
  useOwnerByContext,
  useTokenMetadataByContext,
  useUserAddedMetadataByContext,
} from '../../contexts/token';
import { useWriteOptimisticTokenMetadata } from '../../hooks/useTokenMetadata';
import { useUser } from '../../hooks/useUser';
import { DEFAULT_TOAST_STYLES } from '../../styles';
import { pinIPFSMetadataByAPI } from '../../utils/ipfs-metadata';
import { lowerCaseCheck } from '../../utils/string';
import {
  ActionFullContentActionContainer,
  ActionFullContentCenterContainer,
  ActionFullContentContainer,
} from '../actions/common';
import { ConnectWalletAction } from '../actions/connectWallet';
import { StateAction } from '../actions/state';
import { UserAvatar } from '../avatar';
import { SplitFullPageContent } from '../content';
import { Flex, FlexCenter } from '../flex';
import { GridItemContent } from '../grid/items';
import { SplitHeader } from '../header';
import { SpinnerIcon } from '../icons/spinner';
import { Tiptap } from '../tiptap/description';
import { AddressPill } from '../web3Status';
import { PrimaryRowActionButton } from './panels/panel';

const StyledActionFullContentCenterContainer = styled(
  ActionFullContentCenterContainer,
)``;

const AssetWell = styled(FlexCenter)`
  overflow: hidden;
  background: #f2f2f2;
`;
const ActionWell = styled.div`
  overflow: hidden;
`;

const Input = styled.input`
  outline: none;
  color: black;
  width: 100%;
  font-size: 42px;
  font-weight: bold;
  border: none;
  ::placeholder {
    color: black;
    opacity: 0.3;
  }
`;

const AuthorLabel = styled.p`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  padding: 0;
  margin: 0;
`;

export const Edit = () => {
  const account = usePriorityAccount();
  const owner = useOwnerByContext();
  const isOwner = useMemo(
    () => lowerCaseCheck(owner, account),
    [owner, account],
  );
  const isHistorianOrScribe = useCurrentUserHasEitherRoles([
    'historian',
    'scribe',
  ]);
  const isWritable = useMemo(
    () => isHistorianOrScribe || isOwner,
    [isHistorianOrScribe, isOwner],
  );
  const { bestName } = useUser(account) ?? {};
  const { name, description } = useUserAddedMetadataByContext() ?? {};
  const { descriptionHtml } = useTokenMetadataByContext() ?? {};

  const defaultDescription = useMemo(
    () => descriptionHtml ?? description,
    [description, descriptionHtml],
  );

  const [editedTitle, setEditedTitleTitle] = useState<string | undefined>(
    undefined,
  );
  const [editedDescription, setEditedDescription] = useState<
    string | undefined
  >(undefined);
  const [editedDescriptionHtml, setEditedDescriptionHtml] = useState<
    string | undefined
  >(undefined);

  const handleNameOnChange = useCallback((e: any) => {
    setEditedTitleTitle(e.target.value);
  }, []);

  const handleDescriptionOnChange = useCallback(
    (html: string, text: string) => {
      setEditedDescriptionHtml(html);
      setEditedDescription(text);
    },
    [],
  );

  const isTitleAndDescriptionUnchanged = useMemo(
    () =>
      (editedTitle === name || !editedTitle) &&
      (editedDescriptionHtml === defaultDescription || !editedDescriptionHtml),
    [editedTitle, editedDescriptionHtml, name, description],
  );

  useBeforeUnload(
    !isTitleAndDescriptionUnchanged,
    'You have unsaved changes, are you sure?',
  );

  const hash = useHashByContext() ?? undefined;
  const { status, createSignedMetadata, isUpdatable } =
    useWriteOptimisticTokenMetadata(hash);

  const [isLoading, setIsLoading] = useState(false);

  const updateTitleAndDescription = useCallback(async () => {
    if (!hash) {
      return;
    }
    if (isTitleAndDescriptionUnchanged) {
      return;
    }
    setIsLoading(true);
    const cid = await pinIPFSMetadataByAPI({
      title: editedTitle ?? name,
      description: editedDescription ?? description,
      descriptionHtml: editedDescriptionHtml ?? descriptionHtml ?? description,
    });
    createSignedMetadata('metadataCID', cid);
  }, [
    isTitleAndDescriptionUnchanged,
    hash,
    editedDescriptionHtml,
    name,
    editedTitle,
    description,
    descriptionHtml,
    editedDescription,
    createSignedMetadata,
  ]);

  useEffect(() => {
    if (status === 'in-progress') {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [status]);

  const previousStatus = usePrevious(status);
  const router = useRouter();
  useEffect(() => {
    if (status === 'success' && previousStatus !== status) {
      toast.success('Metadata updated.', {
        duration: 10000,
        style: DEFAULT_TOAST_STYLES,
      });
      router.push(`${ROUTES.ART.INDEX}/${hash}`);
    }
  }, [previousStatus, status]);

  return (
    <SplitFullPageContent>
      <SplitHeader />
      <AssetWell>
        <GridItemContent width={`calc(50vw - 500px)`} />
      </AssetWell>
      <ActionWell>
        {isWritable && (
          <ActionFullContentContainer>
            <StyledActionFullContentCenterContainer>
              <Input
                type={'text'}
                placeholder={`Historic ETH TX`}
                onChange={handleNameOnChange}
                value={editedTitle ?? name}
                disabled={isLoading}
              />
              <Flex style={{ padding: '20px 0' }}>
                <div>
                  <UserAvatar user={account} />
                </div>
                <AuthorLabel style={{ margin: '0 10px 0 6px' }}>
                  {bestName}
                </AuthorLabel>
                <AddressPill>{account?.slice(0, 6)}</AddressPill>
              </Flex>
              <Tiptap
                disabled={isLoading}
                defaultContent={defaultDescription}
                onChange={handleDescriptionOnChange}
              />
            </StyledActionFullContentCenterContainer>
            <ActionFullContentActionContainer>
              <PrimaryRowActionButton
                onClick={updateTitleAndDescription}
                disabled={isLoading || isTitleAndDescriptionUnchanged}
              >
                {isLoading ? <SpinnerIcon /> : 'Save Metadata'}
              </PrimaryRowActionButton>
            </ActionFullContentActionContainer>
          </ActionFullContentContainer>
        )}
        {!isWritable && !account && (
          <ConnectWalletAction
            title={'Connect wallet'}
            description={
              'If you are the owner or part of HistoriansDAO, you can edit the title + description.'
            }
          />
        )}
        {!isWritable && !!account && (
          <StateAction
            title={"You can't edit this HASH"}
            description={'Only the owner or HistoriansDAO can edit.'}
          />
        )}
      </ActionWell>
    </SplitFullPageContent>
  );
};
