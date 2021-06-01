export const namespace = 'ads';

export interface BemOptions {
  e?: string;
  m?: string;
}

export const bem = (
  b: string,
  options?: {
    e?: string;
    m?: string;
  },
): string => {
  const block = `${namespace}-${b}`;
  const element = options && options.e ? `-${options.e}` : '';
  const modifier = options && options.m ? `--${options.m}` : '';

  return `${block}${element}${modifier}`;
};

export const bemHOF = (block: string) => (options?: BemOptions) =>
  bem(block, options);
