package com.example.auth.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Component
public class JwtUtil {

    private final SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS256); // generates a strong key
    private Set<String> invalidatedTokens = new HashSet<>(); // In-memory token blacklist (can replace with Redis or DB)

    // Generate JWT Token
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hour expiry
                .signWith(key)
                .compact();
    }

    // Validate Token (Check if it's in the blacklist and not expired)
    public boolean validate(String token) {
        return !isTokenInvalidated(token) && parseToken(token) != null;
    }

    // Invalidate token (add to blacklist)
    public boolean invalidateToken(String token) {
        if (isTokenInvalidated(token)) {
            return false; // already invalidated
        }
        invalidatedTokens.add(token);  // Store in DB or Redis in production
        return true;
    }

    // Check if a token is in the invalidated set
    private boolean isTokenInvalidated(String token) {
        return invalidatedTokens.contains(token);
    }

    // Extract the username (subject) from the token
    public String extractSubject(String token) {
        Claims claims = parseToken(token).getBody();
        return claims.getSubject();
    }

    // Parse the token to get the claims (throws exception if invalid)
    private Jws<Claims> parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
        } catch (Exception e) {
            return null; // Token is invalid or expired
        }
    }
}
