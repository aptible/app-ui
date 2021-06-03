import React from 'react';
import classNames from 'classnames';
import { Box, Flex } from '@aptible/arrow-ds';

interface ProgressProps {
  steps: number;
  currentStep: number;
}

export const Progress = ({ steps, currentStep }: ProgressProps) => {
  const stepsArray = [...new Array(steps).keys()];

  return (
    <Flex className="progress brand-dark-form__progress">
      {stepsArray.map((item, index) => (
        <Box
          className={classNames(
            'progress-dot',
            currentStep - 1 === index && 'isActive',
          )}
          key={item}
        />
      ))}
    </Flex>
  );
};
