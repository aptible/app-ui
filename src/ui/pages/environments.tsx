import { ListingPageLayout } from "../layouts";

import {
  ButtonIcon,
  EnvironmentActivity,
  EnvironmentList,
  IconPlusCircle,
  TableHead,
} from "../shared";

export const EnvironmentsPage = () => {
  // TODO: BELOW BUTTON SUCKS, FIND A WAY TO LINE IT UP
  return (
    <ListingPageLayout>
      <div className="flex">
        <div className="mt-6 w-2/3 pr-5">
          <EnvironmentList />
        </div>
        <div className="mt-6 w-1/3">
          <ButtonIcon
            className="w-full mb-4"
            icon={<IconPlusCircle />}
            style={{
              cursor: "not-allowed",
              pointerEvents: "none",
              opacity: 0.5,
              marginBottom: "65.5px",
            }}
          >
            New Environment
          </ButtonIcon>
          <EnvironmentActivity />
        </div>
      </div>
    </ListingPageLayout>
  );
};
