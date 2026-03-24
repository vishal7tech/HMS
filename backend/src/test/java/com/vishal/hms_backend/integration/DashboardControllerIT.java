package com.vishal.hms_backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vishal.hms_backend.dto.AuthRequest;
import com.vishal.hms_backend.dto.AuthResponse;
import com.vishal.hms_backend.dto.RegisterRequest;
import com.vishal.hms_backend.entity.Role;
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
public class DashboardControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private String adminToken;
    private String doctorToken;
    private String receptionistToken;

    @BeforeEach
    void setUp() throws Exception {
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
    void testGetDashboardStatsAsAdmin() throws Exception {
        mockMvc.perform(get("/api/dashboard/stats")
                .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPatients", isA(Number.class)))
                .andExpect(jsonPath("$.totalDoctors", isA(Number.class)))
                .andExpect(jsonPath("$.appointmentsToday", isA(Number.class)))
                .andExpect(jsonPath("$.appointmentsInPeriod", isA(Number.class)))
                .andExpect(jsonPath("$.totalRevenue", isA(Number.class)))
                .andExpect(jsonPath("$.completedAppointments", isA(Number.class)))
                .andExpect(jsonPath("$.cancelledAppointments", isA(Number.class)))
                .andExpect(jsonPath("$.pendingBills", isA(Number.class)))
                .andExpect(jsonPath("$.paidBills", isA(Number.class)));
    }

    @Test
    void testGetDashboardStatsAsReceptionist() throws Exception {
        mockMvc.perform(get("/api/dashboard/stats")
                .header("Authorization", receptionistToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPatients", isA(Number.class)))
                .andExpect(jsonPath("$.totalDoctors", isA(Number.class)))
                .andExpect(jsonPath("$.appointmentsToday", isA(Number.class)))
                .andExpect(jsonPath("$.totalRevenue", isA(Number.class)));
    }

    @Test
    void testGetDashboardStatsWithDateRange() throws Exception {
        mockMvc.perform(get("/api/dashboard/stats")
                .header("Authorization", adminToken)
                .param("from", "2024-01-01")
                .param("to", "2024-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPatients", isA(Number.class)))
                .andExpect(jsonPath("$.appointmentsInPeriod", isA(Number.class)));
    }

    @Test
    void testDoctorCannotAccessDashboard() throws Exception {
        mockMvc.perform(get("/api/dashboard/stats")
                .header("Authorization", doctorToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetDashboardStatsDefaultDateRange() throws Exception {
        mockMvc.perform(get("/api/dashboard/stats")
                .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPatients", isA(Number.class)))
                .andExpect(jsonPath("$.appointmentsInPeriod", isA(Number.class)));
    }
}
