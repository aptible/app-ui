import { MenuWrappedPage } from "../layouts/menu-wrapped-page";
import {
  AppListByOrg,
  IconChevronDown,
  IconChevronUp,
  IconExternalLink,
} from "../shared";

export const AppsPage = () => {
  return (
    <MenuWrappedPage>
      <AppListByOrg />
      <div className="flex border-t border-black-100 py-4 mt-8">
        <p className="grow text-gray-500 text-sm pb-4 uppercase">Aptible, Inc. © 2023</p>
        <div className="flex md:flex-row flex-col">
          <a href="#" className="flex-none text-gray-500 hover:text-indigo focus:text-gray-500 text-sm pl-4 pb-4 uppercase">Share Feedback <IconChevronDown className="inline h-5 -ml-2 -mt-1 opacity-60" /></a>
          <a href="https://www.aptible.com/changelog" target="_blank" className="flex-none text-gray-500 hover:text-indigo text-sm pl-4 pb-4 uppercase">View Changelog <IconExternalLink className="inline h-4 -ml-1 -mt-1 opacity-60" /></a>
          <a href="https://dashboard.aptible.com/login" target="_blank" className="flex-none text-gray-500 hover:text-indigo text-sm pl-4 pb-4 uppercase">View Legacy App <IconExternalLink className="inline h-4 -ml-1 -mt-1 opacity-60" /></a>
        </div>
      </div>
    </MenuWrappedPage>
  );
};
