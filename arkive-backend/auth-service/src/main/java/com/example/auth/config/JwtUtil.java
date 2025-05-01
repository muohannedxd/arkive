package com.example.auth.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Component
public class JwtUtil {

    private final SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS256); // strong secret

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private static final long EXPIRATION_MS = 7776000000L;

    // Generate JWT Token
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(key)
                .compact();
    }

    // Validate Token (check blacklist + parse)
    public boolean validate(String token) {
        return parseToken(token) != null && !isTokenInvalidated(token);
    }

    // Invalidate token using Redis with TTL
    public boolean invalidateToken(String token) {
        if (isTokenInvalidated(token)) return false;

        long ttl = getRemainingTokenTime(token);
        if (ttl > 0) {
            redisTemplate.opsForValue().set(token, "blacklisted", ttl, TimeUnit.MILLISECONDS);
            return true;
        }
        return false;
    }

    // Check Redis for blacklisted token
    private boolean isTokenInvalidated(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(token));
    }

    // Extract subject (email/username)
    public String extractSubject(String token) {
        Jws<Claims> parsed = parseToken(token);
        return (parsed != null) ? parsed.getBody().getSubject() : null;
    }

    // Parse the token (returns null if invalid or expired)
    private Jws<Claims> parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    // Compute remaining validity time in ms
    private long getRemainingTokenTime(String token) {
        Jws<Claims> parsed = parseToken(token);
        if (parsed == null) return 0;

        Date expiration = parsed.getBody().getExpiration();
        return expiration.getTime() - System.currentTimeMillis();
    }
}
