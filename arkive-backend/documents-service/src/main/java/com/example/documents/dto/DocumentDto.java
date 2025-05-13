package com.example.documents.dto;

import jakarta.validation.constraints.NotBlank;
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
    
    // No longer required - documents can exist outside folders
    private Long folderId;
    
    private Long ownerId;
    
    private String ownerName;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}