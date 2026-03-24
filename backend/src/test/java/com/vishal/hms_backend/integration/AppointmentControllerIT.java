package com.vishal.hms_backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vishal.hms_backend.dto.AppointmentRequestDTO;
import com.vishal.hms_backend.dto.AuthRequest;
import com.vishal.hms_backend.dto.AuthResponse;
import com.vishal.hms_backend.dto.RegisterRequest;
import com.vishal.hms_backend.entity.Role;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.repository.DoctorRepository;
import com.vishal.hms_backend.repository.PatientRepository;
import com.vishal.hms_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AppointmentControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    private String adminToken;
    private String doctorToken;
    private String receptionistToken;

    @BeforeEach
    void setUp() throws Exception {
        appointmentRepository.deleteAll();
        doctorRepository.deleteAll();
        patientRepository.deleteAll();
        userRepository.deleteAll();

        adminToken = registerAndLogin("admin", "admin123", Role.ADMIN);
        doctorToken = registerAndLogin("doctor", "doctor123", Role.DOCTOR);
        receptionistToken = registerAndLogin("receptionist", "receptionist123", Role.RECEPTIONIST);
    }

    private String registerAndLogin(String username, String password, Role role) throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername(username);
        registerRequest.setPassword(password);
        registerRequest.setRole(role);

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        AuthRequest authRequest = new AuthRequest(username, password);
        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseString = result.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseString, AuthResponse.class);
        return "Bearer " + authResponse.getToken();
    }

    @Test
    void testCreateAppointmentSuccess() throws Exception {
        // First create a patient and doctor
        Long patientId = createTestPatient();
        Long doctorId = createTestDoctor();

        AppointmentRequestDTO request = AppointmentRequestDTO.builder()
                .patientId(patientId)
                .doctorId(doctorId)
                .dateTime(LocalDateTime.now().plusDays(1))
                .reason("Regular checkup")
                .notes("Patient complains of headache")
                .build();

        mockMvc.perform(post("/api/appointments")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.patientId", is(patientId.intValue())))
                .andExpect(jsonPath("$.doctorId", is(doctorId.intValue())))
                .andExpect(jsonPath("$.reason", is("Regular checkup")))
                .andExpect(jsonPath("$.status", is("SCHEDULED")));
    }

    @Test
    void testCreateAppointmentWithOverlappingTime() throws Exception {
        Long patientId = createTestPatient();
        Long doctorId = createTestDoctor();
        LocalDateTime appointmentTime = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);

        // Create first appointment
        AppointmentRequestDTO firstRequest = AppointmentRequestDTO.builder()
                .patientId(patientId)
                .doctorId(doctorId)
                .dateTime(appointmentTime)
                .reason("First appointment")
                .build();

        mockMvc.perform(post("/api/appointments")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(firstRequest)))
                .andExpect(status().isCreated());

        // Try to create overlapping appointment
        AppointmentRequestDTO overlappingRequest = AppointmentRequestDTO.builder()
                .patientId(patientId)
                .doctorId(doctorId)
                .dateTime(appointmentTime.plusMinutes(15))
                .reason("Overlapping appointment")
                .build();

        mockMvc.perform(post("/api/appointments")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(overlappingRequest)))
                .andExpect(status().isConflict());
    }

    @Test
    void testRescheduleAppointment() throws Exception {
        Long patientId = createTestPatient();
        Long doctorId = createTestDoctor();
        LocalDateTime originalTime = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
        LocalDateTime newTime = LocalDateTime.now().plusDays(2).withHour(14).withMinute(0);

        // Create appointment
        AppointmentRequestDTO request = AppointmentRequestDTO.builder()
                .patientId(patientId)
                .doctorId(doctorId)
                .dateTime(originalTime)
                .reason("Regular checkup")
                .build();

        MvcResult result = mockMvc.perform(post("/api/appointments")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long appointmentId = (long) (int) objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();

        // Reschedule appointment
        mockMvc.perform(put("/api/appointments/" + appointmentId + "/reschedule")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newTime)))
                .andExpect(status().isOk());
    }

    @Test
    void testCancelAppointment() throws Exception {
        Long patientId = createTestPatient();
        Long doctorId = createTestDoctor();

        // Create appointment
        AppointmentRequestDTO request = AppointmentRequestDTO.builder()
                .patientId(patientId)
                .doctorId(doctorId)
                .dateTime(LocalDateTime.now().plusDays(1))
                .reason("Regular checkup")
                .build();

        MvcResult result = mockMvc.perform(post("/api/appointments")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long appointmentId = (long) (int) objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();

        // Cancel appointment
        mockMvc.perform(delete("/api/appointments/" + appointmentId)
                .header("Authorization", adminToken))
                .andExpect(status().isNoContent());
    }

    @Test
    void testGetAppointmentsByRole() throws Exception {
        Long patientId = createTestPatient();
        Long doctorId = createTestDoctor();

        // Create appointment
        AppointmentRequestDTO request = AppointmentRequestDTO.builder()
                .patientId(patientId)
                .doctorId(doctorId)
                .dateTime(LocalDateTime.now().plusDays(1))
                .reason("Regular checkup")
                .build();

        mockMvc.perform(post("/api/appointments")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Admin can access all appointments
        mockMvc.perform(get("/api/appointments")
                .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        // Doctor can access appointments
        mockMvc.perform(get("/api/appointments")
                .header("Authorization", doctorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        // Receptionist can access appointments
        mockMvc.perform(get("/api/appointments")
                .header("Authorization", receptionistToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    private Long createTestPatient() throws Exception {
        // Create patient through API
        String patientJson = "{\"name\":\"Test Patient\",\"email\":\"patient@test.com\",\"phone\":\"1234567890\",\"dateOfBirth\":\"1990-01-01\"}";
        
        MvcResult result = mockMvc.perform(post("/api/patients")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(patientJson))
                .andExpect(status().isCreated())
                .andReturn();

        return (long) (int) objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();
    }

    private Long createTestDoctor() throws Exception {
        // Create doctor through API
        String doctorJson = "{\"name\":\"Test Doctor\",\"email\":\"doctor@test.com\",\"phone\":\"1234567890\",\"specialization\":\"General Medicine\",\"experience\":10}";
        
        MvcResult result = mockMvc.perform(post("/api/doctors")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(doctorJson))
                .andExpect(status().isCreated())
                .andReturn();

        return (long) (int) objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();
    }
}
