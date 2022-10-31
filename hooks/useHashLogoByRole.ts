import { useMemo } from 'react';
import { DaoRole } from '../types/dao';

export const useHashLogoByRole = (daoRole?: DaoRole) => {
  return useMemo(() => {
    if (daoRole === 'hunter') {
      return '/assets/logos/hash-orange.png';
    }
    if (daoRole === 'scribe') {
      return '/assets/logos/hash-orange.png';
    }
    if (daoRole === 'historian') {
      return '/assets/logos/hash-green.png';
    }
    return undefined;
  }, [daoRole]);
};
