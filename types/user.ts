export interface PlaceBidAlertActivity {
  type: 'place-bid';
  maker: string;
  amount: number;
  amountSymbol: string;
}

export interface FilledSaleAlertActivity {
  type: 'filled-sale';
  taker: string;
  amount: number;
  amountSymbol: string;
}

export type AlertActivity = FilledSaleAlertActivity | PlaceBidAlertActivity;

export interface UserMetadata {
  isTwitterLinked?: boolean;
  twitterProfileId?: string;
  username?: string;
  profileImage?: string;
  address?: string;
  roles?: { [key: string]: boolean };
}

export interface UserMetadataWithAddress extends UserMetadata {
  address: string;
}
