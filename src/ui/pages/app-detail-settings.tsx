import { fetchApp, selectAppById } from "@app/deploy";
import { AppState } from "@app/types";
import { SyntheticEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";
import {
  Box,
  Button,
  ButtonIcon,
  FormGroup,
  IconAlertTriangle,
  IconCopy,
  IconExternalLink,
  IconPlusCircle,
  IconTrash,
  Input,
  Label,
  PreCode,
  tokens,
} from "../shared";

export const AppSettingsPage = () => {
  const [handle, setHandle] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string>("");
  const [isDeprovisioning, setIsDeprovisioning] = useState<boolean>(false);

  const { id = "" } = useParams();
  useQuery(fetchApp({ id }));
  const app = useSelector((s: AppState) => selectAppById(s, { id }));

  useEffect(() => {
    setHandle(app.handle);
  }, [app?.id]);

  const onSubmitForm = (e: SyntheticEvent) => {
    e.preventDefault();
  };

  const deprovisionApp = (e: SyntheticEvent) => {
    e.preventDefault();

    setIsDeprovisioning(true);
  };

  const disabledDeprovisioning = isDeprovisioning || handle !== deleteConfirm;

  return (
    <div>
      <Box>
        <Button className="relative float-right" variant="white">
          View Docs
          <IconExternalLink className="inline ml-3 h-5 mt-0" />
        </Button>
        <h1 className="text-lg text-gray-500">How To Deploy Changes</h1>
        <div className="mt-4">
          <h3 className={tokens.type.h4}>Clone project code</h3>
          <PreCode allowCopy>git clone {app.gitRepo}</PreCode>
        </div>
        <div className="mt-4">
          <h3 className={tokens.type.h4}>Find project code</h3>
          <PreCode allowCopy>cd {app.handle}</PreCode>
        </div>
        <div className="mt-4">
          <h3 className={tokens.type.h4}>Deploy code changes</h3>
          <PreCode allowCopy>git push {app.gitRepo}</PreCode>
        </div>
      </Box>
      <Box>
        <h1 className="text-lg text-gray-500">App Settings</h1>
        <br />
        <form onSubmit={onSubmitForm}>
          <FormGroup label="App Name" htmlFor="input-name">
            <Input
              name="app-handle"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.currentTarget.value)}
              autoComplete="name"
              data-testid="input-name"
              id="input-name"
            />
          </FormGroup>
          <Label className="my-4">App ID</Label>
          <p>
            {app.id} <IconCopy className="inline h-4" color="#888C90" />
          </p>
          <div className="mt-4 flex" />
          <FormGroup label="Thumbnail Image" htmlFor="thumbnail">
            <div className="flex justify-between items-center">
              <select
                onChange={() => {}}
                value={"test"}
                className="mb-2"
                placeholder="select"
                disabled
              >
                <option value="test" disabled>
                  Some Icon
                </option>
              </select>
            </div>
          </FormGroup>
          <FormGroup
            label="Environment Variables"
            htmlFor="environment-variables"
          >
            <div className="flex">
              <Input
                className="flex w-1/2"
                name="app-handle"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.currentTarget.value)}
                autoComplete="name"
                data-testid="input-name"
                id="input-name"
              />
              <Input
                className="flex ml-4 w-1/2"
                name="app-handle"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.currentTarget.value)}
                autoComplete="name"
                data-testid="input-name"
                id="input-name"
              />
              <ButtonIcon
                className="flex ml-4 pr-2"
                variant="white"
                onClick={() => {}}
                icon={<IconTrash color='#AD1A1A' />}
                children={null}
              />
            </div>
            <div className="flex mt-4">
              <ButtonIcon
                icon={<IconPlusCircle color="#FFF" />}
                variant="secondary"
                onClick={() => {}}
              >
                New
              </ButtonIcon>
            </div>
          </FormGroup>
          <br />
          <hr />
          <br />
          <div className="flex">
            <Button className="w-40 mb-4 flex" onClick={() => {}}>
              Save Changes
            </Button>
            <Button
              className="w-40 ml-4 mb-4 flex"
              onClick={() => {}}
              variant="white"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Box>
      <Box>
        <h1 className="text-lg text-red-500">
          <IconAlertTriangle
            className="inline pr-3 mb-1"
            style={{ width: 32 }}
            color="#AD1A1A"
          />
          Deprovision App
        </h1>
        <div className="mt-2">
          <p>
            This will permanently deprovision <strong>{app.handle}</strong> app.
            This action cannot be undone. If you want to proceed, type Delete
            below to continue.
          </p>
          <div className="flex mt-4 wd-60">
            <Input
              className="flex"
              disabled={isDeprovisioning}
              name="delete-confirm"
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.currentTarget.value)}
              data-testid="delete-confirm"
              id="delete-confirm"
            />
            <Button
              variant="secondary"
              style={{
                backgroundColor: "#AD1A1A",
                color: "#FFF",
                opacity: disabledDeprovisioning ? 0.5 : 1,
              }}
              disabled={disabledDeprovisioning}
              className="h-15 w-60 mb-0 ml-4 flex"
              onClick={deprovisionApp}
            >
              <IconTrash color="#FFF" className="mr-2" />
              {isDeprovisioning ? "Deprovisioning..." : "Deprovision App"}
            </Button>
          </div>
        </div>
      </Box>
    </div>
  );
};
