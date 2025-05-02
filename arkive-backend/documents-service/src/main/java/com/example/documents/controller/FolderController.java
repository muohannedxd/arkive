package com.example.documents.controller;

import com.example.documents.dto.FolderDto;
import com.example.documents.dto.response.ApiResponse;
import com.example.documents.service.FolderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FolderDto>>> getAllFolders() {
        List<FolderDto> folders = folderService.getAllFolders();
        return ResponseEntity.ok(ApiResponse.success("Folders retrieved successfully", folders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FolderDto>> getFolderById(@PathVariable Long id) {
        FolderDto folder = folderService.getFolderById(id);
        return ResponseEntity.ok(ApiResponse.success("Folder retrieved successfully", folder));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FolderDto>> createFolder(@Valid @RequestBody FolderDto folderDto) {
        FolderDto createdFolder = folderService.createFolder(folderDto);
        return new ResponseEntity<>(ApiResponse.success("Folder created successfully", createdFolder), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FolderDto>> updateFolder(@PathVariable Long id, @Valid @RequestBody FolderDto folderDto) {
        FolderDto updatedFolder = folderService.updateFolder(id, folderDto);
        return ResponseEntity.ok(ApiResponse.success("Folder updated successfully", updatedFolder));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFolder(@PathVariable Long id) {
        folderService.deleteFolder(id);
        return ResponseEntity.ok(ApiResponse.success("Folder deleted successfully", null));
    }
}
