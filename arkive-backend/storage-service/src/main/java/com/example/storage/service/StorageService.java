package com.example.storage.service;

import io.minio.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.storage.config.MinioConfig;
import com.example.storage.exception.StorageException;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.core.env.Environment;
import java.util.Arrays;

@Service
@Slf4j
@RequiredArgsConstructor
public class StorageService {

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;
    private final Environment environment;
    
    private boolean isTestEnvironment() {
        return Arrays.asList(environment.getActiveProfiles()).contains("test");
    }

    @PostConstruct
    public void init() {
        // Skip initialization if we're in a test environment
        if (isTestEnvironment()) {
            log.info("Test environment detected. Skipping MinIO initialization.");
            return;
        }
        
        try {
            boolean bucketExists = minioClient.bucketExists(BucketExistsArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .build());

            if (!bucketExists) {
                minioClient.makeBucket(MakeBucketArgs.builder()
                        .bucket(minioConfig.getBucketName())
                        .build());
                log.info("Bucket '{}' created successfully", minioConfig.getBucketName());
            } else {
                log.info("Bucket '{}' already exists", minioConfig.getBucketName());
            }
        } catch (Exception e) {
            log.error("Error initializing bucket: {}", e.getMessage());
            // In non-test environments, we still want to throw the exception to prevent startup with invalid storage
            if (!isTestEnvironment()) {
                throw new StorageException("Failed to initialize storage", e);
            } else {
                log.warn("Continuing despite MinIO initialization failure in test environment");
            }
        }
    }

    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new StorageException("Failed to upload empty file");
        }
        
        try {
            String filename = generateFilename(file.getOriginalFilename());
            Map<String, String> metadata = new HashMap<>();
            metadata.put("Content-Type", file.getContentType());
            metadata.put("X-Amz-Meta-Original-Filename", file.getOriginalFilename());

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(filename)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .headers(metadata)
                            .build());

            return filename;
        } catch (IOException e) {
            log.error("Failed to read file content: {}", e.getMessage());
            throw new StorageException("Failed to read file content", e);
        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage());
            throw new StorageException("Failed to upload file", e);
        }
    }

    public byte[] downloadFile(String filename) {
        if (filename == null || filename.isEmpty()) {
            throw new StorageException("Filename cannot be empty");
        }
        
        try {
            GetObjectResponse response = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(filename)
                            .build());

            return response.readAllBytes();
        } catch (Exception e) {
            log.error("Error downloading file: {}", e.getMessage());
            throw new StorageException("File not found or could not be downloaded: " + filename, e);
        }
    }

    public boolean deleteFile(String filename) {
        if (filename == null || filename.isEmpty()) {
            throw new StorageException("Filename cannot be empty");
        }
        
        try {
            // Check if the file exists before deleting
            minioClient.statObject(
                StatObjectArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .object(filename)
                    .build()
            );
            
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(filename)
                            .build());
            return true;
        } catch (Exception e) {
            log.error("Error deleting file: {}", e.getMessage());
            throw new StorageException("File not found or could not be deleted: " + filename, e);
        }
    }

    public String getFileUrl(String filename) {
        if (filename == null || filename.isEmpty()) {
            throw new StorageException("Filename cannot be empty");
        }
        
        try {
            // Verify file exists before generating URL
            minioClient.statObject(
                StatObjectArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .object(filename)
                    .build()
            );
            
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(filename)
                            .method(io.minio.http.Method.GET)
                            .build());
        } catch (Exception e) {
            log.error("Error generating URL: {}", e.getMessage());
            throw new StorageException("File not found or URL could not be generated: " + filename, e);
        }
    }

    /**
     * Check if a file exists in MinIO
     */
    public boolean fileExists(String filename) {
        try {
            minioClient.statObject(
                StatObjectArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .object(filename)
                    .build()
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private String generateFilename(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        return UUID.randomUUID().toString() + extension;
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}