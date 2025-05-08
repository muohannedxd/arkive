package com.example.storage.service;

import io.minio.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.storage.config.MinioConfig;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class StorageService {

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    @PostConstruct
    public void init() {
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
        }
    }

    public String uploadFile(MultipartFile file) {
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
        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage());
            return null;
        }
    }

    public byte[] downloadFile(String filename) {
        try {
            GetObjectResponse response = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(filename)
                            .build());

            return response.readAllBytes();
        } catch (Exception e) {
            log.error("Error downloading file: {}", e.getMessage());
            return null;
        }
    }

    public boolean deleteFile(String filename) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(filename)
                            .build());
            return true;
        } catch (Exception e) {
            log.error("Error deleting file: {}", e.getMessage());
            return false;
        }
    }

    public String getFileUrl(String filename) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(filename)
                            .method(io.minio.http.Method.GET)
                            .build());
        } catch (Exception e) {
            log.error("Error generating URL: {}", e.getMessage());
            return null;
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