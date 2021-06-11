import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LoadingState } from 'robodux';

import { AppState } from '@app/types';
import { selectLoader } from '@app/loaders';
import { selectDataById } from '@app/api';

type Data<D = any> = LoadingState & { data: D };

export function useData<D = any>(
  action: {
    payload: { name: string };
  },
  depend: string,
): Data<D> {
  const { name } = action.payload;
  const id = JSON.stringify(action);
  const dispatch = useDispatch();
  const loader = useSelector(selectLoader(name));
  const data = useSelector((s: AppState) => selectDataById(s, { id }));

  useEffect(() => {
    if (!name || !depend) return;
    dispatch(action);
  }, [id, name, depend]);

  return { ...loader, data };
}
