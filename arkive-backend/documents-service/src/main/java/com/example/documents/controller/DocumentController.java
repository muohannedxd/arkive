package com.example.documents.controller;

import com.example.documents.dto.DocumentDto;
import com.example.documents.dto.response.ApiResponse;
import com.example.documents.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getAllDocuments() {
        List<DocumentDto> documents = documentService.getAllDocuments();
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved successfully", documents));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentDto>> getDocumentById(@PathVariable Long id) {
        DocumentDto document = documentService.getDocumentById(id);
        return ResponseEntity.ok(ApiResponse.success("Document retrieved successfully", document));
    }

    @GetMapping("/folder/{folderId}")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getDocumentsByFolderId(@PathVariable Long folderId) {
        List<DocumentDto> documents = documentService.getDocumentsByFolderId(folderId);
        return ResponseEntity.ok(ApiResponse.success("Folder Documents retrieved successfully", documents));
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getDocumentsByDepartment(@PathVariable String department) {
        List<DocumentDto> documents = documentService.getDocumentsByDepartment(department);
        return ResponseEntity.ok(ApiResponse.success("Department Documents retrieved successfully", documents));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getDocumentsByCategory(@PathVariable String category) {
        List<DocumentDto> documents = documentService.getDocumentsByCategory(category);
        return ResponseEntity.ok(ApiResponse.success("Category Documents retrieved successfully", documents));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<DocumentDto>> createDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("department") String department,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @RequestParam("ownerId") Long ownerId,
            @RequestParam("ownerName") String ownerName) {
        
        DocumentDto documentDto = new DocumentDto();
        documentDto.setTitle(title);
        documentDto.setDepartment(department);
        documentDto.setCategory(category);
        documentDto.setFolderId(folderId);
        documentDto.setOwnerId(ownerId);
        documentDto.setOwnerName(ownerName);
        
        DocumentDto createdDocument = documentService.uploadDocument(file, documentDto);
        return new ResponseEntity<>(ApiResponse.success("Document created successfully", createdDocument), HttpStatus.CREATED);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        return documentService.downloadDocument(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentDto>> updateDocument(@PathVariable Long id, @Valid @RequestBody DocumentDto documentDto) {
        DocumentDto updatedDocument = documentService.updateDocument(id, documentDto);
        return ResponseEntity.ok(ApiResponse.success("Document updated successfully", updatedDocument));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }
}
