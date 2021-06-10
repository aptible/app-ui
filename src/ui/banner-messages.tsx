import React from 'react';

import { Banner, Box, STATUS_VARIANT } from '@aptible/arrow-ds';

export const BannerMessages = (loader: {
  isSuccess: boolean;
  isError: boolean;
  message: string;
}) => {
  return (
    <Box>
      {loader.isSuccess ? (
        <Banner variant={STATUS_VARIANT.SUCCESS}>
          Success! {loader.message}
        </Banner>
      ) : null}
      {loader.isError ? (
        <Banner variant={STATUS_VARIANT.DANGER}>{loader.message}</Banner>
      ) : null}
    </Box>
  );
};
