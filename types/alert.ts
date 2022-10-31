export type AlertAction =
  | 'made-offer'
  | 'create-comment'
  | 'voted-comment'
  | 'accepted-offer'
  | 'accepted-sale'
  | 'updated-metadata'
  | 'created-verdict'
  | 'voted-verdict'
  | 'hold-verdict'
  | 'list-sale';

export interface AlertWithoutCreatedAt {
  action: AlertAction;
  actor: string;
  description: string;
  link: string;
  isDismissed: boolean;
  for: string;
  hash: string;
}

export interface Alert extends AlertWithoutCreatedAt {
  createdAt: number;
}

export interface AlertWithId extends Alert {
  id: string;
}
