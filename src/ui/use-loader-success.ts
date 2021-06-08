import { useState, useEffect } from 'react';

export function useLoaderSuccess(
  cur: { isLoading: boolean; isSuccess: boolean },
  success: () => any,
) {
  const [prev, setPrev] = useState(cur);
  useEffect(() => {
    const curSuccess = !cur.isLoading && cur.isSuccess;
    if (prev.isLoading && curSuccess) success();
    setPrev(cur);
  }, [cur.isLoading, cur.isSuccess]);
}
