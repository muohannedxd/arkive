import { InputGroup, InputRightElement } from "@chakra-ui/react";
import { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { SingleDatepicker } from "./DayzedDatepicker";
import { useUserStore } from "views/dashboard/users/stores/users.store";
import { FaCalendar } from "react-icons/fa";

export interface DatepickerProps {
  position?: "relative" | "absolute";
  startDateIcon?: ReactNode;
  endDateIcon?: ReactNode;
  onChange?: (date: Date) => void;
}

export const Datepicker = (props: DatepickerProps) => {
  const { control } = useForm();

  /**
   * get data from zustand store of the user
   */
  const { oneUserForm, setOneUserForm } = useUserStore();

  return (
    <>
      {/* <FormControl> */}
      <Controller
        name="date"
        control={control}
        render={({ field: { onChange } }) => (
          <>
            <InputGroup className="z-50">
              <SingleDatepicker
                date={new Date(oneUserForm.hire_date)}
                onDateChange={(date) => {
                  setOneUserForm("hire_date", date);
                  props.onChange?.(date);
                }}
              />
              <InputRightElement children={<FaCalendar />} />
            </InputGroup>
          </>
        )}
      />
    </>
  );
};
