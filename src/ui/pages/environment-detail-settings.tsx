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
} from "../shared";
import {
  deprovisionApp,
  fetchApp,
  selectAppById,
  selectEnvironmentById,
} from "@app/deploy";
import { AppState } from "@app/types";
import { SyntheticEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";

export const EnvironmentSettingsPage = () => {
  const [handle, setHandle] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const dispatch = useDispatch();

  const { id = "" } = useParams();
  useQuery(fetchApp({ id }));
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id }),
  );

  useEffect(() => {
    setHandle(environment.handle);
  }, [environment.id]);

  const onSubmitForm = (e: SyntheticEvent) => {
    e.preventDefault();
  };

  const requestDeprovisionApp = (e: SyntheticEvent) => {
    e.preventDefault();

    setIsDeleting(true);
  };

  const disabledDeleting =
    isDeleting || "delete" !== deleteConfirm.toLocaleLowerCase();

  return (
    <div className="mb-4">
      <Box>
        <Button className="relative float-right" variant="white">
          View Docs
          <IconExternalLink className="inline ml-3 h-5 mt-0" />
        </Button>
        <h1 className="text-lg text-gray-500">Environment Settings</h1>
        <br />
        <form onSubmit={onSubmitForm}>
          <FormGroup label="Mode" htmlFor="input-mode">
            <p className="mb-4">
              {environment.type === "development" ? "Debug" : "Production"}
            </p>
          </FormGroup>
          <FormGroup label="Environment Name" htmlFor="input-name">
            <Input
              className="mb-4"
              name="env-handle"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.currentTarget.value)}
              autoComplete="name"
              data-testid="input-name"
              id="input-name"
            />
          </FormGroup>
          <FormGroup label="Environment ID" htmlFor="input-mode">
            <p className="mb-4">
              {environment.id}{" "}
              <IconCopy className="inline h-4" color="#888C90" />
            </p>
          </FormGroup>
          <FormGroup label="Thumbnail Image" htmlFor="thumbnail">
            <div className="flex justify-between items-center">
              <select
                value={"test"}
                className="mb-2 w-full appearance-none block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="select"
                disabled
              >
                <option value="test" disabled>
                  Some Icon
                </option>
              </select>
            </div>
          </FormGroup>
          <br />
          <hr />
          <br />
          <div className="flex mt-4">
            <Button className="w-40 mb-4 flex semibold" onClick={() => {}}>
              Save Changes
            </Button>
            <Button
              className="w-40 ml-4 mb-4 flex"
              onClick={() => {}}
              variant="white"
            >
              <span className="text-base semibold">Cancel</span>
            </Button>
          </div>
        </form>
      </Box>
      <Box>
        <h1 className="text-lg text-red-500 font-semibold">
          <IconAlertTriangle
            className="inline pr-3 mb-1"
            style={{ width: 32 }}
            color="#AD1A1A"
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
      </Box>
    </div>
  );
};
