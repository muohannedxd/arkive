package com.example.documents.dto;

import lombok.Data;
import java.util.List;

@Data
public class DocumentFilterRequest {
    private List<String> departments;
    private Long folderId;
}