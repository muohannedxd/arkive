package com.example.documents.service;

import com.example.documents.model.Department;
import com.example.documents.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional
    public Department findOrCreateDepartment(String departmentName) {
        Optional<Department> existingDepartment = departmentRepository.findByName(departmentName);
        if (existingDepartment.isPresent()) {
            return existingDepartment.get();
        } else {
            Department newDepartment = new Department();
            newDepartment.setName(departmentName);
            return departmentRepository.save(newDepartment);
        }
    }

    @Override
    @Transactional
    public List<Department> findOrCreateDepartments(List<String> departmentNames) {
        List<Department> departments = new ArrayList<>();
        for (String name : departmentNames) {
            departments.add(findOrCreateDepartment(name));
        }
        return departments;
    }

    @Override
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }
}