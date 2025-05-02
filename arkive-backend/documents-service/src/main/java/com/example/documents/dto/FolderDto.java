package com.example.documents.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FolderDto {
    private Long id;
    
    @NotBlank(message = "Folder title cannot be blank")
    private String title;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}