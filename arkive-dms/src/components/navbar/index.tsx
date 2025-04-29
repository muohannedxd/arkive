import Dropdown from "components/dropdown";
import { FiAlignJustify } from "react-icons/fi";
import { Link } from "react-router-dom";
import { BsArrowBarUp } from "react-icons/bs";
import { IoMdNotificationsOutline } from "react-icons/io";
import SearchMain from "./components/searchDocuments";
import { useLocation } from "react-router-dom";
import SearchUsers from "./components/searchUsers";
import { useEffect } from "react";
import { useAuthStore } from "views/auth/stores/auth.store";
import useAuth from "views/auth/auth.viewmodel";
import { Avatar } from "@chakra-ui/react";

const Navbar = (props: {
  onOpenSidenav: () => void;
  brandText: string;
  secondary?: boolean | string;
}) => {
  const { onOpenSidenav, brandText } = props;

  // get the pathname
  const location = useLocation();
  useEffect(() => {}, [location]);

  const { handleLogout } = useAuth();
  const { user } = useAuthStore();

  return (
    <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white/10 p-2 backdrop-blur-xl dark:bg-[#0b14374d]">
      <div>
        <div className="h-6 w-[224px] pt-1">
          <a
            className="text-sm font-normal text-navy-700 hover:underline  dark:hover:text-white"
            href=" "
          >
            Pages
            <span className="mx-1 text-sm text-navy-700 hover:text-navy-700 ">
              {" "}
              /{" "}
            </span>
          </a>
          <Link
            className="text-sm font-normal capitalize text-navy-700 hover:underline  dark:hover:text-white"
            to="#"
          >
            {brandText}
          </Link>
        </div>
        <p className="shrink text-[33px] capitalize text-navy-700 ">
          <Link
            to="#"
            className="font-bold capitalize hover:text-navy-700 dark:hover:text-white"
          >
            {brandText}
          </Link>
        </p>
      </div>

      <div
        className={`relative mt-[3px] ${
          location.pathname.includes("/documents") ||
          location.pathname.includes("/user-management")
            ? "w-[365px]"
            : "w-[120px] px-4"
        } flex h-[61px] flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 md:flex-grow-0 md:gap-1 xl:gap-2`}
      >
        {location.pathname.includes("/documents") ? (
          <SearchMain />
        ) : location.pathname.includes("/user-management") ? (
          <SearchUsers />
        ) : null}

        <span
          className="flex cursor-pointer text-xl text-gray-600 transition-all duration-300 hover:text-gray-700 xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </span>
        {/* start Notification */}
        <Dropdown
          button={
            <p className="cursor-pointer">
              <IoMdNotificationsOutline className="h-4 w-4 text-gray-600 transition-all duration-300 hover:text-gray-700" />
            </p>
          }
          animation="origin-[65%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
          children={
            <div className="flex w-[360px] flex-col gap-3 rounded-[20px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700  dark:shadow-none sm:w-[460px]">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-navy-700 ">
                  Notification
                </p>
                <p className="text-sm font-bold text-navy-700 ">
                  Mark all read
                </p>
              </div>

              <button className="flex w-full items-center">
                <div className="flex h-full w-[85px] items-center justify-center rounded-xl bg-gradient-to-b from-brandLinear to-mainbrand py-4 text-2xl text-white">
                  <BsArrowBarUp />
                </div>
                <div className="ml-2 flex h-full w-full flex-col justify-center rounded-lg px-1 text-sm">
                  <p className="mb-1 text-left text-base font-bold text-gray-900 ">
                    New Report
                  </p>
                  <p className="font-base text-left text-xs text-gray-900 ">
                    This document lacks more detailed information
                  </p>
                </div>
              </button>
            </div>
          }
          classNames={"py-2 top-4 -left-[230px] md:-left-[440px] w-max"}
        />
        {/* Profile & Dropdown */}
        <Dropdown
          button={
            <Avatar
              h="10"
              w="10"
              bgColor="purple"
              textColor="white"
              cursor="pointer"
              name={user && user.name}
              src={user && user.name}
            />
          }
          children={
            <div className="flex w-56 flex-col justify-start rounded-lg bg-white bg-cover bg-no-repeat pb-2 shadow-xl shadow-shadow-500">
              <div className="ml-4 mt-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy-700 ">
                    Hey, {user && user.name}
                  </p>{" "}
                </div>
              </div>
              <div className="mt-3 h-px w-full bg-gray-200 dark:bg-white/20 " />

              <div className="flex flex-col">
                <Link to="/dashboard/profile">
                  <div className="cursor-pointer py-2 pl-4 text-sm text-gray-800 hover:bg-gray-100">
                    Settings
                  </div>
                </Link>
                <div
                  onClick={handleLogout}
                  className="cursor-pointer py-2 pl-4 text-sm font-medium text-red-500 hover:bg-gray-100"
                >
                  Log Out
                </div>
              </div>
            </div>
          }
          classNames={"py-2 top-8 -left-[180px] w-max"}
        />
      </div>
    </nav>
  );
};

export default Navbar;
