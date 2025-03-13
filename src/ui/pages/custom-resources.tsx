import { fetchCustomResources } from "@app/deploy/custom-resource";
import { useQuery } from "@app/react";
import { AppSidebarLayout } from "../layouts";
import { TitleBar } from "../shared";

export const CustomResourcesPage = () => {
  // Fetch custom resources data
  useQuery(fetchCustomResources());

  return (
    <AppSidebarLayout>
      <TitleBar description="Manage your custom resources.">
        Custom Resources
      </TitleBar>
      <h1 className="text-2xl font-bold mt-8 mb-4">Custom Resources</h1>
    </AppSidebarLayout>
  );
};
