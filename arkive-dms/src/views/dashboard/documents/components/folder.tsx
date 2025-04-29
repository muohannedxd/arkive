import {
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaFolder } from "react-icons/fa";
import { FiDownload, FiEdit3, FiLock } from "react-icons/fi";
import { RiDeleteBin2Line } from "react-icons/ri";

interface folderInterface {
  title: string;
  owner: string;
}

export default function Folder(props: folderInterface) {
  return (
    <div className="group flex cursor-pointer items-center gap-4 rounded-lg border-2 border-gray-200 bg-white px-4 py-2 transition-all duration-200 hover:bg-gray-50 sm:max-w-80">
      <FaFolder className="h-6 w-6 md:h-8 md:w-8 text-mainbrand" />
      <div className="flex flex-col gap-1 overflow-hidden">
        <h5
          className="truncate text-base font-bold text-navy-700 max-w-44"
          title={props.title}
        >
          {props.title}
        </h5>
        <p
          className="truncate text-sm font-normal text-gray-600 max-w-44"
          title={props.owner}
        >
          {props.owner}
        </p>
      </div>
      <div className="ml-auto">
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={
              <BsThreeDotsVertical className="ml-auto h-6 w-6 text-gray-700 transition-all duration-200 hover:text-gray-800" />
            }
            variant="unstyled"
          />
          <MenuList>
            <MenuItem onClick={() => {}} icon={<FiDownload />}>
              Download Folder
            </MenuItem>
            <MenuItem onClick={() => {}} icon={<FiEdit3 />}>
              Edit Folder
            </MenuItem>
            <MenuItem onClick={() => {}} icon={<FiLock />}>
              Manage Access
            </MenuItem>
            <MenuItem
              color="red.600"
              onClick={() => {}}
              icon={<RiDeleteBin2Line />}
            >
              Delete Folder
            </MenuItem>
          </MenuList>
        </Menu>
      </div>
    </div>
  );
}
