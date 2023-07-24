import { getEndpointText } from "@app/deploy";
import { DeployEndpoint } from "@app/types";

import { Box } from "./box";
import { EndpointStatusPill } from "./endpoint";
import { IconArrowRight } from "./icons";
import { EmptyResultView } from "./resource-list-view";

const EndpointListing = ({
  endpoint,
  parent,
}: { endpoint: DeployEndpoint; parent: string }) => {
  const txt = getEndpointText(endpoint, []);
  return (
    <div className="mx-auto w-full py-2">
      <Box>
        <div className="flex">
          <EndpointStatusPill status={endpoint.status} />
          {endpoint.status === "provisioning" ? null : (
            <div className="flex justify-between">
              <div className="flex ml-4 text-gray-500 text-md">
                {parent}
                <IconArrowRight
                  className="inline mx-2 mt-1"
                  color="#6b7280"
                  style={{ height: 18, width: 18 }}
                />
                {endpoint.type === "tcp"
                  ? endpoint.externalHost
                  : endpoint.virtualDomain}
              </div>

              <div />
            </div>
          )}
        </div>
        <div className="flex">
          <div className="flex-col w-1/2">
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                Hostname
              </h3>
              {endpoint.status === "provisioning" ? (
                <p className="text-gray-500 italic">Provisioning</p>
              ) : endpoint.type === "tcp" ? (
                endpoint.externalHost
              ) : (
                <p>
                  <a
                    href={`https://${endpoint.virtualDomain}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    https://{endpoint.virtualDomain}
                  </a>
                </p>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                Placement
              </h3>
              <p>{txt.placement}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                Platform
              </h3>
              <p>{endpoint.platform.toLocaleUpperCase()}</p>
            </div>
          </div>
          <div className="flex-col w-1/2">
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                IP Filtering
              </h3>
              <p>{txt.ipAllowlist}</p>
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
};

export const EndpointsOverview = ({
  endpoints,
  parent,
  action,
}: {
  endpoints: DeployEndpoint[];
  parent: string;
  action?: JSX.Element;
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">{action}</div>
      {endpoints.map((endpoint) => (
        <EndpointListing
          endpoint={endpoint}
          key={endpoint.id}
          parent={parent}
        />
      ))}
    </div>
  );
};

export function EndpointsView({
  endpoints,
  parent,
}: { endpoints: DeployEndpoint[]; parent: string }) {
  if (!endpoints.length) {
    return (
      <EmptyResultView
        title="No endpoints yet"
        description="Expose this application to the public internet by adding an endpoint"
        className="p-6 w-100"
      />
    );
  }

  return (
    <div className="mt-3">
      <EndpointsOverview endpoints={endpoints} parent={parent} />
    </div>
  );
}
