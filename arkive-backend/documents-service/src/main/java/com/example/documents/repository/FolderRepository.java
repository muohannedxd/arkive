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
    // Find folders by a single department entity
    List<Folder> findByDepartment(Department department);
    
    // Find folders by department name with case insensitivity
    @Query("SELECT f FROM Folder f WHERE LOWER(f.department.name) = LOWER(:departmentName)")
    List<Folder> findByDepartmentName(@Param("departmentName") String departmentName);
    
    // Find folders by multiple department names (for users with multiple departments)
    @Query("SELECT DISTINCT f FROM Folder f WHERE f.department.name IN :departmentNames")
    List<Folder> findByDepartmentNamesIn(@Param("departmentNames") List<String> departmentNames);
}