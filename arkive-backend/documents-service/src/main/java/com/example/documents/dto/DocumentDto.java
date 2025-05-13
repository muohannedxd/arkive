package com.example.documents.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {
    private Long id;
    
    @NotBlank(message = "Document title cannot be blank")
    private String title;
    
    private String category;
    
    // Keep for backward compatibility
    private String department;
    
    // New field for multiple departments
    private List<String> departments = new ArrayList<>();
    
    private String url;
    
    // No longer required - documents can exist outside folders
    private Long folderId;
    
    private Long ownerId;
    
    private String ownerName;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}