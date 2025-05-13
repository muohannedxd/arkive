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
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;
import java.util.Map;

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
    
    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getDocumentsByDepartments(@RequestParam List<String> departments) {
        List<DocumentDto> documents = documentService.getDocumentsByDepartments(departments);
        return ResponseEntity.ok(ApiResponse.success("Documents for multiple departments retrieved successfully", documents));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getDocumentsByCategory(@PathVariable String category) {
        List<DocumentDto> documents = documentService.getDocumentsByCategory(category);
        return ResponseEntity.ok(ApiResponse.success("Category Documents retrieved successfully", documents));
    }
    
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/filter", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<ApiResponse<List<DocumentDto>>> filterDocuments(@RequestBody(required = false) Map<String, Object> filterParams) {
        List<String> departments = null;
        Boolean noFolderId = null;
        
        if (filterParams != null) {
            departments = (List<String>) filterParams.get("departments");
            noFolderId = (Boolean) filterParams.get("noFolderId");
        }
        
        List<DocumentDto> documents = documentService.filterDocuments(departments, noFolderId);
        return ResponseEntity.ok(ApiResponse.success("Documents filtered successfully", documents));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<DocumentDto>> createDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("department") String department,
            @RequestParam(value = "departments", required = false) List<String> departments,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @RequestParam("ownerId") Long ownerId,
            @RequestParam("ownerName") String ownerName) {
        
        DocumentDto documentDto = new DocumentDto();
        documentDto.setTitle(title);
        documentDto.setDepartment(department); // For backward compatibility
        
        // Set multiple departments if provided
        if (departments != null && !departments.isEmpty()) {
            documentDto.setDepartments(departments);
        } else {
            // Use single department as default if multiple departments not provided
            documentDto.setDepartments(List.of(department));
        }
        
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
