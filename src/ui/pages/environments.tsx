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
        <div className="mt-6 w-1/3 flex flex-col">
          <div className="flex flex-row place-content-center">
            <ButtonIcon
              className="w-auto mb-4 pl-8 pr-8 "
              icon={<IconPlusCircle />}
              style={{
                cursor: "not-allowed",
                pointerEvents: "none",
                opacity: 0.5,
                marginBottom: "45.5px",
              }}
            >
              New Environment
            </ButtonIcon>
          </div>
          <EnvironmentActivity />
        </div>
      </div>
    </ListingPageLayout>
  );
};
