import { useCallback, useEffect, useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import axiosClient from "lib/axios";

export interface Department {
  id: number;
  name: string;
}

export default function useDepartments() {
  // default departments in case API fails
  const defaultDepartments: Department[] = [
    { id: 1, name: "Information Technology" },
    { id: 2, name: "Marketing" },
    { id: 3, name: "Human Resources" },
    { id: 4, name: "Finance" },
    { id: 5, name: "Operations" },
  ];

  const [departments, setDepartments] =
    useState<Department[]>(defaultDepartments);
  const [newDepartmentName, setNewDepartmentName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // dialog modal controls for departments
  const {
    isOpen: isOpenDepartmentsModal,
    onOpen: onOpenDepartmentsModal,
    onClose: onCloseDepartmentsModal,
  } = useDisclosure();

  // fetch departments from API
  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get("/departments");
      const deptData = response.data?.data || response.data;
      if (Array.isArray(deptData) && deptData.length > 0) {
        setDepartments(deptData);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      setError("Failed to load departments");
      // keep using default departments if API fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // add a new department
  const addDepartment = async () => {
    if (!newDepartmentName.trim()) {
      setError("Department name cannot be empty");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axiosClient.post("/departments", {
        name: newDepartmentName.trim(),
      });

      if (response.data.error) {
        setError(response.data.error);
        return;
      }

      if (response.data) {
        const newDept = response.data.data || response.data;
        setDepartments((prevDepts) => [...prevDepts, newDept]);
        setSuccess("Department added successfully");
        setNewDepartmentName(""); // Clear the input field
      }
    } catch (error: any) {
      console.error("Failed to add department:", error);
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Failed to add department";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // delete a department
  const deleteDepartment = async (departmentId: number) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axiosClient.delete(`/departments/${departmentId}`);

      setDepartments((prevDepts) =>
        prevDepts.filter((dept) => dept.id !== departmentId)
      );
      setSuccess("Department deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete department:", error);
      setError(error.response?.data?.message || "Failed to delete department");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    departments,
    setDepartments,
    newDepartmentName,
    setNewDepartmentName,
    isLoading,
    error,
    success,
    setError,
    setSuccess,
    fetchDepartments,
    addDepartment,
    deleteDepartment,
    isOpenDepartmentsModal,
    onOpenDepartmentsModal,
    onCloseDepartmentsModal,
  };
}
