import { useCallback, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import routes from "routes";
import NoMatch from "views/noMatch";
import { useAuthStore } from "views/auth/stores/auth.store";

export default function Admin(props: { [x: string]: any }) {
  const { ...rest } = props;
  const location = useLocation();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(window.innerWidth >= 1200);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);
  const [currentRoute, setCurrentRoute] = useState("Main Dashboard");

  const getActiveNavbar = (routes: RoutesType[] = []): string | boolean => {
    if (!Array.isArray(routes) || routes.length === 0) return false;
    for (let i = 0; i < routes.length; i++) {
      if (routes[i] && window.location.href.includes(routes[i].layout + routes[i].path)) {
        return routes[i].secondary;
      }
    }
    return false;
  };

  const getRoutes = (routes: RoutesType[]): any => {
    if (!routes) return null;

    return (
      <>
        {routes.map((prop, key) => {
          if (prop.layout === "/dashboard") {
            return <Route path={`/${prop.path}`} element={prop.component} key={key} />;
          }
          return null;
        })}
        {/* Handle unknown dashboard routes */}
        <Route path="*" element={<NoMatch />} />
      </>
    );
  };

  const getActiveRoute = useCallback(
    (routes: RoutesType[] = []): string | boolean => {
      if (!Array.isArray(routes) || routes.length === 0) return "Main Dashboard";

      let activeRoute = "Main Dashboard";
      for (let i = 0; i < routes.length; i++) {
        if (location.pathname.includes(routes[i].layout + "/" + routes[i].path)) {
          activeRoute = routes[i].name;
          setCurrentRoute(routes[i].name);
          break;
        }
      }
      return activeRoute;
    },
    [location.pathname]
  );

  useEffect(() => {
    // Redirect if user's role is not allowed for the current route
    const currentRoute = routes.find((route) => location.pathname.includes(route.layout + "/" + route.path));
  
    if (currentRoute && !currentRoute.roles?.some((role) => role.toLowerCase() === user?.role?.toLowerCase())) {
      window.location.replace("/dashboard/default");
    }
  }, [location.pathname, user]);
  

  useEffect(() => {
    // tracks window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1200);
      setOpen(window.innerWidth >= 1200);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getActiveRoute(routes);

    if (isMobile) {
      setOpen(false);
    }
  }, [location.pathname, isMobile, getActiveRoute]);

  return (
    <div className="relative flex h-full w-full">
      {/* Overlay - Only visible on small screens when sidebar is open */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Navbar & Main Content */}
      <div className={`h-full w-full bg-lightPrimary dark:!bg-navy-900 ${(open && isMobile) && "opacity-20 transition-opacity"}`}>
        <main className={`mx-[12px] h-full flex-none transition-all md:pr-2 xl:ml-[313px]`}>
          <div className="h-full">
            <Navbar
              onOpenSidenav={() => setOpen((prev) => !prev)}
              brandText={currentRoute}
              secondary={getActiveNavbar(routes)}
              {...rest}
            />
            <div className="pt-5s mx-auto mb-auto h-full min-h-[84vh] p-2 md:pr-2">
              <Routes>
                {getRoutes(routes)}
                <Route path="/" element={<Navigate to="/dashboard/default" replace />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
