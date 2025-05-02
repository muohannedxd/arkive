package com.example.documents.repository;

import com.example.documents.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByFolderId(Long folderId);
    List<Document> findByDepartment(String department);
    List<Document> findByCategory(String category);
}