package com.example.documents.repository;

import com.example.documents.model.Department;
import com.example.documents.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByFolderId(Long folderId);
    
    // Keep for backward compatibility
    List<Document> findByDepartment(String department);
    
    List<Document> findByCategory(String category);
    
    // Find documents by department entities
    List<Document> findByDepartmentsIn(List<Department> departments);
    
    // Find documents that belong to any of the department names
    @Query("SELECT DISTINCT d FROM Document d JOIN d.departments dept WHERE dept.name IN :departmentNames")
    List<Document> findByDepartmentNames(@Param("departmentNames") List<String> departmentNames);
    
    // Find documents by departments and with null folder ID
    @Query("SELECT DISTINCT d FROM Document d JOIN d.departments dept WHERE dept.name IN :departmentNames AND d.folder IS NULL")
    List<Document> findByDepartmentNamesAndNoFolder(@Param("departmentNames") List<String> departmentNames);
    
    // Find documents with null folder ID
    @Query("SELECT d FROM Document d WHERE d.folder IS NULL")
    List<Document> findByNoFolder();
}