package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.AppointmentRequestDTO;
import com.vishal.hms_backend.dto.AppointmentResponseDTO;
import com.vishal.hms_backend.entity.Appointment;
import com.vishal.hms_backend.entity.AppointmentStatus;
import com.vishal.hms_backend.entity.DoctorProfile;
import com.vishal.hms_backend.entity.PatientProfile;
import com.vishal.hms_backend.event.AppointmentCompletedEvent;
import com.vishal.hms_backend.exception.ConflictException;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.repository.DoctorProfileRepository;
import com.vishal.hms_backend.repository.PatientProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

        private static final Logger log = LoggerFactory.getLogger(AppointmentService.class);

        private final AppointmentRepository appointmentRepo;
        private final PatientProfileRepository patientRepo;
        private final DoctorProfileRepository doctorRepo;
        private final EmailService emailService;
        private final AuditService auditService;
        private final WebSocketNotificationService webSocketNotificationService;
        private final ApplicationEventPublisher eventPublisher;

        private static final Duration DEFAULT_DURATION = Duration.ofMinutes(30);

        @Transactional
        public AppointmentResponseDTO bookAppointment(AppointmentRequestDTO dto) {
                // Validate that patientId is present (should be set by controller for patients)
                if (dto.getPatientId() == null) {
                        throw new IllegalArgumentException("Patient ID is required");
                }
                
                PatientProfile patient = patientRepo.findById(dto.getPatientId())
                                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));

                DoctorProfile doctor = doctorRepo.findById(dto.getDoctorId())
                                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

                LocalDateTime start = dto.getSlotTime();
                LocalDateTime end = start.plus(DEFAULT_DURATION);

                if (appointmentRepo.existsOverlappingAppointment(doctor.getId(), start, end)) {
                        log.warn("Overlap detected for doctor {} at {}", doctor.getId(), start);
                        List<LocalDateTime> suggestions = suggestAlternatives(doctor.getId(), start);
                        return AppointmentResponseDTO.builder()
                                        .doctorId(doctor.getId())
                                        .doctorName(doctor.getUser().getName())
                                        .slotTime(start)
                                        .status(null)
                                        .suggestedSlots(suggestions)
                                        .build();
                }

                Appointment appointment = Appointment.builder()
                                .patient(patient)
                                .doctor(doctor)
                                .slotTime(start)
                                .endTime(end)
                                .reason(dto.getReason())
                                .notes(dto.getNotes())
                                .status(AppointmentStatus.SCHEDULED)
                                .build();

                Appointment saved = appointmentRepo.save(appointment);
                log.info("Appointment booked: {} -> Dr.{}", patient.getUser().getName(), doctor.getUser().getName());

                try {
                        auditService.logCreate("Appointment", saved.getId(), saved, patient.getUser().getId(), null);
                } catch (Exception e) {
                }

                emailService.sendAppointmentConfirmation(saved);
                webSocketNotificationService.notifyAppointmentCreated(saved);

                return toResponseDto(saved);
        }

        @Transactional(readOnly = true)
        public List<LocalDateTime> suggestAlternatives(Long doctorId, LocalDateTime requestedTime) {
                log.info("Suggesting alternatives for doctor {} around {}", doctorId, requestedTime);
                List<LocalDateTime> suggestions = new java.util.ArrayList<>();
                LocalDateTime current = requestedTime.plus(DEFAULT_DURATION);
                int found = 0;
                while (found < 3 && current.isBefore(requestedTime.plusDays(1))) {
                        LocalDateTime end = current.plus(DEFAULT_DURATION);
                        if (!appointmentRepo.existsOverlappingAppointment(doctorId, current, end)) {
                                suggestions.add(current);
                                found++;
                        }
                        current = current.plus(DEFAULT_DURATION);
                }
                return suggestions;
        }

        @Transactional(readOnly = true)
        public List<AppointmentResponseDTO> getAppointmentsByPatient(Long patientId) {
                return appointmentRepo.findByPatientIdOrderBySlotTimeDesc(patientId).stream()
                                .map(this::toResponseDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<AppointmentResponseDTO> getAppointmentsByPatientUsername(String username) {
                PatientProfile patient = patientRepo.findByUser_Username(username)
                                .orElseThrow(() -> new EntityNotFoundException("Patient profile not found"));
                return getAppointmentsByPatient(patient.getId());
        }

        @Transactional(readOnly = true)
        public List<AppointmentResponseDTO> getAppointmentsByDoctor(Long doctorId) {
                return appointmentRepo.findByDoctorIdOrderBySlotTimeAsc(doctorId).stream()
                                .map(this::toResponseDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<AppointmentResponseDTO> getAppointmentsByDoctorUsername(String username) {
                DoctorProfile doctor = doctorRepo.findByUser_Username(username)
                                .orElseThrow(() -> new EntityNotFoundException("Doctor profile not found"));
                return getAppointmentsByDoctor(doctor.getId());
        }

        @Transactional
        public AppointmentResponseDTO rescheduleAppointment(Long appointmentId, LocalDateTime slotTime) {
                Appointment appointment = appointmentRepo.findById(appointmentId)
                                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

                if (appointment.getStatus() == AppointmentStatus.CANCELLED ||
                                appointment.getStatus() == AppointmentStatus.COMPLETED) {
                        throw new ConflictException("Cannot reschedule cancelled or completed appointment");
                }

                LocalDateTime newEnd = slotTime.plus(DEFAULT_DURATION);

                if (appointmentRepo.existsOverlappingAppointment(appointment.getDoctor().getId(), slotTime, newEnd)) {
                        List<LocalDateTime> suggestions = suggestAlternatives(appointment.getDoctor().getId(),
                                        slotTime);
                        return AppointmentResponseDTO.builder()
                                        .id(appointmentId)
                                        .doctorId(appointment.getDoctor().getId())
                                        .status(null)
                                        .suggestedSlots(suggestions)
                                        .build();
                }

                Appointment oldState = appointmentRepo.findById(appointmentId).orElse(null);
                appointment.setSlotTime(slotTime);
                appointment.setEndTime(newEnd);
                Appointment saved = appointmentRepo.save(appointment);

                try {
                        auditService.logUpdate("Appointment", appointmentId, oldState, saved, null, null);
                } catch (Exception e) {
                }

                emailService.sendAppointmentConfirmation(saved);
                webSocketNotificationService.notifyAppointmentUpdated(saved);

                return toResponseDto(saved);
        }

        @Transactional
        public void cancelAppointment(Long appointmentId) {
                Appointment appointment = appointmentRepo.findById(appointmentId)
                                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

                if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.COMPLETED) {
                        throw new ConflictException("Cannot cancel an already cancelled or completed appointment");
                }

                Appointment oldState = appointmentRepo.findById(appointmentId).orElse(null);
                appointment.setStatus(AppointmentStatus.CANCELLED);
                Appointment saved = appointmentRepo.save(appointment);

                try {
                        auditService.logUpdate("Appointment", appointmentId, oldState, saved, null, null);
                } catch (Exception e) {
                }

                emailService.sendAppointmentCancellation(saved);
                webSocketNotificationService.notifyAppointmentCancelled(saved);
        }

        @Transactional
        public void completeAppointment(Long appointmentId) {
                Appointment appointment = appointmentRepo.findById(appointmentId)
                                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

                if (appointment.getStatus() != AppointmentStatus.SCHEDULED && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
                        throw new ConflictException("Only scheduled or confirmed appointments can be marked as completed");
                }

                Appointment oldState = appointmentRepo.findById(appointmentId).orElse(null);
                appointment.setStatus(AppointmentStatus.COMPLETED);
                Appointment saved = appointmentRepo.save(appointment);

                try {
                        auditService.logUpdate("Appointment", appointmentId, oldState, saved, null, null);
                } catch (Exception e) {
                }

                webSocketNotificationService.notifyAppointmentCompleted(saved);
                
                // Publish event for automatic invoice generation
                eventPublisher.publishEvent(new AppointmentCompletedEvent(this, appointmentId));
        }

        @Transactional(readOnly = true)
        public List<AppointmentResponseDTO> getAllAppointments() {
                return appointmentRepo.findAll().stream()
                                .map(this::toResponseDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<AppointmentResponseDTO> getAppointmentsByStatus(AppointmentStatus status) {
                return appointmentRepo.findByStatus(status).stream()
                                .map(this::toResponseDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<AppointmentResponseDTO> getTodayAppointments() {
                LocalDateTime start = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
                LocalDateTime end = start.plusDays(1);
                return appointmentRepo.findAll().stream()
                                .filter(a -> !a.getSlotTime().isBefore(start) && !a.getSlotTime().isAfter(end))
                                .map(this::toResponseDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public PatientProfile getPatientByUsername(String username) {
                return patientRepo.findByUser_Username(username)
                                .orElseThrow(() -> new EntityNotFoundException("Patient not found for username: " + username));
        }

        private AppointmentResponseDTO toResponseDto(Appointment appointment) {
                return AppointmentResponseDTO.builder()
                                .id(appointment.getId())
                                .patientId(appointment.getPatient().getId())
                                .patientName(appointment.getPatient().getUser().getName())
                                .doctorId(appointment.getDoctor().getId())
                                .doctorName(appointment.getDoctor().getUser().getName())
                                .slotTime(appointment.getSlotTime())
                                .endTime(appointment.getEndTime())
                                .reason(appointment.getReason())
                                .notes(appointment.getNotes())
                                .status(appointment.getStatus())
                                .build();
        }
}
