import { Select, Button } from "@chakra-ui/react";
import Dropdown from "components/dropdown";
import { departments } from "lib/configData";
import { useState } from "react";
import { FiFilter, FiSearch } from "react-icons/fi";
import { useDocumentStore } from "views/dashboard/documents/stores/document.store";

export default function SearchDocuments() {
  const { setDocumentSearchKey, documentFilters, setDocumentFilters } =
    useDocumentStore();
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentSearchKey(e.target.value);
  };
  const handleFilterChange = (key: string, value: string) => {
    setDocumentFilters({ ...documentFilters, [key]: value });
  };
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
          placeholder="Search for a document..."
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
                value={documentFilters.department || ""}
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
              <Button onClick={() => {
                setDocumentFilters({});
                console.log(documentFilters)
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        }
      />
    </>
  );
}
