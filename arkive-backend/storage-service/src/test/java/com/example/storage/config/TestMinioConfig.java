package com.example.storage.config;

import io.minio.MinioClient;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

@TestConfiguration
public class TestMinioConfig {

    @Bean
    @Primary
    public MinioClient testMinioClient() {
        // Return a mock MinioClient for testing
        return Mockito.mock(MinioClient.class);
    }
}