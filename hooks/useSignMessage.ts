import { useCallback } from 'react';
import {
  usePriorityAccount,
  usePriorityProvider,
} from '../connectors/priority';

export const useSignMessage = () => {
  const account = usePriorityAccount();
  const library = usePriorityProvider();
  return useCallback(
    async (msg: string) => {
      if (!account || !library) {
        return undefined;
      }
      const signature = await library.send('personal_sign', [
        msg,
        account.toLowerCase(),
      ]);
      return signature;
    },
    [account, library],
  );
};
