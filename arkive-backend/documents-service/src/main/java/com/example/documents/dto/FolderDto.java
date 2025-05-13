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
public class FolderDto {
    private Long id;
    
    @NotBlank(message = "Folder title cannot be blank")
    private String title;
    
    // Temporarily keeping the department field for backward compatibility
    private String department;
    
    // Single field for departments
    private List<String> departments = new ArrayList<>();
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}