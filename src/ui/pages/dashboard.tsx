import { dashboardUrl } from "@app/routes";
import { Link } from "react-router-dom";
import { AppSidebarLayout } from "../layouts";
import {
  ActionBar,
  Banner,
  ButtonLink,
  DescBar,
  FilterBar,
  Group,
  IconPlusCircle,
  InputSearch,
  TBody,
  THead,
  Table,
  Td,
  Th,
  TitleBar,
  Tr,
  tokens,
} from "../shared";

export const DashboardPage = () => {
  return (
    <AppSidebarLayout>
      <TitleBar description="Get Support from the Aptible team">
        Home
      </TitleBar>
    </AppSidebarLayout>
  );
};
