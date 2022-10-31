import { useCallback, useEffect, useState } from 'react';
import { usePrevious } from 'react-use';

export const useLocalStorage = (
  key: string,
  initialValue: any,
  lifeSpan = Infinity,
) => {
  const getValue = () => {
    try {
      const item = window.localStorage.getItem(key);
      const stampedValue = JSON.parse(item ?? '{}');
      const JSONValue =
        stampedValue &&
        stampedValue.expire > Date.now() &&
        JSON.parse(stampedValue.JSONValue);

      return JSONValue || initialValue;
    } catch (error) {
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState(getValue);

  const previousKey = usePrevious(key);
  useEffect(() => {
    if (previousKey !== key) {
      setStoredValue(getValue());
    }
  }, [key, previousKey]);

  const setValue = useCallback(
    (value) => {
      try {
        const expire = Date.now() + lifeSpan;
        const JSONValue = JSON.stringify(value);
        const stampedValue = { expire, JSONValue };

        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(stampedValue));
      } catch (error) {
        console.log(error);
      }
    },
    [key, lifeSpan],
  );

  const clearValue = useCallback(() => {
    try {
      console.log('clearValue', key);
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.log(error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, clearValue];
};
