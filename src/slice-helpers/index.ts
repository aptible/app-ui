import type { Reducer } from '@reduxjs/toolkit';
export { createAction } from '@reduxjs/toolkit';

export * from './create-table';
export * from './create-assign';

export function createReducerMap<
  KV extends Array<{ name: P; reducer: Reducer }>,
  P extends keyof any,
>(
  ...args: KV
): { [K in KV[number]['name']]: Extract<KV[number], { name: K }>['reducer'] };
export function createReducerMap(...args: any[]): any {
  return args.reduce((acc, slice) => {
    if (acc.hasOwnProperty(slice.name)) {
      console.warn(`Reducer collision detected: ${slice.name} already exists`);
    }
    acc[slice.name] = slice.reducer;
    return acc;
  }, {});
}
