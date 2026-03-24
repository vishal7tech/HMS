package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.AppointmentRequestDTO;
import com.vishal.hms_backend.dto.AppointmentResponseDTO;
import com.vishal.hms_backend.entity.Appointment;
import com.vishal.hms_backend.entity.AppointmentStatus;
import com.vishal.hms_backend.entity.Doctor;
import com.vishal.hms_backend.entity.Patient;
import com.vishal.hms_backend.exception.ConflictException;
import com.vishal.hms_backend.mapper.AppointmentMapper;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.repository.DoctorRepository;
import com.vishal.hms_backend.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
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
        private final PatientRepository patientRepo;
        private final DoctorRepository doctorRepo;
        private final AppointmentMapper mapper;
        private final EmailService emailService;

        private static final Duration DEFAULT_DURATION = Duration.ofMinutes(30);

        @Transactional
        public AppointmentResponseDTO bookAppointment(AppointmentRequestDTO dto) {
                Patient patient = patientRepo.findById(dto.getPatientId())
                                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));

                Doctor doctor = doctorRepo.findById(dto.getDoctorId())
                                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

                LocalDateTime start = dto.getDateTime();
                LocalDateTime end = start.plus(DEFAULT_DURATION);

                if (appointmentRepo.existsOverlappingAppointment(doctor.getId(), start, end)) {
                        log.warn("Overlap detected for doctor {} at {}", doctor.getId(), start);
                        throw new ConflictException("Selected time slot is already booked");
                }

                Appointment appointment = Appointment.builder()
                                .patient(patient)
                                .doctor(doctor)
                                .dateTime(start)
                                .endTime(end)
                                .reason(dto.getReason())
                                .notes(dto.getNotes())
                                .status(AppointmentStatus.SCHEDULED)
                                .build();

                Appointment saved = appointmentRepo.save(appointment);
                log.info("Appointment booked: {} -> Dr.{}", patient.getName(), doctor.getName());
                
                // Send confirmation email
                emailService.sendAppointmentConfirmation(saved);

                return mapper.toResponseDto(saved);
        }

        @Transactional(readOnly = true)
        public List<AppointmentResponseDTO> getAppointmentsByPatient(Long patientId) {
                return appointmentRepo.findByPatientIdOrderByDateTimeDesc(patientId).stream()
                                .map(mapper::toResponseDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<AppointmentResponseDTO> getAppointmentsByDoctor(Long doctorId) {
                return appointmentRepo.findByDoctorIdOrderByDateTimeAsc(doctorId).stream()
                                .map(mapper::toResponseDto)
                                .collect(Collectors.toList());
        }

        @Transactional
        public AppointmentResponseDTO rescheduleAppointment(Long appointmentId, LocalDateTime newDateTime) {
                Appointment appointment = appointmentRepo.findById(appointmentId)
                                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

                if (appointment.getStatus() == AppointmentStatus.CANCELLED || 
                    appointment.getStatus() == AppointmentStatus.COMPLETED) {
                        throw new ConflictException("Cannot reschedule cancelled or completed appointment");
                }

                LocalDateTime newEnd = newDateTime.plus(DEFAULT_DURATION);

                if (appointmentRepo.existsOverlappingAppointment(appointment.getDoctor().getId(), newDateTime, newEnd)) {
                        throw new ConflictException("Selected time slot is already booked");
                }

                appointment.setDateTime(newDateTime);
                appointment.setEndTime(newEnd);
                
                Appointment saved = appointmentRepo.save(appointment);
                log.info("Appointment rescheduled: {} to {}", appointmentId, newDateTime);
                
                // Send reschedule confirmation email
                emailService.sendAppointmentConfirmation(saved);

                return mapper.toResponseDto(saved);
        }

        @Transactional
        public void cancelAppointment(Long appointmentId) {
                Appointment appointment = appointmentRepo.findById(appointmentId)
                                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

                if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
                        throw new ConflictException("Appointment is already cancelled");
                }

                appointment.setStatus(AppointmentStatus.CANCELLED);
                appointmentRepo.save(appointment);
                
                log.info("Appointment cancelled: {}", appointmentId);
                
                // Send cancellation email
                emailService.sendAppointmentCancellation(appointment);
        }

        @Transactional
        public void completeAppointment(Long appointmentId) {
                Appointment appointment = appointmentRepo.findById(appointmentId)
                                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

                if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
                        throw new ConflictException("Only scheduled appointments can be marked as completed");
                }

                appointment.setStatus(AppointmentStatus.COMPLETED);
                appointmentRepo.save(appointment);
                
                log.info("Appointment completed: {}", appointmentId);
        }

        @Transactional(readOnly = true)
        public List<AppointmentResponseDTO> getTodayAppointments() {
                LocalDateTime start = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
                LocalDateTime end = start.plusDays(1);
                
                return appointmentRepo.findAll().stream()
                                .filter(a -> !a.getDateTime().isBefore(start) && !a.getDateTime().isAfter(end))
                                .map(mapper::toResponseDto)
                                .collect(Collectors.toList());
        }
}
