package com.example.documents_service;

import com.example.documents.controller.DocumentController;
import com.example.documents.dto.DocumentDto;
import com.example.documents.dto.response.ApiResponse;
import com.example.documents.service.DocumentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@WebMvcTest(DocumentController.class)
public class DocumentControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DocumentService documentService;

    @Test
    public void testGetAllDocuments() throws Exception {
        // Create test data
        DocumentDto doc1 = new DocumentDto();
        doc1.setId(1L);
        doc1.setTitle("Test Document 1");
        doc1.setDepartment("IT");
        doc1.setUrl("test-doc-1.pdf");
        doc1.setFolderId(1L);
        doc1.setCreatedAt(LocalDateTime.now());
        
        DocumentDto doc2 = new DocumentDto();
        doc2.setId(2L);
        doc2.setTitle("Test Document 2");
        doc2.setDepartment("HR");
        doc2.setUrl("test-doc-2.pdf");
        doc2.setFolderId(1L);
        doc2.setCreatedAt(LocalDateTime.now());
        
        List<DocumentDto> documents = Arrays.asList(doc1, doc2);
        
        // Mock the service response
        when(documentService.getAllDocuments()).thenReturn(documents);
        
        // Perform GET request and validate response
        mockMvc.perform(MockMvcRequestBuilders.get("/api/documents")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data").isArray())
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.length()").value(2))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data[0].title").value("Test Document 1"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data[1].title").value("Test Document 2"));
    }
    
    @Test
    public void testGetDocumentById() throws Exception {
        // Create test data
        DocumentDto document = new DocumentDto();
        document.setId(1L);
        document.setTitle("Test Document");
        document.setDepartment("IT");
        document.setUrl("test-doc.pdf");
        document.setFolderId(1L);
        document.setCreatedAt(LocalDateTime.now());
        
        // Mock the service response
        when(documentService.getDocumentById(1L)).thenReturn(document);
        
        // Perform GET request and validate response
        mockMvc.perform(MockMvcRequestBuilders.get("/api/documents/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.title").value("Test Document"));
    }
    
    @Test
    public void testDeleteDocument() throws Exception {
        // Mock the service response
        ApiResponse<Void> successResponse = ApiResponse.success("Document deleted successfully", null);
        
        // Perform DELETE request and validate response
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/documents/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("Document deleted successfully"));
    }
}