package com.example.auth.controller;

import com.example.auth.config.JwtUtil;
import com.example.auth.dto.LoginResponse;
import com.example.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

   @Autowired
   private UserService userService;

   @Autowired
   private JwtUtil jwtUtil;

   // Handle Login
   @PostMapping("/login")
   public ResponseEntity<?> login(@RequestBody Map<String, String> userData) {
      String email = userData.get("email");
      String password = userData.get("password");

      LoginResponse loginResponse = userService.getByEmail(email, password);
      if (loginResponse.isSuccess()) {
         String token = jwtUtil.generateToken(email);
         return ResponseEntity.ok(Map.of(
               "token", token,
               "message", loginResponse.getMessage(),
               "user", loginResponse.getUser()));
      }

      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
            "error", loginResponse.getMessage()));
   }

   // Handle Logout
   @PostMapping("/logout")
   public ResponseEntity<?> logout(HttpServletRequest request) {
      String token = extractTokenFromRequest(request);
      if (token == null) {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
               "error", "Missing or malformed Authorization header"));
      }
      if (!jwtUtil.validate(token)) {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
               "error", "Invalid or expired token"));
      }
      jwtUtil.invalidateToken(token);
      return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
   }

   // Home route
   @GetMapping("/")
   public String home() {
      return "Authentication service is running!";
   }

   // Utility method to extract the token from the Authorization header
   private String extractTokenFromRequest(HttpServletRequest request) {
      String authHeader = request.getHeader("Authorization");
      if (authHeader != null && authHeader.startsWith("Bearer ")) {
         return authHeader.substring(7);
      }
      return null;
   }
}
