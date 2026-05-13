package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.AppointmentRequestDTO;
import com.vishal.hms_backend.dto.AppointmentResponseDTO;
import com.vishal.hms_backend.entity.Appointment;
import com.vishal.hms_backend.entity.AppointmentStatus;
import com.vishal.hms_backend.entity.AvailabilitySlot;
import com.vishal.hms_backend.entity.DoctorProfile;
import com.vishal.hms_backend.entity.PatientProfile;
import com.vishal.hms_backend.entity.User;
import com.vishal.hms_backend.exception.ConflictException;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.repository.AvailabilitySlotRepository;
import com.vishal.hms_backend.repository.DoctorProfileRepository;
import com.vishal.hms_backend.repository.PatientProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepo;

    @Mock
    private PatientProfileRepository patientRepo;

    @Mock
    private DoctorProfileRepository doctorRepo;

    @Mock
    private AvailabilitySlotRepository availabilitySlotRepo;

    @Mock
    private EmailService emailService;

    @Mock
    private WebSocketNotificationService webSocketNotificationService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AppointmentService appointmentService;

    private PatientProfile patient;
    private DoctorProfile doctor;
    private Appointment appointment;
    private AppointmentRequestDTO requestDTO;
    private AvailabilitySlot availabilitySlot;

    @BeforeEach
    void setUp() {
        User patientUser = new User();
        patientUser.setName("John Doe");
        patientUser.setEmail("john@example.com");
        patientUser.setId(10L);

        patient = new PatientProfile();
        patient.setId(1L);
        patient.setUser(patientUser);

        User doctorUser = new User();
        doctorUser.setName("Dr. Smith");
        doctorUser.setEmail("smith@example.com");
        doctorUser.setId(11L);

        doctor = new DoctorProfile();
        doctor.setId(2L);
        doctor.setUser(doctorUser);
        doctor.setSpecialization(java.util.List.of("General"));

        LocalDateTime now = LocalDateTime.now();

        appointment = Appointment.builder()
                .id(1L)
                .patient(patient)
                .doctor(doctor)
                .slotTime(now.plusDays(1))
                .endTime(now.plusDays(1).plusMinutes(30))
                .status(AppointmentStatus.SCHEDULED)
                .build();

        availabilitySlot = AvailabilitySlot.builder()
                .id(1L)
                .doctor(doctor)
                .date(now.plusDays(1).toLocalDate())
                .startTime(now.plusDays(1).toLocalTime())
                .endTime(now.plusDays(1).toLocalTime().plusMinutes(30))
                .isAvailable(true)
                .build();

        requestDTO = new AppointmentRequestDTO();
        requestDTO.setPatientId(1L);
        requestDTO.setDoctorId(2L);
        requestDTO.setSlotTime(now.plusDays(1));
        requestDTO.setReason("Checkup");
    }

    @Test
    void bookAppointment_WhenValid_ShouldCreateAndReturnAppointment() {
        when(patientRepo.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepo.findById(2L)).thenReturn(Optional.of(doctor));
        
        List<AvailabilitySlot> slots = new ArrayList<>();
        slots.add(availabilitySlot);
        when(availabilitySlotRepo.findByDoctorIdAndDate(eq(2L), any(LocalDate.class))).thenReturn(slots);
        
        when(appointmentRepo.existsOverlappingAppointment(eq(2L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(false);
        when(appointmentRepo.save(any(Appointment.class))).thenReturn(appointment);

        AppointmentResponseDTO result = appointmentService.bookAppointment(requestDTO);

        assertNotNull(result);
        assertEquals(AppointmentStatus.SCHEDULED, result.getStatus());
        verify(appointmentRepo, times(1)).save(any(Appointment.class));
        verify(webSocketNotificationService, times(1)).notifyAppointmentCreated(any(Appointment.class));
    }

    @Test
    void bookAppointment_WhenOverlap_ShouldReturnSuggestions() {
        when(patientRepo.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepo.findById(2L)).thenReturn(Optional.of(doctor));
        
        List<AvailabilitySlot> slots = new ArrayList<>();
        slots.add(availabilitySlot);
        when(availabilitySlotRepo.findByDoctorIdAndDate(eq(2L), any(LocalDate.class))).thenReturn(slots);
        
        when(appointmentRepo.existsOverlappingAppointment(eq(2L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(true);

        AppointmentResponseDTO result = appointmentService.bookAppointment(requestDTO);

        assertNull(result.getStatus());
        assertNotNull(result.getSuggestedSlots());
        verify(appointmentRepo, never()).save(any(Appointment.class));
    }

    @Test
    void bookAppointment_WhenPatientNotFound_ShouldThrowException() {
        when(patientRepo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> appointmentService.bookAppointment(requestDTO));
    }

    @Test
    void cancelAppointment_WhenValid_ShouldCancel() {
        when(appointmentRepo.findById(1L)).thenReturn(Optional.of(appointment));
        when(appointmentRepo.save(any(Appointment.class))).thenReturn(appointment);

        assertDoesNotThrow(() -> appointmentService.cancelAppointment(1L));

        assertEquals(AppointmentStatus.CANCELLED, appointment.getStatus());
        verify(appointmentRepo, times(1)).save(appointment);
        verify(webSocketNotificationService, times(1)).notifyAppointmentCancelled(appointment);
    }
}
