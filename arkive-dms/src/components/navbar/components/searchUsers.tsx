import { FiFilter, FiSearch } from "react-icons/fi";
import { useUserStore } from "../../../views/dashboard/users/stores/users.store";
import { departments, roles, statuses } from "lib/configData";
import Dropdown from "components/dropdown";
import { useState } from "react";
import { Button, Select } from "@chakra-ui/react";

export default function SearchUsers() {
  const { setUserSearchKey, userFilters, setUserFilters } = useUserStore();
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSearchKey(e.target.value);
  };
  const handleFilterChange = (key: string, value: string) => {
    setUserFilters({ ...userFilters, [key]: value });
  };

  // dropdown control
  const [, setOpen] = useState(false);

  return (
    <>
      <div className="flex h-full items-center rounded-full bg-lightPrimary text-navy-700 dark:bg-navy-900  xl:w-[225px]">
        <p className="pl-3 pr-2 text-xl">
          <FiSearch className="h-4 w-4 text-gray-400" />
        </p>
        <input
          onChange={handleSearch}
          type="text"
          placeholder="Search for a user..."
          className="block h-full w-full rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 sm:w-fit"
        />
      </div>
      <Dropdown
        button={
          <p onClick={() => setOpen} className="cursor-pointer">
            <FiFilter className="h-4 w-4 text-gray-600 transition-all duration-300 hover:text-gray-700" />
          </p>
        }
        animation={"origin-top-right transition-all duration-300 ease-in-out"}
        classNames={`top-11 right-0 w-max`}
        children={
          <div className="z-50 w-max rounded-xl bg-white px-4 py-3 text-sm shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
            <p className="flex items-center gap-2 font-bold text-gray-600">
              <FiFilter />
              Filters
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Select
                value={userFilters.role || ""}
                onChange={(e) => handleFilterChange("role", e.target.value)}
                placeholder="Select role"
                borderRadius="lg"
              >
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </Select>
              <Select
                value={userFilters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                placeholder="Select status"
                borderRadius="lg"
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </Select>
              <Select
                value={userFilters.department || ""}
                onChange={(e) =>
                  handleFilterChange("department", e.target.value)
                }
                placeholder="Select department"
                borderRadius="lg"
              >
                {departments.map((dep) => (
                  <option key={dep}>{dep}</option>
                ))}
              </Select>
              <Button onClick={() => setUserFilters({})}>Clear Filters</Button>
            </div>
          </div>
        }
      />
    </>
  );
}
