import { useState, useEffect } from 'react';

export function useLoaderSuccess(
  cur: { loading: boolean; success: boolean },
  success: () => any,
) {
  const [prev, setPrev] = useState(cur);
  useEffect(() => {
    const curSuccess = !cur.loading && cur.success;
    if (prev.loading && curSuccess) success();
    setPrev(cur);
  }, [cur]);
}
