import { selectNav, setCollapsed } from "@app/nav";
import { useDispatch, useSelector } from "@app/react";
import { supportUrl, v2AppsUrl, v2HomeUrl } from "@app/routes";
import { schema } from "@app/schema";
import { SYSTEM_STATUS_ID } from "@app/system-status";
import { useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { AptibleLogo, AptibleLogoOnly } from "./aptible-logo";
import { Banner } from "./banner";
import { ExternalLink } from "./external-link";
import { IconBox, IconHamburger, IconHome } from "./icons";
import { LinkNav } from "./link";
import { OrgPicker } from "./org-picker";
import { OrgRequirements } from "./org-requirements";
import { UserMenu } from "./user-menu";

export const V2ApplicationSidebar = () => {
  const dispatch = useDispatch();
  const { collapsed } = useSelector(selectNav);
  const systemStatus = useSelector((s) =>
    schema.cache.selectById(s, { id: SYSTEM_STATUS_ID }),
  );
  const hasSystemStatus =
    systemStatus?.description && systemStatus?.indicator !== "none";
  const navigation = [
    { name: "Dashboard", to: v2HomeUrl(), icon: <IconHome /> },
    { name: "Apps", to: v2AppsUrl(), icon: <IconBox /> },
  ];

  useLayoutEffect(() => {
    // if entering medium breakpoint, force a responsive menu
    function updateSize() {
      if (window.innerWidth <= 767) {
        dispatch(setCollapsed({ collapsed: true }));
      }
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <button
          aria-label={`${collapsed ? "Expand" : "Collapse"} Menu`}
          type="button"
          className={`${
            collapsed ? "mt-0 ml-4 my-4" : "absolute top-4 right-4"
          } hover:cursor-pointer`}
          onClick={() => dispatch(setCollapsed({ collapsed: !collapsed }))}
        >
          <IconHamburger color="#888C90" />
        </button>

        <div className="flex items-center flex-shrink-0 pl-4">
          <Link to={v2HomeUrl()}>
            {collapsed ? <AptibleLogoOnly /> : <AptibleLogo />}
          </Link>
        </div>

        {collapsed ? null : (
          <div className="mt-4 px-3">
            <OrgPicker />
          </div>
        )}

        <div className="mt-2 flex-1 px-2">
          <nav className="bg-white">
            {navigation.map((item) => (
              <LinkNav key={item.name} {...item} hideName={collapsed} />
            ))}
          </nav>

          {!collapsed ? <OrgRequirements /> : null}

          {hasSystemStatus && !collapsed ? (
            <Banner variant="warning" className="mt-2 text-xs">
              <div>{systemStatus.description}</div>
              <div>
                <ExternalLink variant="error" href="https://status.aptible.com">
                  Status Page
                </ExternalLink>
              </div>
            </Banner>
          ) : null}
        </div>
      </div>

      <div className="px-2 w-full">
        <UserMenu hideName={collapsed} />

        {collapsed ? null : (
          <div className="mb-6 mt-4 flex justify-between text-sm text-black-500">
            <a
              className="text-black-500 hover:text-indigo px-2"
              href="https://aptible.com/docs"
            >
              DOCS
            </a>
            <Link
              to={supportUrl()}
              className="text-black-500 hover:text-indigo px-2"
            >
              SUPPORT
            </Link>
            <a
              className="text-black-500 hover:text-indigo px-2"
              href="https://www.aptible.com/docs/cli"
            >
              INSTALL CLI
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
