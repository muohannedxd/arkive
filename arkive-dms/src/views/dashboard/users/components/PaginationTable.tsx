import {
  Box,
  Button,
  HStack,
  VStack,
  IconButton,
  Select,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { RiArrowLeftDoubleFill, RiArrowRightDoubleFill } from "react-icons/ri";
import { useUserStore } from "../stores/users.store";

const ButtonPagination = (props: {
  children: any;
  index: any;
  setPageIndex: any;
  pageIndex: any;
}) => {
  const { children, index, setPageIndex, pageIndex } = props;

  return (
    <Button
      size="sm"
      onClick={() => {
        setPageIndex(index);
      }}
      bg={pageIndex === index ? "purple.800" : "transparent"}
      color={pageIndex === index ? "white" : "purple.800"}
      _hover={{
        bg: pageIndex === index ? "purple.700" : "gray.100",
        textDecoration: "underline",
      }}
      variant="ghost"
    >
      {children}
    </Button>
  );
};

const PaginationTable = (props: {
  pageSizeOptions?: number[];
  showOptions?: true;
  labelOptions?: "Number of shown users: ";
  colorScheme?: "cyan";
  showQuantity?: false;
}) => {
  const {
    pageSizeOptions = [10, 25, 50],
    showOptions = true,
    labelOptions = "Number of shown users:",
    showQuantity = false,
  } = props;

  const { pageIndex, setPageIndex, countPerPage, setCountPerPage, totalUsers } =
    useUserStore();

  const showButtons = () => {
    let buttons = [];
    const TOTAL_INDEX = Math.ceil(totalUsers / countPerPage);

    if (TOTAL_INDEX <= 5) {
      for (let index = 0; index < TOTAL_INDEX; index++) {
        buttons.push(
          <ButtonPagination
            key={index}
            setPageIndex={setPageIndex}
            index={index}
            pageIndex={pageIndex}
          >
            {index + 1}
          </ButtonPagination>
        );
      }
    } else {
      let start = Math.max(0, pageIndex - 2);
      let end = Math.min(TOTAL_INDEX - 1, start + 4);

      if (end === TOTAL_INDEX - 1) {
        start = Math.max(0, end - 4);
      }

      for (let index = start; index <= end; index++) {
        buttons.push(
          <ButtonPagination
            key={index}
            setPageIndex={setPageIndex}
            index={index}
            pageIndex={pageIndex}
          >
            {index + 1}
          </ButtonPagination>
        );
      }
    }

    buttons.unshift(
      <IconButton
        key="prev"
        icon={<RiArrowLeftDoubleFill />}
        size="sm"
        onClick={() => {
          setPageIndex(pageIndex - 1);
        }}
        isDisabled={!(pageIndex > 0)}
        color="purple.800"
        variant="link"
        aria-label={"Previous"}
      />
    );

    buttons.push(
      <IconButton
        key="next"
        icon={<RiArrowRightDoubleFill />}
        size="sm"
        onClick={() => {
          setPageIndex(pageIndex + 1);
        }}
        isDisabled={!(pageIndex + 1 < TOTAL_INDEX)}
        color="purple.800"
        variant="link"
        aria-label={"Next"}
      />
    );

    return buttons;
  };

  return (
    <VStack
      w="100%"
      p={2}
      align="stretch"
      spacing={2}
      sx={{ flexDirection: useBreakpointValue({ base: "column", md: "row" }) }}
    >
      <HStack w={{ base: "100%", md: "40%" }}>
        {showOptions && (
          <>
            <Text fontSize="sm"> {labelOptions} </Text>
            <Select
              w="auto"
              size="sm"
              variant="unstyled"
              value={countPerPage}
              onChange={(e) => {
                setCountPerPage(Number(e.target.value));
                setPageIndex(0);
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={String(opt)} value={String(opt)}>
                  {opt}
                </option>
              ))}
            </Select>

            {showQuantity && <Text fontSize="sm">Total: {totalUsers}</Text>}
          </>
        )}
      </HStack>
      <Box
        w={{ base: "100%", md: "60%" }}
        display="flex"
        justifyContent={{ base: "center", md: "flex-end" }}
      >
        <HStack>{showButtons()}</HStack>
      </Box>
    </VStack>
  );
};

export default PaginationTable;
