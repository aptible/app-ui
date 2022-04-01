import classNames from 'classnames';

interface ProgressProps {
  steps: number;
  currentStep: number;
}

export const Progress = ({ steps, currentStep }: ProgressProps) => {
  const stepsArray = [...new Array(steps).keys()];

  return (
    <div className="flex progress brand-dark-form__progress">
      {stepsArray.map((item, index) => (
        <div
          className={classNames(
            'progress-dot',
            currentStep - 1 === index && 'isActive',
          )}
          key={item}
        />
      ))}
    </div>
  );
};
