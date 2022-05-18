import { useRef, useState } from 'react';

import { DeployApp } from '@app/types';
import { defaultDeployApp } from '@app/deploy';

import {
  Modal,
  ModalHeading,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  FormGroup,
  FormGroups,
  Feedback,
} from '../../shared';

type Props = {
  onCancel: () => void;
  onSubmit: (app: DeployApp) => void;
  isOpen: boolean;
};

const DEFAULT_FEEDBACK = { message: '', variant: 'info' } as Feedback;

export function CreateAppModal({ onCancel, onSubmit, isOpen }: Props) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [handle, setHandle] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(DEFAULT_FEEDBACK);

  function updateHandle(nextHandle: string) {
    if (nextHandle.length < 4) {
      setFeedback({
        message: 'Handle must be 4 chars or longer',
        variant: 'danger',
      });
    } else {
      setFeedback(DEFAULT_FEEDBACK);
    }

    setHandle(nextHandle);
  }

  function onSubmitClick() {
    // Create app and then close modal;
    const newApp = defaultDeployApp({ handle: 'test ' });
    onSubmit(newApp);
  }

  function onCancelClick() {
    onCancel();
  }

  return (
    <Modal isOpen={isOpen} onClose={onCancelClick} initialFocus={firstInputRef}>
      <ModalHeading
        title={'Create an App'}
        description={
          'Apps are how you deploy your code on Aptible. Eventually, your Apps are deployed as one or more Containers.'
        }
        onClose={onCancelClick}
      />
      <ModalBody>
        <FormGroups>
          <FormGroup
            label="App Handle"
            htmlFor="app-handle"
            feedbackMessage={feedback.message}
            feedbackVariant={feedback.variant}
            description="Lowercase alpha-numerics only"
          >
            <Input
              ref={firstInputRef}
              type="text"
              name="app-handle"
              className="w-full"
              value={handle}
              onChange={(e) => updateHandle(e.target.value as string)}
              id="app-handle"
            />
          </FormGroup>
        </FormGroups>
      </ModalBody>

      <ModalFooter
        actions={[
          <Button type="submit" variant="primary" onClick={onSubmitClick}>
            Submit
          </Button>,
          <Button type="submit" variant="white" onClick={onCancelClick}>
            Cancel
          </Button>,
        ]}
      />
    </Modal>
  );
}
