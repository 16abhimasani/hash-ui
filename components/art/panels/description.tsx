import Link from 'next/link';
import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import { usePriorityAccount } from '../../../connectors/priority';
import { NULL_ADDRESS } from '../../../constants';
import { ROUTES } from '../../../constants/routes';
import { useCurrentUserHasEitherRoles } from '../../../contexts/auth';
import {
  useHashByContext,
  useMinterByContext,
  useOwnerByContext,
  useTagsByContext,
  useTokenIdByContext,
  useTokenMetadataByContext,
  useUserAddedMetadataByContext,
} from '../../../contexts/token';
import { useWriteUserAddedMetadata } from '../../../hooks/useUserAddedMetadata';
import { BREAKPTS } from '../../../styles';
import { lowerCaseCheck } from '../../../utils/string';
import {
  ActionDropdown,
  DropdownAction,
  DropdownActionDescription,
  DropdownActionsListContainer,
} from '../../actionsDropdown';
import { CleanAnchor } from '../../anchor';
import { RoundIconButton } from '../../button';
import { Flex, FlexEnds } from '../../flex';
import { EllipsisIcon } from '../../icons/ellipsis';
import { Tag, Tags } from '../../tag';
import { Tiptap } from '../../tiptap/description';
import { UserCell } from '../../userCell';

const DescriptionContainer = styled.div`
  @media (max-width: ${BREAKPTS.SM}px) {
    margin-top: 8px;
    margin-bottom: 24px;
  }
`;

const HeaderContainer = styled.div``;

const DetailsTitle = styled.h4`
  padding: 0;
  margin: 0;
  word-wrap: break-word;
  font-size: 42px;
  font-weight: bold;
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 36px;
  }
`;

const TagsWrapper = styled.div`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  line-height: 13px;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.25);
  margin-bottom: 32px;
  margin-top: 32px;
`;

const manageButton = (onClick: () => void) => (
  <RoundIconButton onClick={onClick}>
    <EllipsisIcon />
  </RoundIconButton>
);

const RelatedAccountsRow: FC<{}> = ({}) => {
  const userAddedMetadata = useUserAddedMetadataByContext();
  const minter = useMinterByContext();
  const owner = useOwnerByContext();
  const account = usePriorityAccount();
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

  const tokenId = useTokenIdByContext();
  const hash = useHashByContext();
  const tokenMetadata = useTokenMetadataByContext();

  const {
    submitOptimisticTitleAndDescription,
    isOptimisticSubmittableOnChain,
    onChainError,
    onChainStatus,
  } = useWriteUserAddedMetadata(
    hash ?? undefined,
    tokenId ?? undefined,
    tokenMetadata,
  );

  const isOnChainActionDisabled = useMemo(() => {
    return (
      !isOptimisticSubmittableOnChain ||
      onChainStatus === 'in-progress' ||
      onChainStatus === 'success'
    );
  }, [onChainStatus, isOptimisticSubmittableOnChain]);

  const onChainButtonTitle = useMemo(() => {
    if (onChainStatus === 'in-progress') {
      return 'Moving on-chain...';
    }
    if (onChainStatus === 'failed' || !!onChainError) {
      return 'Error. Try Again?';
    }
    if (onChainStatus === 'success' && isOnChainActionDisabled) {
      return 'Move Metadata On-Chain';
    }
    return 'Move Metadata On-Chain';
  }, [onChainStatus, onChainError, isOnChainActionDisabled]);

  return (
    <FlexEnds>
      <Flex style={{ height: 49 }}>
        {!!minter && <UserCell user={minter} label={'minter'} />}
        {userAddedMetadata?.writer !== undefined &&
          userAddedMetadata?.writer !== NULL_ADDRESS && (
            <UserCell user={userAddedMetadata?.writer} label={'writer'} />
          )}
      </Flex>
      {isWritable && (
        <ActionDropdown enable={true} button={manageButton}>
          {(onClick: () => void, isOpen?: boolean) => (
            <DropdownActionsListContainer>
              <CleanAnchor
                href={`${ROUTES.ART.INDEX}/${hash}${ROUTES.ART.HASH.EDIT}`}
              >
                <DropdownAction title={'Edit Title & Description'}>
                  <DropdownActionDescription>
                    Owners and HistoriansDAO can update the primary metadata for
                    a HASH at anytime.
                  </DropdownActionDescription>
                </DropdownAction>
              </CleanAnchor>

              {isOptimisticSubmittableOnChain && isOwner && (
                <DropdownAction
                  onClick={submitOptimisticTitleAndDescription}
                  disabled={isOnChainActionDisabled}
                  title={onChainButtonTitle}
                >
                  <DropdownActionDescription>
                    Submit the metadata associated with this HASH to the
                    on-chain registry.
                  </DropdownActionDescription>
                </DropdownAction>
              )}
            </DropdownActionsListContainer>
          )}
        </ActionDropdown>
      )}
    </FlexEnds>
  );
};

export const ArtworkDescription: FC = () => {
  const userAddedMetadata = useUserAddedMetadataByContext();
  const tokenMetadata = useTokenMetadataByContext();
  const tags = useTagsByContext();
  const hash = useHashByContext();
  const tagProps: { tag: string; href: string }[] | undefined = useMemo(() => {
    return tags?.map((t) => ({
      tag: t,
      href: `/tags`,
    }));
  }, [tags]);

  return (
    <ArtworkDescriptionContainer>
      <HeaderContainer style={{ marginBottom: 10 }}>
        <DetailsTitle>{userAddedMetadata?.name}</DetailsTitle>
      </HeaderContainer>
      <DescriptionContainer style={{ marginBottom: 32 }}>
        <Tiptap
          // key={`tip-tap-description-${hash}`}
          disabled={true}
          placeholder="No description set"
          defaultContent={
            tokenMetadata?.descriptionHtml ?? userAddedMetadata?.description
          }
        />
      </DescriptionContainer>
      <RelatedAccountsRow />
      {tagProps && tagProps.length > 0 && (
        <TagsWrapper>
          Tags
          <Tags style={{ marginTop: 8 }}>
            {tagProps.map(
              ({ tag, href }: { tag: string; href: string }, index: number) => {
                return (
                  <React.Fragment key={`tag-${tag}-${index}`}>
                    <Link href={href} passHref>
                      <CleanAnchor>
                        <Tag>{tag}</Tag>
                      </CleanAnchor>
                    </Link>
                  </React.Fragment>
                );
              },
            )}
          </Tags>
        </TagsWrapper>
      )}
    </ArtworkDescriptionContainer>
  );
};

export const ArtworkDescriptionContainer = styled.div`
  padding: 0 20px;
  padding-bottom: 20px;
`;
