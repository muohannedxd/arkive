package com.example.documents.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {
    private Long id;
    
    @NotBlank(message = "Document title cannot be blank")
    private String title;
    
    private String category;
    
    @NotBlank(message = "Department cannot be blank")
    private String department;
    
    private String url;
    
    @NotNull(message = "Folder ID is required")
    private Long folderId;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}