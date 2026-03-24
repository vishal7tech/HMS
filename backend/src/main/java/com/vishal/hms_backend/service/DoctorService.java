package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.DoctorRequestDTO;
import com.vishal.hms_backend.dto.DoctorResponseDTO;
import com.vishal.hms_backend.entity.DoctorProfile;
import com.vishal.hms_backend.entity.Role;
import com.vishal.hms_backend.entity.User;
import com.vishal.hms_backend.mapper.DoctorProfileMapper;
import com.vishal.hms_backend.repository.DoctorProfileRepository;
import com.vishal.hms_backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.mapper.AppointmentMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private static final Logger log = LoggerFactory.getLogger(DoctorService.class);

    private final DoctorProfileRepository doctorProfileRepository;
    private final DoctorProfileMapper doctorMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final AppointmentRepository appointmentRepo;
    private final AppointmentMapper appointmentMapper;

    @Transactional(readOnly = true)
    public List<DoctorResponseDTO> getAllDoctors() {
        return doctorProfileRepository.findAll().stream()
                .map(doctorMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DoctorResponseDTO getDoctorById(Long id) {
        DoctorProfile doctor = doctorProfileRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + id));
        return doctorMapper.toResponseDto(doctor);
    }

    @Transactional(readOnly = true)
    public DoctorResponseDTO getDoctorByUserId(Long userId) {
        DoctorProfile doctorProfile = doctorProfileRepository.findAll().stream()
                .filter(d -> d.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Doctor profile not found for user"));
        return doctorMapper.toResponseDto(doctorProfile);
    }

    @Transactional
    public DoctorResponseDTO createDoctor(DoctorRequestDTO dto) {
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
                .role(Role.DOCTOR)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);
        DoctorProfile doctorProfile = DoctorProfile.builder()
                .user(savedUser)
                .contactNumber(dto.getContactNumber())
                .specialization(dto.getSpecialization())
                .qualifications(dto.getQualifications())
                .build();

        DoctorProfile savedProfile = doctorProfileRepository.save(doctorProfile);
        try {
            auditService.logCreate("DoctorProfile", savedProfile.getId(), savedProfile, savedUser.getId(), null);
        } catch (Exception e) {
        }

        return doctorMapper.toResponseDto(savedProfile);
    }

    @Transactional
    public DoctorResponseDTO updateDoctor(Long id, DoctorRequestDTO dto) {
        DoctorProfile doctor = doctorProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        DoctorProfile oldState = doctorProfileRepository.findById(id).orElse(null);

        User user = doctor.getUser();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        userRepository.save(user);

        doctor.setContactNumber(dto.getContactNumber());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setQualifications(dto.getQualifications());

        DoctorProfile updated = doctorProfileRepository.save(doctor);
        try {
            auditService.logUpdate("DoctorProfile", id, oldState, updated, null, null);
        } catch (Exception e) {
        }

        return doctorMapper.toResponseDto(updated);
    }

    @Transactional
    public void deleteDoctor(Long id) {
        DoctorProfile doctor = doctorProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        User user = doctor.getUser();
        userRepository.delete(user);
        doctorProfileRepository.deleteById(id);
        try {
            auditService.logDelete("DoctorProfile", id, doctor, null, null);
        } catch (Exception e) {
        }
    }

    @Transactional
    public DoctorResponseDTO updateDoctorStatus(Long id, boolean enabled) {
        DoctorProfile doctor = doctorProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        DoctorProfile oldState = doctorProfileRepository.findById(id).orElse(null);

        User user = doctor.getUser();
        user.setEnabled(enabled);
        userRepository.save(user);

        DoctorProfile updated = doctorProfileRepository.findById(id).orElse(null);
        try {
            auditService.logUpdate("DoctorProfile", id, oldState, updated, null, null);
        } catch (Exception e) {
        }

        return doctorMapper.toResponseDto(doctorProfileRepository.findById(id).get());
    }

    @Transactional(readOnly = true)
    public List<com.vishal.hms_backend.dto.AppointmentResponseDTO> getAppointmentsByDoctorId(Long doctorId) {
        return appointmentRepo.findByDoctorIdOrderBySlotTimeAsc(doctorId).stream()
                .map(appointmentMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDoctorDashboard(Long userId) {
        DoctorProfile doctor = doctorProfileRepository.findAll().stream()
                .filter(d -> d.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Doctor profile not found for user"));

        LocalDate today = LocalDate.now();
        
        // Get today's appointments
        List<com.vishal.hms_backend.entity.Appointment> todayAppointments = appointmentRepo
                .findByDoctorIdAndSlotTimeBetween(
                        doctor.getId(),
                        today.atStartOfDay(),
                        today.plusDays(1).atStartOfDay()
                );

        // Get upcoming appointments (next 7 days)
        List<com.vishal.hms_backend.entity.Appointment> upcomingAppointments = appointmentRepo
                .findByDoctorIdAndSlotTimeAfterOrderBySlotTimeAsc(
                        doctor.getId(),
                        LocalDateTime.now()
                );

        // Count unique patients
        long totalPatients = appointmentRepo.findByDoctorId(doctor.getId()).stream()
                .map(appointment -> appointment.getPatient().getUser().getId())
                .distinct()
                .count();

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("todayAppointments", todayAppointments.size());
        dashboard.put("totalPatients", (int) totalPatients);
        dashboard.put("pendingPrescriptions", 0); // TODO: Implement when prescription module is ready
        dashboard.put("specialization", doctor.getSpecialization());
        
        // Map upcoming appointments to response format
        List<Map<String, String>> upcomingAppointmentsData = upcomingAppointments.stream()
                .limit(4)
                .map(apt -> {
                    Map<String, String> aptData = new HashMap<>();
                    aptData.put("id", apt.getId().toString());
                    aptData.put("patientName", apt.getPatient().getUser().getName());
                    aptData.put("date", apt.getSlotTime().toLocalDate().toString());
                    aptData.put("time", apt.getSlotTime().toLocalTime().toString());
                    return aptData;
                })
                .collect(Collectors.toList());
        
        dashboard.put("upcomingAppointments", upcomingAppointmentsData);
        
        return dashboard;
    }
}
