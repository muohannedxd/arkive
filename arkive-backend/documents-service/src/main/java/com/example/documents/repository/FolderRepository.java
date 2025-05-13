package com.example.documents.repository;

import com.example.documents.model.Department;
import com.example.documents.model.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    // Removed legacy findByDepartment method
    
    // Find folders by department entities
    List<Folder> findByDepartmentsIn(List<Department> departments);
    
    // Find folders by department names with case insensitivity
    @Query("SELECT DISTINCT f FROM Folder f JOIN f.departments d WHERE LOWER(d.name) IN (:departmentNames)")
    List<Folder> findByDepartmentNames(@Param("departmentNames") List<String> departmentNames);
}