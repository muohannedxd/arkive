package com.example.documents.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {
    @Bean
    public OpenAPI documentsOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Documents Service API")
                .description("API for managing documents in Arkive DMS")
                .version("1.0.0"));
    }
}