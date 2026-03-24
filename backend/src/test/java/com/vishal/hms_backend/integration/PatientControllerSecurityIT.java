package com.vishal.hms_backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vishal.hms_backend.dto.AuthRequest;
import com.vishal.hms_backend.dto.AuthResponse;
import com.vishal.hms_backend.dto.PatientRequestDTO;
import com.vishal.hms_backend.dto.RegisterRequest;
import com.vishal.hms_backend.entity.Role;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PatientControllerSecurityIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    private String adminToken;
    private String doctorToken;
    private String receptionistToken;

    @BeforeEach
    void setUp() throws Exception {
        userRepository.deleteAll();
        patientRepository.deleteAll();

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
    void testCreatePatientWithCamelCaseFields() throws Exception {
        PatientRequestDTO request = PatientRequestDTO.builder()
                .name("Aarav Sharma")
                .age(34)
                .email("aarav.sharma@example.com")
                .phoneNumber("+919876543210")
                .medicalHistory("Hypertension, Type 2 Diabetes (controlled)")
                .build();

        mockMvc.perform(post("/api/patients")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Aarav Sharma")))
                .andExpect(jsonPath("$.phoneNumber", is("+919876543210")))
                .andExpect(jsonPath("$.medicalHistory", is("Hypertension, Type 2 Diabetes (controlled)")));
    }

    @Test
    void testDoctorCannotCreatePatient() throws Exception {
        PatientRequestDTO request = PatientRequestDTO.builder()
                .name("Aarav Sharma")
                .build();

        mockMvc.perform(post("/api/patients")
                .header("Authorization", doctorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testReceptionistCanCreateAndReadPatient() throws Exception {
        PatientRequestDTO request = PatientRequestDTO.builder()
                .name("Aarav Sharma")
                .build();

        MvcResult result = mockMvc.perform(post("/api/patients")
                .header("Authorization", receptionistToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseString = result.getResponse().getContentAsString();
        Long id = (long) (int) objectMapper.readTree(responseString).get("id").asInt();

        mockMvc.perform(get("/api/patients/" + id)
                .header("Authorization", receptionistToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Aarav Sharma")));
    }

    @Test
    void testDoctorCanReadPatient() throws Exception {
        // Create by admin first
        PatientRequestDTO request = PatientRequestDTO.builder()
                .name("Aarav Sharma")
                .build();

        MvcResult result = mockMvc.perform(post("/api/patients")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long id = (long) (int) objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();

        mockMvc.perform(get("/api/patients/" + id)
                .header("Authorization", doctorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Aarav Sharma")));
    }

    @Test
    void testDeletePatientRBAC() throws Exception {
        // Create partition
        PatientRequestDTO request = PatientRequestDTO.builder()
                .name("Patient To Delete")
                .build();

        MvcResult result = mockMvc.perform(post("/api/patients")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long id = (long) (int) objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();

        // Doctor should get 403
        mockMvc.perform(delete("/api/patients/" + id)
                .header("Authorization", doctorToken))
                .andExpect(status().isForbidden());

        // Receptionist should get 403
        mockMvc.perform(delete("/api/patients/" + id)
                .header("Authorization", receptionistToken))
                .andExpect(status().isForbidden());

        // Admin should get 204
        mockMvc.perform(delete("/api/patients/" + id)
                .header("Authorization", adminToken))
                .andExpect(status().isNoContent());
    }
}
