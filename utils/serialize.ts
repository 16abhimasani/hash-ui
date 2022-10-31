import { Comment, CommentVoteMetadata } from '../types/comments';
import { ListWithId } from '../types/list';
import { FirestoreToken } from '../types/metadata';
import { SignedOrderWithCidAndOrderStatus } from '../types/trader';

export const serializeSignedOrderFromFirebase = (order?: any) => {
  return {
    ...order,
    createdAt: order?.createdAt?._seconds ?? order?.createdAt?.seconds ?? null,
    filledAt: order?.filledAt?._seconds ?? order?.filledAt?.seconds ?? null,
    lastActivityAt:
      order?.lastActivityAt?._seconds ?? order?.lastActivityAt?.seconds ?? null,
  } as SignedOrderWithCidAndOrderStatus;
};

export const serializeFirestoreToken = (metadata: any) => {
  return {
    ...metadata,
    bestOrderToDisplay: serializeSignedOrderFromFirebase(
      metadata?.bestOrderToDisplay,
    ),
    bestFilledOrderToDisplay: serializeSignedOrderFromFirebase(
      metadata?.bestFilledOrderToDisplay,
    ),
    mintedAt: metadata?.mintedAt?._seconds ?? null,
  } as Partial<FirestoreToken>;
};

export const serializeList = (metadata: any) => {
  return {
    ...metadata,
    createdAt:
      metadata?.createdAt?._seconds ?? metadata?.createdAt?.seconds ?? null,
  } as ListWithId;
};

export const serializeCommentVoteMetadata = (metadata: any) => {
  return {
    ...metadata,
    createdAt:
      metadata?.createdAt?._seconds ?? metadata?.createdAt?.seconds ?? null,
  } as CommentVoteMetadata;
};

export const serializeComment = (metadata: any) => {
  return {
    ...metadata,
    createdAt:
      metadata?.createdAt?._seconds ?? metadata?.createdAt?.seconds ?? null,
    lastEditedAt:
      metadata?.lastEditedAt?._seconds ??
      metadata?.lastEditedAt?.seconds ??
      null,
  } as Comment;
};
