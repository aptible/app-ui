import {
  Box,
  ButtonLinkExternal,
  FormGroup,
  IconExternalLink,
  Input,
} from "../shared";
import { selectEnvironmentById } from "@app/deploy";
import { AppState } from "@app/types";
import { SyntheticEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";

export const EnvironmentSettingsPage = () => {
  const [handle, setHandle] = useState<string>("");
  // const [deleteConfirm, setDeleteConfirm] = useState<string>("");
  // const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const { id = "" } = useParams();
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id }),
  );

  useEffect(() => {
    setHandle(environment.handle);
  }, [environment.id]);

  const onSubmitForm = (e: SyntheticEvent) => {
    e.preventDefault();
  };

  // const requestDeprovisionApp = (e: SyntheticEvent) => {
  //   e.preventDefault();

  //   setIsDeleting(true);
  // };

  // const disabledDeleting =
  // isDeleting || "delete" !== deleteConfirm.toLocaleLowerCase();

  return (
    <div className="mb-4">
      <Box>
        <ButtonLinkExternal
          href="https://www.aptible.com/docs/environments"
          className="relative float-right"
          variant="white"
          size="sm"
        >
          View Docs
          <IconExternalLink className="inline ml-3 h-5 mt-0" />
        </ButtonLinkExternal>
        <h1 className="text-lg text-gray-500">Environment Settings</h1>
        <br />
        <form onSubmit={onSubmitForm}>
          <FormGroup label="Environment Name" htmlFor="input-name">
            <Input
              className="mb-4"
              disabled
              name="env-handle"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.currentTarget.value)}
              autoComplete="name"
              data-testid="input-name"
              id="input-name"
            />
          </FormGroup>
          {/* <hr />
          <div className="flex mt-4">
            <Button className="w-40 mb-4 flex semibold" onClick={() => {}}>
              Save Changes
            </Button>
          </div> */}
        </form>
      </Box>
      {/* <Box>
        <h1 className="text-lg text-red-500 font-semibold">
          <IconAlertTriangle
            className="inline pr-3 mb-1"
            style={{ width: 32 }}
            color="#AD1A1A"
            disabled
          />
          Delete Environment
        </h1>
        <div className="mt-2">
          <p>
            Deleting your environment will remove your data from Aptible. If you
            want to proceed, type Delete below to continue.
          </p>
          <div className="flex mt-4 wd-60">
            <Input
              className="flex"
              disabled={isDeleting}
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
                opacity: disabledDeleting ? 0.5 : 1,
              }}
              disabled={disabledDeleting}
              className="h-15 w-60 mb-0 ml-4 flex"
              onClick={requestDeprovisionApp}
            >
              <IconTrash color="#FFF" className="mr-2" />
              {isDeleting ? "Deleting..." : "Delete Environment"}
            </Button>
          </div>
        </div>
      </Box> */}
    </div>
  );
};
