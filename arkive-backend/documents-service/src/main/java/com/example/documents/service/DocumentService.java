package com.example.documents.service;

import com.example.documents.dto.DocumentDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentService {
   List<DocumentDto> getAllDocuments();

   List<DocumentDto> getDocumentsByFolderId(Long folderId);

   // Keep for backward compatibility
   List<DocumentDto> getDocumentsByDepartment(String department);
   
   // New method to get documents by multiple departments
   List<DocumentDto> getDocumentsByDepartments(List<String> departmentNames);
   
   // New method to filter documents by departments and folder ID status
   List<DocumentDto> filterDocuments(List<String> departments, Boolean noFolderId);

   List<DocumentDto> getDocumentsByCategory(String category);

   DocumentDto getDocumentById(Long id);

   DocumentDto createDocument(DocumentDto documentDto);
   
   DocumentDto uploadDocument(MultipartFile file, DocumentDto documentDto);
   
   ResponseEntity<byte[]> downloadDocument(Long id);

   DocumentDto updateDocument(Long id, DocumentDto documentDto);

   void deleteDocument(Long id);
}