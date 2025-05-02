package com.example.documents.service;

import com.example.documents.dto.DocumentDto;
import com.example.documents.exception.BadRequestException;
import com.example.documents.exception.ResourceNotFoundException;
import com.example.documents.model.Document;
import com.example.documents.model.Folder;
import com.example.documents.repository.DocumentRepository;
import com.example.documents.repository.FolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

   private final DocumentRepository documentRepository;
   private final FolderRepository folderRepository;

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
      // For now, URL is dummy
      if (documentDto.getUrl() == null || documentDto.getUrl().isEmpty()) {
         documentDto.setUrl("https://example.com/documents/dummy-" + System.currentTimeMillis());
      }

      // Check if folder exists
      Folder folder = folderRepository.findById(documentDto.getFolderId())
            .orElseThrow(() -> new BadRequestException("Folder not found with id: " + documentDto.getFolderId()));

      Document document = mapToEntity(documentDto);
      document.setFolder(folder);

      Document savedDocument = documentRepository.save(document);
      return mapToDto(savedDocument);
   }

   @Override
   @Transactional
   public DocumentDto updateDocument(Long id, DocumentDto documentDto) {
      Document document = documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

      // Check if folder exists if it's being updated
      if (!document.getFolder().getId().equals(documentDto.getFolderId())) {
         Folder newFolder = folderRepository.findById(documentDto.getFolderId())
               .orElseThrow(() -> new BadRequestException("Folder not found with id: " + documentDto.getFolderId()));
         document.setFolder(newFolder);
      }

      document.setTitle(documentDto.getTitle());
      document.setCategory(documentDto.getCategory());
      document.setDepartment(documentDto.getDepartment());

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
      if (!documentRepository.existsById(id)) {
         throw new ResourceNotFoundException("Document not found with id: " + id);
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
      documentDto.setFolderId(document.getFolder().getId());
      documentDto.setCreatedAt(document.getCreatedAt());
      documentDto.setUpdatedAt(document.getUpdatedAt());
      return documentDto;
   }

   private Document mapToEntity(DocumentDto documentDto) {
      Document document = new Document();
      document.setTitle(documentDto.getTitle());
      document.setCategory(documentDto.getCategory());
      document.setDepartment(documentDto.getDepartment());
      document.setUrl(documentDto.getUrl());
      return document;
   }
}