// Admin Imports
import MainDashboard from "views/dashboard/default";
import Documents from "views/dashboard/documents";
import Profile from "views/dashboard/profile";

// Auth Imports
import SignIn from "views/auth/SignIn";

// Icon Imports
import { MdHome, MdPerson, MdLock } from "react-icons/md";
import Users from "views/dashboard/users";
import { IoDocument } from "react-icons/io5";
import { FaUsers } from "react-icons/fa";

const routes = [
  {
    name: "Main Dashboard",
    layout: "/dashboard",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
    roles: ["Admin", "User"],
  },
  {
    name: "User Management",
    layout: "/dashboard",
    path: "user-management",
    icon: <FaUsers className="h-6 w-6" />,
    component: <Users />,
    adminOnly: true,
    roles: ["Admin"],
  },
  {
    name: "Documents",
    layout: "/dashboard",
    path: "documents",
    icon: <IoDocument className="h-6 w-6" />,
    component: <Documents />,
    secondary: true,
    roles: ["Admin", "User"],
  },
  {
    name: "Profile",
    layout: "/dashboard",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Profile />,
    roles: ["Admin", "User"],
  },
  {
    name: "Sign In",
    layout: "/auth",
    path: "sign-in",
    icon: <MdLock className="h-6 w-6" />,
    component: <SignIn />,
  },
];
export default routes;
