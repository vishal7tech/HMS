package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.PatientRequestDTO;
import com.vishal.hms_backend.dto.PatientResponseDTO;
import com.vishal.hms_backend.entity.PatientProfile;
import com.vishal.hms_backend.entity.Role;
import com.vishal.hms_backend.entity.User;
import com.vishal.hms_backend.mapper.PatientProfileMapper;
import com.vishal.hms_backend.repository.PatientProfileRepository;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.repository.UserRepository;
import com.vishal.hms_backend.entity.Appointment;
import com.vishal.hms_backend.mapper.AppointmentMapper;
import jakarta.persistence.EntityNotFoundException;
import com.vishal.hms_backend.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private static final Logger log = LoggerFactory.getLogger(PatientService.class);

    private final PatientProfileRepository patientProfileRepository;
    private final PatientProfileMapper patientMapper;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentMapper appointmentMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<PatientResponseDTO> getAllPatients() {
        log.info("Fetching all patients");
        return patientProfileRepository.findAll().stream()
                .map(patientMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PatientResponseDTO getPatientById(Long id) {
        log.info("Fetching patient with id: {}", id);
        PatientProfile patient = patientProfileRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + id));
        return patientMapper.toResponseDto(patient);
    }

    @Transactional(readOnly = true)
    public PatientResponseDTO getPatientByUserId(Long userId) {
        log.info("Fetching patient profile for user ID: {}", userId);
        PatientProfile patient = patientProfileRepository.findAll().stream()
                .filter(p -> p.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Patient profile not found for user"));
        return patientMapper.toResponseDto(patient);
    }

    @Transactional
    public PatientResponseDTO createPatient(PatientRequestDTO dto) {
        log.info("Creating new patient: {}", dto.getName());

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        String username = dto.getUsername() != null && !dto.getUsername().isBlank() ? dto.getUsername()
                : dto.getEmail();
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already in use");
        }

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(dto.getPassword()))
                .email(dto.getEmail())
                .name(dto.getName())
                .role(Role.PATIENT)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        String[] nameParts = dto.getName().split("\\s+", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        PatientProfile profile = PatientProfile.builder()
                .user(savedUser)
                .firstName(firstName)
                .lastName(lastName)
                .contactNumber(dto.getContactNumber())
                .address(dto.getAddress())
                .emergencyContact(dto.getEmergencyContact())
                .bloodGroup(dto.getBloodGroup())
                .allergies(dto.getAllergies())
                .dateOfBirth(dto.getDateOfBirth())
                .gender(dto.getGender())
                .medicalHistory(dto.getMedicalHistory())
                .build();

        PatientProfile savedProfile = patientProfileRepository.save(profile);

        // Audit Logging
        try {
            // Simplified logging
            auditService.logCreate("PatientProfile", savedProfile.getId(), savedProfile, savedUser.getId(), null);
        } catch (Exception e) {
            log.error("Failed to log patient creation audit for patient ID {}: {}", savedProfile.getId(),
                    e.getMessage());
        }

        log.info("Successfully created patient profile for user: {}", savedUser.getUsername());

        return patientMapper.toResponseDto(savedProfile);
    }

    @Transactional
    public PatientResponseDTO updatePatient(Long id, PatientRequestDTO dto) {
        log.info("Updating patient id: {}", id);

        PatientProfile patient = patientProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        User user = patient.getUser();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail()); // assuming email updates allowed, need check if exists
        userRepository.save(user);

        String[] nameParts = dto.getName().split("\\s+", 2);
        patient.setFirstName(nameParts[0]);
        patient.setLastName(nameParts.length > 1 ? nameParts[1] : "");

        patient.setContactNumber(dto.getContactNumber());
        patient.setAddress(dto.getAddress());
        patient.setEmergencyContact(dto.getEmergencyContact());
        patient.setBloodGroup(dto.getBloodGroup());
        patient.setAllergies(dto.getAllergies());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setMedicalHistory(dto.getMedicalHistory());

        PatientProfile updated = patientProfileRepository.save(patient);

        try {
            auditService.logUpdate("PatientProfile", id, updated, updated, null, null);
        } catch (Exception e) {
        }

        return patientMapper.toResponseDto(updated);
    }

    @Transactional
    public void deletePatient(Long id) {
        log.info("Deleting patient id: {}", id);
        PatientProfile patient = patientProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        User user = patient.getUser();
        userRepository.delete(user);
        patientProfileRepository.deleteById(id);

        try {
            auditService.logDelete("PatientProfile", id, patient, null, null);
        } catch (Exception e) {
        }

        log.info("Patient deleted successfully");
    }

    @Transactional
    public void togglePatientStatus(Long id, String status) {
        log.info("Toggling patient status for id: {} to: {}", id, status);
        
        PatientProfile patient = patientProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        User user = patient.getUser();
        boolean enabled = "ACTIVE".equalsIgnoreCase(status);
        user.setEnabled(enabled);
        userRepository.save(user);

        try {
            auditService.logUpdate("PatientProfile", id, patient, patient, null, null);
        } catch (Exception e) {
            log.error("Failed to log patient status toggle audit for patient ID {}: {}", id, e.getMessage());
        }

        log.info("Patient status updated successfully to: {}", status);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPatientDashboard(Long userId) {
        log.info("Fetching patient dashboard for user id: {}", userId);
        
        try {
            // Get patient profile
            PatientProfile patient = patientProfileRepository.findByUser_Id(userId)
                    .orElseThrow(() -> new EntityNotFoundException("Patient profile not found for user id: " + userId));
            
            // Get all appointments for this patient
            List<Appointment> appointments = appointmentRepository.findByPatientIdOrderBySlotTimeDesc(patient.getId());
            
            LocalDateTime now = LocalDateTime.now();
            
            // Calculate today's appointments
            long todayAppointments = appointments.stream()
                    .filter(app -> {
                        return app.getSlotTime().toLocalDate().equals(now.toLocalDate());
                    })
                    .count();
            
            // Calculate upcoming appointments
            long upcomingAppointments = appointments.stream()
                    .filter(app -> {
                        return app.getSlotTime().isAfter(now) && !"CANCELLED".equals(app.getStatus().toString());
                    })
                    .count();
            
            // Get medical history (past appointments)
            List<Appointment> medicalHistory = appointments.stream()
                    .filter(app -> {
                        return app.getSlotTime().isBefore(now) || "COMPLETED".equals(app.getStatus().toString());
                    })
                    .collect(Collectors.toList());
            
            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("todayAppointments", (int) todayAppointments);
            response.put("upcomingAppointmentsCount", (int) upcomingAppointments);
            response.put("medicalHistoryStatus", "Uploaded");
            response.put("profileStatus", "Complete");
            response.put("appointments", appointments.stream()
                    .map(appointmentMapper::toResponseDto)
                    .collect(Collectors.toList()));
            response.put("profile", patientMapper.toResponseDto(patient));
            response.put("medicalHistory", medicalHistory.stream()
                    .map(appointmentMapper::toResponseDto)
                    .collect(Collectors.toList()));
            
            return response;
            
        } catch (Exception e) {
            log.error("Error fetching patient dashboard for user id {}: {}", userId, e.getMessage());
            // Return empty dashboard with defaults
            Map<String, Object> response = new HashMap<>();
            response.put("todayAppointments", 0);
            response.put("upcomingAppointmentsCount", 0);
            response.put("medicalHistoryStatus", "Not Available");
            response.put("profileStatus", "Incomplete");
            response.put("appointments", List.of());
            response.put("profile", null);
            response.put("medicalHistory", List.of());
            return response;
        }
    }
}
