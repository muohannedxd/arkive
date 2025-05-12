import {
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaFolder } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";
import { RiDeleteBin2Line } from "react-icons/ri";

interface FolderInterface {
  id: number;
  title: string;
  createdAt: string;
  onNavigate: (id: number) => void;
  onEdit: (id: number, title: string) => void;
  onDelete: (id: number) => void;
  formatDate: (date: string) => string;
}

export default function Folder(props: FolderInterface) {
  const { id, title, createdAt, onNavigate, onEdit, onDelete, formatDate } = props;

  // Handle double click to navigate into folder
  const handleDoubleClick = () => {
    onNavigate(id);
  };

  // Edit folder
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent folder navigation
    onEdit(id, title);
  };

  // Delete folder
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent folder navigation
    onDelete(id);
  };

  return (
    <div 
      className="group flex cursor-pointer items-center gap-4 rounded-lg border-2 border-gray-200 bg-white px-4 py-2 transition-all duration-200 hover:bg-gray-50 sm:max-w-80"
      onDoubleClick={handleDoubleClick}
    >
      <FaFolder className="h-6 w-6 md:h-8 md:w-8 text-mainbrand" />
      <div className="flex flex-col gap-1 overflow-hidden">
        <h5
          className="truncate text-base font-bold text-navy-700 max-w-44"
          title={title}
        >
          {title}
        </h5>
        <p
          className="truncate text-sm font-normal text-gray-600 max-w-44"
          title={`Created ${formatDate(createdAt)}`}
        >
          Created {formatDate(createdAt)}
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
            onClick={(e) => e.stopPropagation()} // Prevent folder navigation
          />
          <MenuList onClick={(e) => e.stopPropagation()}>
            <MenuItem onClick={handleEditClick} icon={<FiEdit3 />}>
              Edit Folder
            </MenuItem>
            <MenuItem
              color="red.600"
              onClick={handleDeleteClick}
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
