import produce from 'immer';
import create from 'zustand';
import { UserMetadata } from '../types/user';

type State = {
  addressToUserMetadata: { [address: string]: UserMetadata };
  setUserMetadata: (address: string, userMetadata: UserMetadata) => void;
};

export const useUserMetadataStore = create<State>((set) => ({
  addressToUserMetadata: {},
  setUserMetadata: (address: string, userMetadata: UserMetadata) => {
    set(
      produce((update) => {
        update.addressToUserMetadata[address] = userMetadata;
      }),
    );
  },
}));
