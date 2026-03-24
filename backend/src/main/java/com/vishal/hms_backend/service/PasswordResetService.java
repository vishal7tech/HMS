package com.vishal.hms_backend.service;

import com.vishal.hms_backend.entity.User;
import com.vishal.hms_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final RateLimitingService rateLimitingService;

    @Value("${app.password-reset.token-expiration-minutes:30}")
    private int tokenExpirationMinutes;

    private static final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public String initiatePasswordReset(String email, String ipAddress) {
        if (!rateLimitingService.isPasswordResetAllowed(email)) {
            throw new RuntimeException("Too many password reset attempts. Please try again later.");
        }

        Optional<User> userOpt = userRepository.findByUsername(email);
        if (userOpt.isEmpty()) {
            // Don't reveal if email exists or not
            log.info("Password reset requested for non-existent email: {}", email);
            return "If the email exists, a reset link has been sent.";
        }

        User user = userOpt.get();
        String resetToken = generateSecureToken();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(tokenExpirationMinutes);

        // Store reset token (you might want to create a separate table for this)
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpiry(expiryTime);
        userRepository.save(user);

        // Send reset email
        try {
            emailService.sendPasswordResetEmail(user.getUsername(), resetToken);
            log.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", email, e);
            throw new RuntimeException("Failed to send reset email. Please try again.");
        }

        return "If the email exists, a reset link has been sent.";
    }

    @Transactional
    public String resetPassword(String token, String newPassword, String ipAddress) {
        Optional<User> userOpt = userRepository.findByPasswordResetToken(token);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid or expired reset token.");
        }

        User user = userOpt.get();
        if (user.getPasswordResetExpiry() == null || user.getPasswordResetExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired.");
        }

        // Validate new password strength
        if (!isPasswordStrong(newPassword)) {
            throw new RuntimeException("Password does not meet security requirements.");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);

        // Send confirmation email
        try {
            emailService.sendPasswordChangeConfirmation(user.getUsername());
            log.info("Password reset completed for user: {}", user.getUsername());
        } catch (Exception e) {
            log.error("Failed to send password change confirmation to: {}", user.getUsername(), e);
        }

        return "Password has been reset successfully.";
    }

    @Transactional
    public String changePassword(Long userId, String currentPassword, String newPassword, String ipAddress) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found.");
        }

        User user = userOpt.get();
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect.");
        }

        // Validate new password
        if (!isPasswordStrong(newPassword)) {
            throw new RuntimeException("New password does not meet security requirements.");
        }

        // Check if new password is same as current
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("New password must be different from current password.");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);

        // Revoke all refresh tokens for this user
        // refreshTokenService.revokeAllUserTokens(userId);

        // Send confirmation email
        try {
            emailService.sendPasswordChangeConfirmation(user.getUsername());
            log.info("Password changed for user: {}", user.getUsername());
        } catch (Exception e) {
            log.error("Failed to send password change confirmation to: {}", user.getUsername(), e);
        }

        return "Password changed successfully.";
    }

    private String generateSecureToken() {
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    private boolean isPasswordStrong(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }

        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;

        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true;
        }

        return hasUpper && hasLower && hasDigit && hasSpecial;
    }

    @Transactional
    public void cleanupExpiredTokens() {
        userRepository.clearExpiredPasswordResetTokens(LocalDateTime.now());
        log.info("Cleaned up expired password reset tokens");
    }
}
