import { useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

import {
  IconBox,
  IconCloud,
  IconCylinder,
  IconEndpoint,
  IconGlobe,
  IconHamburger,
  IconHeart,
  IconLayers,
  IconPlusCircle,
  IconSearch,
  IconShield,
} from "./icons";
import { selectEnv } from "@app/env";
import { selectNav, setCollapsed } from "@app/nav";
import {
  activityUrl,
  appsUrl,
  createProjectGitUrl,
  databaseUrl,
  deploymentsUrl,
  endpointsUrl,
  environmentsUrl,
  searchUrl,
  securityDashboardUrl,
  stacksUrl,
} from "@app/routes";

import { AptibleLogo, AptibleLogoOnly } from "./aptible-logo";
import { ButtonIcon } from "./button";
import { LinkNav } from "./link";
import { OrgPicker } from "./org-picker";
import { UserMenu } from "./user-menu";

export const ApplicationSidebar = () => {
  const env = useSelector(selectEnv);
  const dispatch = useDispatch();
  const { collapsed } = useSelector(selectNav);

  const navigate = useNavigate();
  const navigation = [
    { name: "Stacks", to: stacksUrl(), icon: <IconLayers /> },
    { name: "Environments", to: environmentsUrl(), icon: <IconGlobe /> },
    { name: "Apps", to: appsUrl(), icon: <IconBox /> },
    { name: "Databases", to: databaseUrl(), icon: <IconCylinder /> },
    { name: "Endpoints", to: endpointsUrl(), icon: <IconEndpoint /> },
    { name: "Deployments", to: deploymentsUrl(), icon: <IconCloud /> },
    { name: "Activity", to: activityUrl(), icon: <IconHeart /> },
    {
      name: "Security & Compliance",
      to: securityDashboardUrl(env.legacyDashboardUrl),
      icon: <IconShield />,
    },
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
          <Link to={environmentsUrl()}>
            {collapsed ? <AptibleLogoOnly /> : <AptibleLogo />}
          </Link>
        </div>

        {collapsed ? null : (
          <div className="mt-5 px-3">
            <OrgPicker />
          </div>
        )}

        {collapsed ? null : (
          <div className="mt-2 px-3">
            <div
              className="border border-gray-200 bg-white rounded-lg px-2 py-1 flex items-center justify-between h-[36px] cursor-pointer hover:bg-black-50"
              onClick={() => navigate(searchUrl())}
              onKeyUp={() => navigate(searchUrl())}
            >
              <div className="flex items-center">
                <IconSearch color="#888C90" variant="sm" />{" "}
                <div className="ml-2 text-black-300">Search...</div>
              </div>
              {/* <div className="text-black-300">&#8984; K</div> */}
            </div>
          </div>
        )}

        <nav className="mt-3 flex-1 px-2 bg-white space-y-1">
          {navigation.map((item) => (
            <LinkNav key={item.name} {...item} hideName={collapsed} />
          ))}
        </nav>
      </div>

      <div className="px-2 w-full">
        <div className="ml-0">
          <ButtonIcon
            className="w-full mb-4"
            onClick={() => navigate(createProjectGitUrl())}
            icon={
              <IconPlusCircle
                style={
                  collapsed
                    ? {
                        width: 12,
                        height: 12,
                        marginRight: -8,
                        marginLeft: -1,
                        transform: "scale(1.8, 1.8)",
                      }
                    : {}
                }
              />
            }
          >
            {collapsed ? "" : "Deploy"}
          </ButtonIcon>
        </div>

        <UserMenu hideName={collapsed} />

        {collapsed ? null : (
          <div className="my-6 flex justify-between text-xs text-gray-500">
            <a
              className="text-gray-500 hover:text-indigo px-3"
              href="https://aptible.com/docs"
            >
              DOCS
            </a>
            <a
              className="text-gray-500 hover:text-indigo px-3"
              href="https://aptible.com/support"
            >
              SUPPORT
            </a>
            <a
              className="text-gray-500 hover:text-indigo px-3"
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
