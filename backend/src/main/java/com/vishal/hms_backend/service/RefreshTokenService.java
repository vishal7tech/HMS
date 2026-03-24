package com.vishal.hms_backend.service;

import com.vishal.hms_backend.entity.RefreshToken;
import com.vishal.hms_backend.entity.User;
import com.vishal.hms_backend.repository.RefreshTokenRepository;
import com.vishal.hms_backend.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Key;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Value("${jwt.refresh-token.expiration:86400000}") // 24 hours default
    private long refreshTokenExpirationMs;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    @Transactional
    public RefreshToken createRefreshToken(Long userId, HttpServletRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Revoke all existing refresh tokens for this user
        revokeAllUserTokens(userId);

        String token = generateRefreshToken(user);
        LocalDateTime expiryDate = LocalDateTime.now().plusSeconds(refreshTokenExpirationMs / 1000);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .userId(userId)
                .expiryDate(expiryDate)
                .deviceInfo(extractDeviceInfo(request))
                .ipAddress(extractIpAddress(request))
                .build();

        RefreshToken savedToken = refreshTokenRepository.save(refreshToken);
        log.info("Created refresh token for user {} from IP {}", userId, extractIpAddress(request));
        
        return savedToken;
    }

    @Transactional
    public RefreshToken refreshToken(String refreshToken, HttpServletRequest request) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        if (!token.isValid()) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        // Verify the JWT signature and claims
        if (!validateRefreshTokenJWT(refreshToken)) {
            revokeToken(token.getId(), token.getUserId());
            throw new RuntimeException("Invalid refresh token signature");
        }

        // Create new refresh token
        return createRefreshToken(token.getUserId(), request);
    }

    @Transactional
    public void revokeToken(Long tokenId, Long revokedBy) {
        RefreshToken token = refreshTokenRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        token.setRevoked(true);
        token.setRevokedAt(LocalDateTime.now());
        token.setRevokedBy(revokedBy);
        
        refreshTokenRepository.save(token);
        log.info("Revoked refresh token {} by user {}", tokenId, revokedBy);
    }

    @Transactional
    public void revokeAllUserTokens(Long userId) {
        refreshTokenRepository.revokeAllUserTokens(userId);
        log.info("Revoked all refresh tokens for user {}", userId);
    }

    @Transactional
    public void cleanupExpiredTokens() {
        int deletedCount = refreshTokenRepository.deleteExpiredTokens();
        if (deletedCount > 0) {
            log.info("Cleaned up {} expired refresh tokens", deletedCount);
        }
    }

    public boolean isRefreshTokenValid(String token) {
        return refreshTokenRepository.findByToken(token)
                .map(RefreshToken::isValid)
                .orElse(false);
    }

    private String generateRefreshToken(User user) {
        Date expiryDate = new Date(System.currentTimeMillis() + refreshTokenExpirationMs);
        
        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("userId", user.getId())
                .claim("role", user.getRole())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    private String generateRefreshTokenJWT(Long userId, String tokenId) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .claim("tokenId", tokenId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    private boolean validateRefreshTokenJWT(String token) {
        try {
            Claims claims = Jwts.parser()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
            return true;
        } catch (Exception e) {
            log.warn("Invalid refresh token JWT: {}", e.getMessage());
            return false;
        }
    }

    private String extractDeviceInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) return "Unknown";
        
        // Simple device info extraction
        if (userAgent.contains("Mobile")) return "Mobile";
        if (userAgent.contains("Tablet")) return "Tablet";
        if (userAgent.contains("Windows")) return "Windows PC";
        if (userAgent.contains("Mac")) return "Mac";
        if (userAgent.contains("Linux")) return "Linux";
        
        return "Desktop";
    }

    private String extractIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    public int getActiveTokenCount(Long userId) {
        return refreshTokenRepository.countValidTokensByUserId(userId);
    }
}
