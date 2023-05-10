import { Box, Button, FormGroup, Input } from "../shared";
import {
  fetchDatabase,
  fetchService,
  selectDatabaseById,
  selectServiceById,
} from "@app/deploy";
import { AppState } from "@app/types";
import { SyntheticEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";

export const DatabaseScalePage = () => {
  const { id = "" } = useParams();
  useQuery(fetchDatabase({ id }));
  const [containerCount, setContainerCount] = useState(1);
  const database = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  useQuery(fetchService({ id: database.serviceId }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: database.serviceId }),
  );

  const onSubmitForm = (e: SyntheticEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (service.containerCount) {
      setContainerCount(service.containerCount);
    }
  }, [database]);

  return (
    <div className="my-4">
      <Box>
        <form onSubmit={onSubmitForm}>
          <div className="mb-4">
            <div className="mb-4">
              <FormGroup
                splitWidthInputs
                description="Optimize container performance with a custom profile."
                label="Container Profile"
                htmlFor="container-profile"
              >
                <div className="flex justify-between items-center mb-4 w-full">
                  <select
                    value={"test"}
                    className="mb-2 w-full appearance-none block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                    placeholder="select"
                    disabled
                  >
                    <option value="test" disabled>
                      General Purpose (M)
                    </option>
                  </select>
                </div>
              </FormGroup>
            </div>
            <div className="mb-4">
              <FormGroup
                splitWidthInputs
                description="Horizontally scale this service by increasing the number of containers. A count of 2 or more will provide High Availability. 32 max count for General Purpose (M) profiles."
                label="Number of Containers"
                htmlFor="number-containers"
              >
                <div className="flex justify-between items-center mb-4 w-full">
                  <Input
                    className="flex w-full"
                    name="number-containers"
                    type="number"
                    value={containerCount}
                    min={1}
                    onChange={(e) =>
                      setContainerCount(parseInt(e.currentTarget.value, 10))
                    }
                    data-testid="number-containers"
                    id="number-containers"
                  />
                </div>
              </FormGroup>
            </div>
            <div className="mb-4">
              <FormGroup
                splitWidthInputs
                description="Specify the memory you wish to allow per container."
                label="Memory per Container"
                htmlFor="memory-container"
              >
                <div className="flex justify-between items-center mb-4 w-full">
                  <select
                    value={"test"}
                    className="mb-2 w-full appearance-none block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                    placeholder="select"
                    disabled
                  >
                    <option value="test" disabled>
                      1 GB
                    </option>
                  </select>
                </div>
              </FormGroup>
            </div>
            <div className="mb-4">
              <FormGroup
                splitWidthInputs
                description="CPU Share is determined by the selected Memory Limit and Container Profile."
                label="CPU Share per Container"
                htmlFor="cpu-share"
              >
                <div className="flex justify-between items-center mb-4 w-full">
                  <Input
                    className="flex disabled w-full"
                    name="number-containers"
                    type="text"
                    disabled
                    value={"0.25"}
                    min={1}
                    data-testid="number-containers"
                    id="number-containers"
                  />
                </div>
              </FormGroup>
            </div>
          </div>
          <hr />
          <div className="flex mt-4">
            <Button className="w-40 mb-4 flex font-semibold" onClick={() => {}}>
              Save Changes
            </Button>
            <Button
              className="w-40 ml-4 mb-4 flex"
              onClick={() => {}}
              variant="white"
            >
              <span className="text-base font-semibold">Cancel</span>
            </Button>
          </div>
        </form>
      </Box>
    </div>
  );
};
