package com.vishal.hms_backend.controller;

import com.vishal.hms_backend.dto.*;
import com.vishal.hms_backend.entity.User;
import com.vishal.hms_backend.repository.UserRepository;
import com.vishal.hms_backend.service.AuditService;
import com.vishal.hms_backend.service.AuthService;
import com.vishal.hms_backend.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuditService auditService;
    private final AuthService authService;

    public AuthController(AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            AuditService auditService,
            AuthService authService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.auditService = auditService;
        this.authService = authService;
    }

    @PostMapping("/register/patient")
    public ResponseEntity<AuthResponse> registerPatient(@Valid @RequestBody PatientRegistrationDto request) {
        // WINDSURF-ADDED: Registration for PATIENT
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new AuthResponse("Passwords do not match"));
        }
        User user = authService.registerPatient(request);
        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/register/doctor")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> registerDoctor(@Valid @RequestBody DoctorRegistrationDto request) {
        // WINDSURF-ADDED: Registration for DOCTOR
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Passwords do not match");
        }
        authService.registerDoctor(request);
        return ResponseEntity.ok("Doctor registered successfully");
    }

    @PostMapping("/register/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> registerStaff(@Valid @RequestBody StaffRegistrationDto request) {
        // WINDSURF-ADDED: Registration for RECEPTIONIST, BILLING, ADMIN
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Passwords do not match");
        }
        authService.registerStaff(request);
        return ResponseEntity.ok(request.getRole() + " registered successfully");
    }

    @PostMapping("/register")
    @Deprecated
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        // Set email and name (using username as email if not provided)
        user.setEmail(request.getUsername().contains("@") ? request.getUsername() : request.getUsername() + "@hms.com");
        user.setName(request.getRole() + " User");

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request,
            HttpServletRequest httpRequest) {

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));

            User user = (User) authentication.getPrincipal();
            String token = jwtUtil.generateToken(user);

            // Log successful login
            auditService.logLogin(user.getId(), httpRequest);

            return ResponseEntity.ok(new AuthResponse(token));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse("Invalid username or password"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        return ResponseEntity.ok(authentication.getPrincipal());
    }
}
