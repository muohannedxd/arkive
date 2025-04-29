import authImg from "assets/img/auth/auth.png";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import routes from "routes";
import Icon from "assets/img/auth/folders.png";
import NoMatch from "views/noMatch";
import { useEffect, useState } from "react";

export default function Auth() {
  const [isNoMatch, setIsNoMatch] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/auth/sign-in") {
      setIsNoMatch(false);
    } else {
      setIsNoMatch(true);
    }
  }, [location.pathname]);

  const getRoutes = (routes: RoutesType[]): any => {
    return (
      <>
        {routes.map((prop, key) => {
          if (prop.layout === "/auth") {
            return (
              <Route
                path={`/${prop.path}`}
                element={prop.component}
                key={key}
              />
            );
          }
          return null;
        })}
        {/* Handle unknown auth routes */}
        <Route path="*" element={<NoMatch />} />
      </>
    );
  };

  document.documentElement.dir = "ltr";
  return (
    <div>
      <div className="relative float-right h-full min-h-screen w-full !bg-white dark:!bg-navy-900">
        <main className={`mx-auto min-h-screen`}>
          <div className="relative flex">
            <div className="mx-auto flex min-h-full w-full flex-col justify-start pt-12 md:max-w-[75%] lg:h-screen lg:max-w-[1013px] lg:px-8 lg:pt-0 xl:h-[100vh] xl:max-w-[1383px] xl:px-0 xl:pl-[70px]">
              <div className="mb-auto flex flex-col pl-5 pr-5 md:pl-12 md:pr-0 lg:max-w-[48%] lg:pl-0 xl:max-w-full">
                <div className="mt-8">
                  <Routes>
                    {getRoutes(routes)}
                    <Route
                      path="/"
                      element={<Navigate to="/auth/sign-in" replace />}
                    />
                  </Routes>
                </div>
                {!isNoMatch && (
                  <div className="absolute right-0 hidden h-full min-h-screen lg:block lg:w-[49vw] 2xl:w-[44vw]">
                    <div
                      className="absolute flex h-full w-full flex-col items-center justify-center gap-8 bg-cover bg-center"
                      style={{ backgroundImage: `url(${authImg})` }}
                    >
                      <img src={Icon} alt="icon" className="z-40" />
                      <p className="text-5xl text-white">
                        {" "}
                        <span className="font-bold"> ARKIVE </span> DMS
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
