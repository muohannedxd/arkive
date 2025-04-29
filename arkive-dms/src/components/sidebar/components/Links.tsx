/* eslint-disable */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import DashIcon from "components/icons/DashIcon";
import { useAuthStore } from "views/auth/stores/auth.store";
// chakra imports

export const SidebarLinks = (props: { routes: RoutesType[] }): JSX.Element => {
  // Chakra color mode
  let location = useLocation();

  const { routes } = props;

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName: string) => {
    return location.pathname.includes(routeName);
  };

  const createLinks = (routes: RoutesType[]) => {
    const { user } = useAuthStore();

    if (!user || !user.email) return null;

    return routes
      .filter((route) => route.path !== "sign-in")
      .filter((route) => {
        if (!user) return false; // ensure user is logged in
        return route.roles?.some((role) => role.toLowerCase() === user.role?.toLowerCase()); // allow routes by role
      })
      .map((route, index) => {
        if (route.layout === "/dashboard" || route.layout === "/auth") {
          return (
            <Link key={index} to={route.layout + "/" + route.path}>
              <div className="relative mb-3 flex hover:cursor-pointer">
                <li
                  className="my-[3px] flex cursor-pointer items-center px-8"
                  key={index}
                >
                  <span
                    className={`${
                      activeRoute(route.path)
                        ? "font-bold text-mainbrand"
                        : "font-medium text-gray-600"
                    }`}
                  >
                    {route.icon ? route.icon : <DashIcon />}{" "}
                  </span>
                  <p
                    className={`leading-1 ml-4 flex ${
                      activeRoute(route.path)
                        ? "font-bold text-navy-700"
                        : "font-medium text-gray-600"
                    }`}
                  >
                    {route.name}
                  </p>
                </li>
                {activeRoute(route.path) ? (
                  <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-mainbrand dark:bg-brand-400" />
                ) : null}
              </div>
            </Link>
          );
        }
        return null;
      });
  };

  // BRAND
  return <>{createLinks(routes)}</>;
};

export default SidebarLinks;
