import React from 'react';

import { Box, Heading, Button } from '@aptible/arrow-ds';

export const SSHSettingsPage = () => {
  return (
    <Box className="p-4">
      <Heading.H1>SSH Settings</Heading.H1>
      <Button>Add another SSH key</Button>
    </Box>
  );
};
