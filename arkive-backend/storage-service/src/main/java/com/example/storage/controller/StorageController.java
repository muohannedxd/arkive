package com.example.storage.controller;

import com.example.storage.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
public class StorageController {

    private final StorageService storageService;

    @GetMapping("/")
    public String getMethodName() {
        return "Running Storage Service";
    }
    
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        // The service will throw StorageException if there are any issues
        String filename = storageService.uploadFile(file);
        String fileUrl = storageService.getFileUrl(filename);
        
        Map<String, String> response = new HashMap<>();
        response.put("filename", filename);
        response.put("url", fileUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String filename) {
        // The service will throw StorageException if the file doesn't exist
        byte[] data = storageService.downloadFile(filename);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", filename);
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{filename}")
    public ResponseEntity<Map<String, Boolean>> deleteFile(@PathVariable String filename) {
        // The service will throw StorageException if the file doesn't exist
        boolean deleted = storageService.deleteFile(filename);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", deleted);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/check/{filename}")
    public ResponseEntity<Map<String, Boolean>> checkFileExists(@PathVariable String filename) {
        boolean exists = storageService.fileExists(filename);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }
}