import download from 'downloadjs';
import { useCallback, useMemo, useState } from 'react';
export const useDownloadFile = (file?: string, name: string = 'file') => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (isDownloading) {
      return;
    }
    if (!file) {
      return;
    }
    setIsDownloading(true);
    const res = await fetch(file);
    setIsDownloading(false);
    if (res.ok) {
      download(await res.blob(), `${name}.jpeg`);
    }
  }, [isDownloading, file, name]);

  const state = useMemo(() => {
    return {
      isDownloading,
      handleDownload,
    };
  }, [isDownloading, handleDownload]);

  return state;
};
