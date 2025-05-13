package com.example.documents.service;

import com.example.documents.client.StorageClient;
import com.example.documents.dto.DocumentDto;
import com.example.documents.exception.BadRequestException;
import com.example.documents.exception.ResourceNotFoundException;
import com.example.documents.model.Department;
import com.example.documents.model.Document;
import com.example.documents.model.Folder;
import com.example.documents.repository.DocumentRepository;
import com.example.documents.repository.FolderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentServiceImpl implements DocumentService {

   private final DocumentRepository documentRepository;
   private final FolderRepository folderRepository;
   private final StorageClient storageClient;
   private final DepartmentService departmentService;

   @Override
   public List<DocumentDto> getAllDocuments() {
      List<Document> documents = documentRepository.findAll();
      return documents.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
   }

   @Override
   public List<DocumentDto> getDocumentsByFolderId(Long folderId) {
      if (!folderRepository.existsById(folderId)) {
         throw new ResourceNotFoundException("Folder not found with id: " + folderId);
      }

      List<Document> documents = documentRepository.findByFolderId(folderId);
      return documents.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
   }

   @Override
   public List<DocumentDto> getDocumentsByDepartment(String department) {
      List<Document> documents = documentRepository.findByDepartment(department);
      return documents.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
   }
   
   @Override
   public List<DocumentDto> getDocumentsByDepartments(List<String> departmentNames) {
      if (departmentNames == null || departmentNames.isEmpty()) {
          return new ArrayList<>();
      }
      
      List<Document> documents = documentRepository.findByDepartmentNames(departmentNames);
      return documents.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
   }

   @Override
   public List<DocumentDto> getDocumentsByCategory(String category) {
      List<Document> documents = documentRepository.findByCategory(category);
      return documents.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
   }

   @Override
   public DocumentDto getDocumentById(Long id) {
      Document document = documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
      return mapToDto(document);
   }

   @Override
   @Transactional
   public DocumentDto createDocument(DocumentDto documentDto) {
      // For documents created without a file upload
      // If URL provided, use it, otherwise set a placeholder
      if (documentDto.getUrl() == null || documentDto.getUrl().isEmpty()) {
         documentDto.setUrl("no-file-attached");
      }

      Document document = mapToEntity(documentDto);
      
      // For backward compatibility, if departments list is empty but department string is set
      if ((documentDto.getDepartments() == null || documentDto.getDepartments().isEmpty()) 
          && documentDto.getDepartment() != null) {
          documentDto.setDepartments(List.of(documentDto.getDepartment()));
      }
      
      // Set the departments for the document
      if (documentDto.getDepartments() != null && !documentDto.getDepartments().isEmpty()) {
          List<Department> departments = departmentService.findOrCreateDepartments(documentDto.getDepartments());
          document.getDepartments().addAll(departments);
      }
      
      // Only set folder if folderId is provided
      if (documentDto.getFolderId() != null) {
         // Check if folder exists
         Folder folder = folderRepository.findById(documentDto.getFolderId())
               .orElseThrow(() -> new BadRequestException("Folder not found with id: " + documentDto.getFolderId()));
         document.setFolder(folder);
      }

      Document savedDocument = documentRepository.save(document);
      return mapToDto(savedDocument);
   }
   
   @Override
   @Transactional
   public DocumentDto uploadDocument(MultipartFile file, DocumentDto documentDto) {
      if (file == null || file.isEmpty()) {
         throw new BadRequestException("File cannot be empty");
      }
      
      Document document = mapToEntity(documentDto);
      
      // For backward compatibility, if departments list is empty but department string is set
      if ((documentDto.getDepartments() == null || documentDto.getDepartments().isEmpty()) 
          && documentDto.getDepartment() != null) {
          documentDto.setDepartments(List.of(documentDto.getDepartment()));
      }
      
      // Set the departments for the document
      if (documentDto.getDepartments() != null && !documentDto.getDepartments().isEmpty()) {
          List<Department> departments = departmentService.findOrCreateDepartments(documentDto.getDepartments());
          document.getDepartments().addAll(departments);
      }
      
      // Only set folder if folderId is provided
      if (documentDto.getFolderId() != null) {
         // Check if folder exists
         Folder folder = folderRepository.findById(documentDto.getFolderId())
               .orElseThrow(() -> new BadRequestException("Folder not found with id: " + documentDto.getFolderId()));
         document.setFolder(folder);
      }
            
      try {
         // Upload the file to storage service
         String filename = storageClient.uploadFile(file);
         log.info("File uploaded successfully with name: {}", filename);
         
         // Set the document URL to the uploaded file's URL
         document.setUrl(filename);
         
         Document savedDocument = documentRepository.save(document);
         return mapToDto(savedDocument);
      } catch (Exception e) {
         log.error("Error uploading file: {}", e.getMessage());
         throw new BadRequestException("Failed to upload document: " + e.getMessage());
      }
   }
   
   @Override
   public ResponseEntity<byte[]> downloadDocument(Long id) {
      Document document = documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
            
      String filename = document.getUrl();
      
      // If no file is attached to the document
      if (filename == null || filename.equals("no-file-attached")) {
         throw new ResourceNotFoundException("No file attached to this document");
      }
      
      try {
         // Get the file bytes from the storage service
         byte[] fileBytes = storageClient.downloadFile(filename);
         
         // Set up the response headers
         HttpHeaders headers = new HttpHeaders();
         headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
         headers.setContentDispositionFormData("attachment", filename);
         
         return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
      } catch (Exception e) {
         log.error("Error downloading file: {}", e.getMessage());
         throw new ResourceNotFoundException("Failed to download document: " + e.getMessage());
      }
   }

   @Override
   @Transactional
   public DocumentDto updateDocument(Long id, DocumentDto documentDto) {
      Document document = documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

      // Handle folder assignment/reassignment
      if (documentDto.getFolderId() != null) {
         // If the document didn't have a folder or folder is being changed
         if (document.getFolder() == null || !document.getFolder().getId().equals(documentDto.getFolderId())) {
            // Check if new folder exists
            Folder newFolder = folderRepository.findById(documentDto.getFolderId())
                  .orElseThrow(() -> new BadRequestException("Folder not found with id: " + documentDto.getFolderId()));
            document.setFolder(newFolder);
         }
      } else {
         // If folderId is null in the request, remove folder association
         document.setFolder(null);
      }

      document.setTitle(documentDto.getTitle());
      document.setCategory(documentDto.getCategory());
      document.setDepartment(documentDto.getDepartment()); // Keep for backward compatibility
      
      // Handle department updates if provided
      if (documentDto.getDepartments() != null && !documentDto.getDepartments().isEmpty()) {
          document.getDepartments().clear();
          List<Department> departments = departmentService.findOrCreateDepartments(documentDto.getDepartments());
          document.getDepartments().addAll(departments);
          
          // Update single department field for backward compatibility
          if (!documentDto.getDepartments().isEmpty()) {
              document.setDepartment(documentDto.getDepartments().get(0));
          }
      }

      // Only update owner information if provided
      if (documentDto.getOwnerId() != null) {
         document.setOwnerId(documentDto.getOwnerId());
      }
      
      if (documentDto.getOwnerName() != null && !documentDto.getOwnerName().isEmpty()) {
         document.setOwnerName(documentDto.getOwnerName());
      }

      // Only update URL if provided and not empty
      if (documentDto.getUrl() != null && !documentDto.getUrl().isEmpty()) {
         document.setUrl(documentDto.getUrl());
      }

      Document updatedDocument = documentRepository.save(document);
      return mapToDto(updatedDocument);
   }

   @Override
   @Transactional
   public void deleteDocument(Long id) {
      Document document = documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
            
      // Delete the file from storage if it exists
      String filename = document.getUrl();
      if (filename != null && !filename.equals("no-file-attached")) {
         try {
            boolean deleted = storageClient.deleteFile(filename);
            if (deleted) {
               log.info("Successfully deleted file from storage: {}", filename);
            } else {
               log.warn("Could not delete file from storage: {}", filename);
            }
         } catch (Exception e) {
            log.error("Error deleting file from storage: {}", e.getMessage());
            // Continue with document deletion even if file deletion fails
         }
      }
      
      documentRepository.deleteById(id);
   }

   private DocumentDto mapToDto(Document document) {
      DocumentDto documentDto = new DocumentDto();
      documentDto.setId(document.getId());
      documentDto.setTitle(document.getTitle());
      documentDto.setCategory(document.getCategory());
      documentDto.setDepartment(document.getDepartment());
      documentDto.setUrl(document.getUrl());
      documentDto.setOwnerId(document.getOwnerId());
      documentDto.setOwnerName(document.getOwnerName());
      
      // Map departments
      if (document.getDepartments() != null) {
          documentDto.setDepartments(
              document.getDepartments().stream()
                  .map(Department::getName)
                  .collect(Collectors.toList())
          );
      }
      
      // Only set the folderId if the document has a folder
      if (document.getFolder() != null) {
         documentDto.setFolderId(document.getFolder().getId());
      }
      
      documentDto.setCreatedAt(document.getCreatedAt());
      documentDto.setUpdatedAt(document.getUpdatedAt());
      return documentDto;
   }

   private Document mapToEntity(DocumentDto documentDto) {
      Document document = new Document();
      document.setTitle(documentDto.getTitle());
      document.setCategory(documentDto.getCategory());
      document.setDepartment(documentDto.getDepartment()); // For backward compatibility
      document.setUrl(documentDto.getUrl());
      document.setOwnerId(documentDto.getOwnerId());
      document.setOwnerName(documentDto.getOwnerName());
      return document;
   }
}