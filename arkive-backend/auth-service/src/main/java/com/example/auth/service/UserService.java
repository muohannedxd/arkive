package com.example.auth.service;

import com.example.auth.dto.LoginResponse;
import com.example.auth.model.User;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
public class UserService {

    private final RestTemplate restTemplate = new RestTemplate();

    public LoginResponse getByEmail(String email, String password) {
        String url = "http://localhost:5000/api/users/validate";

        Map<String, String> requestBody = Map.of("email", email, "password", password);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(
                    url, request, (Class<Map<String, Object>>) (Class<?>) Map.class);

            Map<String, Object> body = response.getBody();

            if (response.getStatusCode() == HttpStatus.OK && body != null) {
                Map<String, Object> data = (Map<String, Object>) body.get("data");

                ObjectMapper mapper = new ObjectMapper();
                User user = mapper.convertValue(data, User.class);

                return new LoginResponse(true, "Login successful", user);
            }

            return new LoginResponse(false, "Unknown error", null);

        } catch (HttpClientErrorException ex) {
            String responseBody = ex.getResponseBodyAsString();
            try {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> errorBody = mapper.readValue(responseBody, Map.class);

                String message = (String) errorBody.get("message");
                if (message == null || message.isBlank()) {
                    message = "Unauthorized: Incorrect password.";
                }

                return new LoginResponse(false, message, null);

            } catch (Exception jsonEx) {
                if (ex.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                    return new LoginResponse(false, "Incorrect password.", null);
                }
                return new LoginResponse(false, "Auth service error: " + ex.getStatusText(), null);
            }
        }

    }

}
