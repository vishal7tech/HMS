package com.vishal.hms_backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vishal.hms_backend.dto.AuthRequest;
import com.vishal.hms_backend.dto.AuthResponse;
import com.vishal.hms_backend.dto.PatientRequestDTO;
import com.vishal.hms_backend.dto.RegisterRequest;
import com.vishal.hms_backend.entity.Role;
import com.vishal.hms_backend.repository.PatientProfileRepository;
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
        private PatientProfileRepository patientProfileRepository;

        private String adminToken;
        private String doctorToken;
        private String receptionistToken;

        @BeforeEach
        void setUp() throws Exception {
                patientProfileRepository.deleteAll();
                userRepository.deleteAll();

                adminToken = registerAndLogin("adminit", "admin123", Role.ADMIN);
                doctorToken = registerAndLogin("doctorit", "doctor123", Role.DOCTOR);
                receptionistToken = registerAndLogin("receptionistit", "receptionist123", Role.RECEPTIONIST);
        }

        private String registerAndLogin(String username, String password, Role role) throws Exception {
                RegisterRequest registerRequest = new RegisterRequest();
                registerRequest.setUsername(username);
                registerRequest.setPassword(password);
                registerRequest.setRole(role);

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(registerRequest)))
                                .andExpect(status().isOk());

                AuthRequest authRequest = new AuthRequest(username, password);
                MvcResult result = mockMvc.perform(post("/api/auth/login")
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
                PatientRequestDTO request = new PatientRequestDTO();
                request.setUsername("aarav123");
                request.setPassword("password");
                request.setName("Aarav Sharma");
                request.setEmail("aarav.sharma@example.com");
                request.setContactNumber("+919876543210");
                request.setMedicalHistory("Hypertension, Type 2 Diabetes (controlled)");

                mockMvc.perform(post("/api/patients")
                                .header("Authorization", adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.user.name", is("Aarav Sharma")))
                                .andExpect(jsonPath("$.contactNumber", is("+919876543210")))
                                .andExpect(jsonPath("$.medicalHistory",
                                                is("Hypertension, Type 2 Diabetes (controlled)")));
        }

        @Test
        void testDoctorCannotCreatePatient() throws Exception {
                PatientRequestDTO request = new PatientRequestDTO();
                request.setUsername("aarav123");
                request.setPassword("password");
                request.setName("Aarav Sharma");

                mockMvc.perform(post("/api/patients")
                                .header("Authorization", doctorToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isForbidden());
        }

        @Test
        void testReceptionistCanCreateAndReadPatient() throws Exception {
                PatientRequestDTO request = new PatientRequestDTO();
                request.setUsername("aarav123");
                request.setPassword("password");
                request.setName("Aarav Sharma");
                request.setEmail("aarav2@ex.com");

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
                                .andExpect(jsonPath("$.user.name", is("Aarav Sharma")));
        }

        @Test
        void testDoctorCanReadPatient() throws Exception {
                PatientRequestDTO request = new PatientRequestDTO();
                request.setUsername("aarav1234");
                request.setPassword("password");
                request.setName("Aarav Sharma");
                request.setEmail("sharma@ex.com");

                MvcResult result = mockMvc.perform(post("/api/patients")
                                .header("Authorization", adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andReturn();

                Long id = (long) (int) objectMapper.readTree(result.getResponse().getContentAsString()).get("id")
                                .asInt();

                mockMvc.perform(get("/api/patients/" + id)
                                .header("Authorization", doctorToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.user.name", is("Aarav Sharma")));
        }

        @Test
        void testDeletePatientRBAC() throws Exception {
                PatientRequestDTO request = new PatientRequestDTO();
                request.setUsername("delete123");
                request.setPassword("password");
                request.setName("Patient To Delete");
                request.setEmail("del@example.com");

                MvcResult result = mockMvc.perform(post("/api/patients")
                                .header("Authorization", adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andReturn();

                Long id = (long) (int) objectMapper.readTree(result.getResponse().getContentAsString()).get("id")
                                .asInt();

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
