package com.vishal.hms_backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vishal.hms_backend.dto.AuthRequest;
import com.vishal.hms_backend.dto.AuthResponse;
import com.vishal.hms_backend.dto.BillingRequestDTO;
import com.vishal.hms_backend.dto.RegisterRequest;
import com.vishal.hms_backend.entity.Role;
import com.vishal.hms_backend.repository.BillingRepository;
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

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class BillingControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BillingRepository billingRepository;

    private String adminToken;
    private String doctorToken;
    private String receptionistToken;

    @BeforeEach
    void setUp() throws Exception {
        billingRepository.deleteAll();
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
    void testCreateBillSuccess() throws Exception {
        // First create patient and appointment
        Long patientId = createTestPatient();
        Long appointmentId = createTestAppointment();

        BillingRequestDTO request = BillingRequestDTO.builder()
                .patientId(patientId)
                .appointmentId(appointmentId)
                .amount(new BigDecimal("200.00"))
                .paymentMethod("CASH")
                .build();

        mockMvc.perform(post("/api/billings")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.patientId", is(patientId.intValue())))
                .andExpect(jsonPath("$.appointmentId", is(appointmentId.intValue())))
                .andExpect(jsonPath("$.amount", is(200.00)))
                .andExpect(jsonPath("$.paymentMethod", is("CASH")))
                .andExpect(jsonPath("$.paymentStatus", is("PENDING")));
    }

    @Test
    void testDoctorCannotCreateBill() throws Exception {
        Long patientId = createTestPatient();
        Long appointmentId = createTestAppointment();

        BillingRequestDTO request = BillingRequestDTO.builder()
                .patientId(patientId)
                .appointmentId(appointmentId)
                .amount(new BigDecimal("200.00"))
                .paymentMethod("CASH")
                .build();

        mockMvc.perform(post("/api/billings")
                .header("Authorization", doctorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testReceptionistCanCreateBill() throws Exception {
        Long patientId = createTestPatient();
        Long appointmentId = createTestAppointment();

        BillingRequestDTO request = BillingRequestDTO.builder()
                .patientId(patientId)
                .appointmentId(appointmentId)
                .amount(new BigDecimal("200.00"))
                .paymentMethod("CARD")
                .build();

        mockMvc.perform(post("/api/billings")
                .header("Authorization", receptionistToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void testUpdatePaymentStatus() throws Exception {
        Long patientId = createTestPatient();
        Long appointmentId = createTestAppointment();

        // Create bill
        BillingRequestDTO request = BillingRequestDTO.builder()
                .patientId(patientId)
                .appointmentId(appointmentId)
                .amount(new BigDecimal("200.00"))
                .paymentMethod("CASH")
                .build();

        MvcResult result = mockMvc.perform(post("/api/billings")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long billingId = (long) (int) objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();

        // Update payment status to PAID
        mockMvc.perform(put("/api/billings/" + billingId + "/payment-status")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"paymentStatus\":\"PAID\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus", is("PAID")));
    }

    @Test
    void testGetBillsByPatient() throws Exception {
        Long patientId = createTestPatient();
        Long appointmentId = createTestAppointment();

        // Create bill
        BillingRequestDTO request = BillingRequestDTO.builder()
                .patientId(patientId)
                .appointmentId(appointmentId)
                .amount(new BigDecimal("200.00"))
                .paymentMethod("CASH")
                .build();

        mockMvc.perform(post("/api/billings")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Get bills by patient
        mockMvc.perform(get("/api/billings/patient/" + patientId)
                .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].patientId", is(patientId.intValue())));
    }

    @Test
    void testGetPendingBills() throws Exception {
        Long patientId = createTestPatient();
        Long appointmentId = createTestAppointment();

        // Create pending bill
        BillingRequestDTO request = BillingRequestDTO.builder()
                .patientId(patientId)
                .appointmentId(appointmentId)
                .amount(new BigDecimal("200.00"))
                .paymentMethod("CASH")
                .build();

        mockMvc.perform(post("/api/billings")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Get pending bills
        mockMvc.perform(get("/api/billings/pending")
                .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].paymentStatus", is("PENDING")));
    }

    @Test
    void testDeleteBill() throws Exception {
        Long patientId = createTestPatient();
        Long appointmentId = createTestAppointment();

        // Create bill
        BillingRequestDTO request = BillingRequestDTO.builder()
                .patientId(patientId)
                .appointmentId(appointmentId)
                .amount(new BigDecimal("200.00"))
                .paymentMethod("CASH")
                .build();

        MvcResult result = mockMvc.perform(post("/api/billings")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long billingId = (long) (int) objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();

        // Delete bill
        mockMvc.perform(delete("/api/billings/" + billingId)
                .header("Authorization", adminToken))
                .andExpect(status().isNoContent());
    }

    private Long createTestPatient() throws Exception {
        String patientJson = "{\"name\":\"Test Patient\",\"email\":\"patient@test.com\",\"phone\":\"1234567890\",\"dateOfBirth\":\"1990-01-01\"}";
        
        MvcResult result = mockMvc.perform(post("/api/patients")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(patientJson))
                .andExpect(status().isCreated())
                .andReturn();

        return (long) (int) objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();
    }

    private Long createTestAppointment() throws Exception {
        Long patientId = createTestPatient();
        Long doctorId = createTestDoctor();
        
        String appointmentJson = String.format(
            "{\"patientId\":%d,\"doctorId\":%d,\"dateTime\":\"2024-12-25T10:00:00\",\"reason\":\"Test appointment\"}",
            patientId, doctorId
        );
        
        MvcResult result = mockMvc.perform(post("/api/appointments")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(appointmentJson))
                .andExpect(status().isCreated())
                .andReturn();

        return (long) (int) objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();
    }

    private Long createTestDoctor() throws Exception {
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
