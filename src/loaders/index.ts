import { schema } from "@app/schema";
import {
  LoaderState,
  LoadingStatus,
  createSelector,
  defaultLoader,
} from "starfx";

export const selectIsAnyLoading = createSelector(
  schema.loaders.selectTableAsList,
  (loaders) => {
    for (let i = 0; i < loaders.length; i += 1) {
      if (loaders[i].status === "loading") {
        return true;
      }
    }
    return false;
  },
);

export const findLoaderComposite = (loaders: LoaderState[]) => {
  const sorted = [...loaders].sort((a, b) => {
    return new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime();
  });

  const mapper: Record<LoadingStatus, LoaderState[]> = {
    loading: [],
    success: [],
    error: [],
    idle: [],
  };
  sorted.forEach((loader) => {
    mapper[loader.status].push(loader);
  });

  // this shouldn't happen
  if (sorted.length === 0) {
    return defaultLoader();
  }

  if (sorted.length === 1) {
    return sorted[0];
  }

  const id = sorted
    .map((ldr) => ldr.id)
    .filter(Boolean)
    .join(";");

  // if any loaders in composite or still loading, return that
  if (mapper.loading.length > 0) {
    return defaultLoader({ ...mapper.loading[0], id });
  }

  // if there is nothing loading and we detect an error inside a loader, return that
  // with a composite of the error messages for all loader errors
  if (mapper.error.length > 0) {
    const ldr = defaultLoader({ ...mapper.error[0], id });
    const msg = mapper.error
      .map((loader) => loader.message)
      .filter(Boolean)
      .join(", ");
    ldr.message = msg;
    return ldr;
  }

  // if there is nothing loading and there are no errors, return success
  if (mapper.success.length > 0) {
    const ldr = defaultLoader({ ...mapper.success[0], id });
    const msg = mapper.success
      .map((loader) => loader.message)
      .filter(Boolean)
      .join(", ");
    ldr.message = msg;
    return ldr;
  }

  if (mapper.idle.length > 0) {
    // at this point we must have at least one idle loader, so return that
    return defaultLoader({ ...mapper.idle[0], id });
  }

  // this should't happen
  return sorted[0];
};

export const selectLoaderComposite = createSelector(
  schema.loaders.selectByIds,
  findLoaderComposite,
);
