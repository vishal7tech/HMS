package com.vishal.hms_backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vishal.hms_backend.dto.AppointmentRequestDTO;
import com.vishal.hms_backend.dto.AuthRequest;
import com.vishal.hms_backend.dto.AuthResponse;
import com.vishal.hms_backend.dto.RegisterRequest;
import com.vishal.hms_backend.dto.PatientRequestDTO;
import com.vishal.hms_backend.dto.DoctorRequestDTO;
import com.vishal.hms_backend.entity.Role;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.repository.DoctorProfileRepository;
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
        private PatientProfileRepository patientProfileRepository;

        @Autowired
        private DoctorProfileRepository doctorProfileRepository;

        @Autowired
        private AppointmentRepository appointmentRepository;

        private String adminToken;
        private String doctorToken;
        private String receptionistToken;

        @BeforeEach
        void setUp() throws Exception {
                appointmentRepository.deleteAll();
                doctorProfileRepository.deleteAll();
                patientProfileRepository.deleteAll();
                userRepository.deleteAll();

                adminToken = registerAndLogin("admin_apt", "admin123", Role.ADMIN);
                doctorToken = registerAndLogin("doctor_apt", "doctor123", Role.DOCTOR);
                receptionistToken = registerAndLogin("receptionist_apt", "receptionist123", Role.RECEPTIONIST);
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
        void testCreateAppointmentSuccess() throws Exception {
                Long patientId = createTestPatient();
                Long doctorId = createTestDoctor();

                AppointmentRequestDTO request = new AppointmentRequestDTO();
                request.setPatientId(patientId);
                request.setDoctorId(doctorId);
                request.setSlotTime(LocalDateTime.now().plusDays(1));
                request.setReason("Regular checkup");
                request.setNotes("Patient complains of headache");

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
        void testCancelAppointment() throws Exception {
                Long patientId = createTestPatient();
                Long doctorId = createTestDoctor();

                AppointmentRequestDTO request = new AppointmentRequestDTO();
                request.setPatientId(patientId);
                request.setDoctorId(doctorId);
                request.setSlotTime(LocalDateTime.now().plusDays(1));
                request.setReason("Regular checkup");

                MvcResult result = mockMvc.perform(post("/api/appointments")
                                .header("Authorization", adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andReturn();

                Long appointmentId = (long) (int) objectMapper.readTree(result.getResponse().getContentAsString())
                                .get("id").asInt();

                mockMvc.perform(delete("/api/appointments/" + appointmentId)
                                .header("Authorization", adminToken))
                                .andExpect(status().isNoContent());
        }

        private Long createTestPatient() throws Exception {
                PatientRequestDTO request = new PatientRequestDTO();
                request.setUsername("testpatient" + System.currentTimeMillis());
                request.setPassword("pass");
                request.setName("Test Patient");
                request.setEmail("patient" + System.currentTimeMillis() + "@test.com");

                MvcResult result = mockMvc.perform(post("/api/patients")
                                .header("Authorization", adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andReturn();

                return (long) (int) objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();
        }

        private Long createTestDoctor() throws Exception {
                DoctorRequestDTO request = new DoctorRequestDTO();
                request.setUsername("testdoc" + System.currentTimeMillis());
                request.setPassword("pass");
                request.setName("Test Doctor");
                request.setEmail("doctor" + System.currentTimeMillis() + "@test.com");
                request.setSpecialization(java.util.List.of("General Medicine"));

                MvcResult result = mockMvc.perform(post("/api/doctors")
                                .header("Authorization", adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andReturn();

                return (long) (int) objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();
        }
}
