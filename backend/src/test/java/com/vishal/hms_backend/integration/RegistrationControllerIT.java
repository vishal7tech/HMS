package com.vishal.hms_backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vishal.hms_backend.dto.AuthRequest;
import com.vishal.hms_backend.dto.DoctorRegistrationDto;
import com.vishal.hms_backend.dto.PatientRegistrationDto;
import com.vishal.hms_backend.dto.StaffRegistrationDto;
import com.vishal.hms_backend.entity.Role;
import com.vishal.hms_backend.entity.User;
import com.vishal.hms_backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class RegistrationControllerIT {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PatientProfileRepository patientProfileRepository;

        @Autowired
        private DoctorProfileRepository doctorProfileRepository;

        @Autowired
        private AppointmentRepository appointmentRepository;

        @Autowired
        private AvailabilitySlotRepository availabilitySlotRepository;

        @Autowired
        private InvoiceRepository invoiceRepository;

        @Autowired
        private PaymentRepository paymentRepository;

        @Autowired
        private AuditLogRepository auditLogRepository;

        @Autowired
        private RefreshTokenRepository refreshTokenRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        private String adminToken;

        @BeforeEach
        void setUp() throws Exception {
                auditLogRepository.deleteAll();
                paymentRepository.deleteAll();
                invoiceRepository.deleteAll();
                appointmentRepository.deleteAll();
                availabilitySlotRepository.deleteAll();
                refreshTokenRepository.deleteAll();
                patientProfileRepository.deleteAll();
                doctorProfileRepository.deleteAll();
                userRepository.deleteAll();

                // Create Admin manually in repository
                User admin = User.builder()
                                .username("admin@test.com")
                                .password(passwordEncoder.encode("password123"))
                                .role(Role.ADMIN)
                                .email("admin@test.com")
                                .name("Super Admin")
                                .enabled(true)
                                .build();
                userRepository.save(admin);

                // Log in to get token
                String loginResponse = mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper
                                                .writeValueAsString(new AuthRequest("admin@test.com", "password123"))))
                                .andExpect(status().isOk())
                                .andReturn().getResponse().getContentAsString();
                adminToken = "Bearer " + objectMapper.readTree(loginResponse).get("token").asText();
        }

        @Test
        void testPatientRegistration() throws Exception {
                PatientRegistrationDto dto = PatientRegistrationDto.builder()
                                .firstName("John")
                                .lastName("Doe")
                                .email("john@doe.com")
                                .password("password123")
                                .confirmPassword("password123")
                                .dateOfBirth(LocalDate.of(1985, 5, 20))
                                .gender("Male")
                                .phoneNumber("9876543210")
                                .address("123 Main St")
                                .bloodGroup("O+")
                                .emergencyContactName("Jane Doe")
                                .emergencyContactPhone("1122334455")
                                .emergencyContactRelationship("Spouse")
                                .build();

                mockMvc.perform(post("/api/auth/register/patient")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.token").exists());
        }

        @Test
        void testDoctorRegistrationByAdmin() throws Exception {
                DoctorRegistrationDto dto = DoctorRegistrationDto.builder()
                                .firstName("Dr")
                                .lastName("Strange")
                                .email("strange@marvel.com")
                                .password("magic123")
                                .confirmPassword("magic123")
                                .phoneNumber("5554443322")
                                .dateOfBirth(LocalDate.of(1970, 10, 10))
                                .gender("Male")
                                .specializations(List.of("Neurology", "General Medicine"))
                                .qualifications("MD, PhD")
                                .experienceYears(20)
                                .build();

                mockMvc.perform(post("/api/auth/register/doctor")
                                .header("Authorization", adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isOk());
        }

        @Test
        void testReceptionistRegistrationByAdmin() throws Exception {
                StaffRegistrationDto dto = StaffRegistrationDto.builder()
                                .firstName("Sarah")
                                .lastName("Receptionist")
                                .email("sarah@hms.com")
                                .password("sarah123")
                                .confirmPassword("sarah123")
                                .role(Role.RECEPTIONIST)
                                .department("Front Desk")
                                .dateOfBirth(LocalDate.of(1995, 3, 15))
                                .gender("Female")
                                .phoneNumber("9998887776")
                                .build();

                mockMvc.perform(post("/api/auth/register/staff")
                                .header("Authorization", adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isOk());
        }
}
