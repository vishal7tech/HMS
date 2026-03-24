package com.vishal.hms_backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Slf4j
public class RateLimitingService {

    private final ConcurrentHashMap<String, AtomicLong> requestCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> windowStarts = new ConcurrentHashMap<>();

    public boolean isAllowed(String key, int maxRequests, Duration window) {
        try {
            String redisKey = "rate_limit:" + key;
            long currentTime = System.currentTimeMillis();
            long windowMillis = window.toMillis();
            
            // Get or create window start time
            Long windowStart = windowStarts.computeIfAbsent(redisKey, k -> currentTime);
            
            // Reset window if expired
            if (currentTime - windowStart > windowMillis) {
                windowStarts.put(redisKey, currentTime);
                requestCounts.put(redisKey, new AtomicLong(0));
            }
            
            // Increment counter
            AtomicLong counter = requestCounts.computeIfAbsent(redisKey, k -> new AtomicLong(0));
            long currentCount = counter.incrementAndGet();
            
            boolean allowed = currentCount <= maxRequests;
            
            if (!allowed) {
                log.warn("Rate limit exceeded for key: {}. Count: {}, Max: {}", key, currentCount, maxRequests);
            }
            
            return allowed;
        } catch (Exception e) {
            log.error("Error checking rate limit for key: {}", key, e);
            // Fail open - allow request if there's an error
            return true;
        }
    }

    public boolean isLoginAllowed(String ipAddress, String username) {
        // Strict rate limiting for login attempts
        String key = "login:" + (username != null ? username : ipAddress);
        return isAllowed(key, 5, Duration.ofMinutes(15)); // 5 attempts per 15 minutes
    }

    public boolean isPasswordResetAllowed(String email) {
        String key = "password_reset:" + email;
        return isAllowed(key, 3, Duration.ofHours(1)); // 3 attempts per hour
    }

    public boolean isApiCallAllowed(String userId, String endpoint) {
        String key = "api:" + userId + ":" + endpoint;
        return isAllowed(key, 100, Duration.ofMinutes(1)); // 100 requests per minute per endpoint
    }

    public boolean isRegistrationAllowed(String ipAddress) {
        String key = "register:" + ipAddress;
        return isAllowed(key, 3, Duration.ofHours(1)); // 3 registrations per hour per IP
    }

    public void resetRateLimit(String key) {
        try {
            String redisKey = "rate_limit:" + key;
            requestCounts.remove(redisKey);
            windowStarts.remove(redisKey);
            log.info("Reset rate limit for key: {}", key);
        } catch (Exception e) {
            log.error("Error resetting rate limit for key: {}", key, e);
        }
    }

    public long getRemainingRequests(String key, int maxRequests, Duration window) {
        try {
            String redisKey = "rate_limit:" + key;
            AtomicLong counter = requestCounts.get(redisKey);
            if (counter == null) {
                return maxRequests;
            }
            long currentCount = counter.get();
            return Math.max(0, maxRequests - currentCount);
        } catch (Exception e) {
            log.error("Error getting remaining requests for key: {}", key, e);
            return maxRequests;
        }
    }
}
