package com.example.documents.service;

import com.example.documents.model.Department;
import java.util.List;

public interface DepartmentService {
    Department findOrCreateDepartment(String departmentName);
    List<Department> findOrCreateDepartments(List<String> departmentNames);
    List<Department> getAllDepartments();
}