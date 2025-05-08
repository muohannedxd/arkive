package com.example.documents.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageClient {

    private final RestTemplate restTemplate;
    
    @Value("${storage.service.url:http://storage-service:8080}")
    private String storageServiceUrl;
    
    /**
     * Uploads a file to the storage service
     * 
     * @param file The file to upload
     * @return The filename of the uploaded file
     */
    public String uploadFile(MultipartFile file) {
        String uploadUrl = storageServiceUrl + "/api/storage/upload";
        log.info("Uploading file to {}", uploadUrl);
        
        // Create headers for multipart request
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        
        // Create the multipart request body
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new MultipartFileResource(file));
        
        // Create the request entity
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        
        try {
            // Send the request and get the response
            ResponseEntity<Map> response = restTemplate.postForEntity(uploadUrl, requestEntity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("File uploaded successfully: {}", response.getBody().get("filename"));
                return (String) response.getBody().get("filename");
            } else {
                log.error("Failed to upload file. Response: {}", response);
                throw new RuntimeException("Failed to upload file");
            }
        } catch (Exception e) {
            log.error("Error uploading file", e);
            throw new RuntimeException("Error uploading file: " + e.getMessage(), e);
        }
    }
    
    /**
     * Gets the download URL for a file
     * 
     * @param filename The filename to download
     * @return The URL to download the file
     */
    public String getFileUrl(String filename) {
        return storageServiceUrl + "/api/storage/download/" + filename;
    }
    
    /**
     * Downloads a file from the storage service
     * 
     * @param filename The filename to download
     * @return The file's bytes
     */
    public byte[] downloadFile(String filename) {
        String downloadUrl = storageServiceUrl + "/api/storage/download/" + filename;
        log.info("Downloading file from: {}", downloadUrl);
        
        try {
            ResponseEntity<byte[]> response = restTemplate.getForEntity(downloadUrl, byte[].class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("File downloaded successfully, size: {} bytes", response.getBody().length);
                return response.getBody();
            } else {
                log.error("Failed to download file. Response status: {}", response.getStatusCode());
                throw new RuntimeException("Failed to download file");
            }
        } catch (Exception e) {
            log.error("Error downloading file", e);
            throw new RuntimeException("Error downloading file: " + e.getMessage(), e);
        }
    }
    
    /**
     * Deletes a file from the storage service
     * 
     * @param filename The filename to delete
     * @return true if deletion was successful
     */
    public boolean deleteFile(String filename) {
        String deleteUrl = storageServiceUrl + "/api/storage/delete/" + filename;
        log.info("Deleting file: {}", deleteUrl);
        
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    deleteUrl, 
                    HttpMethod.DELETE, 
                    null, 
                    Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                boolean deleted = (boolean) response.getBody().get("deleted");
                log.info("File deletion status: {}", deleted);
                return deleted;
            } else {
                log.error("Failed to delete file. Response: {}", response);
                return false;
            }
        } catch (Exception e) {
            log.error("Error deleting file", e);
            return false;
        }
    }
    
    /**
     * Helper class to handle MultipartFile as a Resource
     */
    private static class MultipartFileResource implements Resource {
        private final MultipartFile multipartFile;
        
        public MultipartFileResource(MultipartFile multipartFile) {
            this.multipartFile = multipartFile;
        }
        
        @Override
        public String getFilename() {
            return multipartFile.getOriginalFilename();
        }
        
        @Override
        public boolean exists() {
            return true;
        }
        
        @Override
        public java.net.URL getURL() throws java.io.IOException {
            throw new UnsupportedOperationException("Method not supported");
        }
        
        @Override
        public java.net.URI getURI() throws java.io.IOException {
            throw new UnsupportedOperationException("Method not supported");
        }
        
        @Override
        public java.io.File getFile() throws java.io.IOException {
            throw new UnsupportedOperationException("Method not supported");
        }
        
        @Override
        public long contentLength() throws java.io.IOException {
            return multipartFile.getSize();
        }
        
        @Override
        public long lastModified() throws java.io.IOException {
            throw new UnsupportedOperationException("Method not supported");
        }
        
        @Override
        public Resource createRelative(String relativePath) throws java.io.IOException {
            throw new UnsupportedOperationException("Method not supported");
        }
        
        @Override
        public String getDescription() {
            return "MultipartFile resource [" + multipartFile.getName() + "]";
        }
        
        @Override
        public java.io.InputStream getInputStream() throws java.io.IOException {
            return multipartFile.getInputStream();
        }
    }
}