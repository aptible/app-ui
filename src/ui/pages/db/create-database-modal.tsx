import { useRef, useState } from 'react';
import {
  Modal,
  ModalHeading,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  FormGroup,
  Feedback,
  FormGroups,
  Select,
  SelectOption,
} from '../../shared';
import type { DeployDatabase } from '@app/types';

type Props = {
  onCancel: () => void;
  onSubmit: (database: DeployDatabase) => void;
  isOpen: boolean;
};

const DEFAULT_FEEDBACK = { message: '', variant: 'info' } as Feedback;

export function CreateDatabaseModal({ onCancel, onSubmit, isOpen }: Props) {
  const databaseTypes = [
    {
      label: 'PostgreSQL',
      value: 'postgres',
    },
    {
      label: 'MySQL',
      value: 'mysql',
    },
    {
      label: 'Redis',
      value: 'redis',
    },
  ] as SelectOption[];
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
    const newDatabase = { handle: 'test ' } as DeployDatabase;
    onSubmit(newDatabase);
  }

  function onCancelClick() {
    onCancel();
  }

  // Handle
  // Type
  // Version
  // Instance Class
  // Container Size
  // Disk Size

  return (
    <Modal isOpen={isOpen} onClose={undefined} initialFocus={firstInputRef}>
      <ModalHeading
        title={'Create an Database'}
        description={'Databases provide data persistency on Aptible.'}
        onClose={onCancelClick}
      />
      <ModalBody>
        <FormGroups>
          <FormGroup
            label="Database Handle"
            htmlFor="db-handle"
            feedbackMessage={feedback.message}
            feedbackVariant={feedback.variant}
            description="Lowercase alpha-numerics only"
          >
            <Input
              ref={firstInputRef}
              type="text"
              name="db-handle"
              className="w-full"
              value={handle}
              onChange={(e) => updateHandle(e.target.value as string)}
              id="app-handle"
            />
          </FormGroup>

          <FormGroup
            label="Type"
            htmlFor="db-type"
            feedbackMessage={feedback.message}
            feedbackVariant={feedback.variant}
            description="8 types supported"
          >
            <Select
              options={databaseTypes}
              label="Select a type..."
              onSelect={console.log}
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
