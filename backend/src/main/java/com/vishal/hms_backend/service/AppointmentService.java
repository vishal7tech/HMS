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

@Service
@RequiredArgsConstructor
public class AppointmentService {

        private static final Logger log = LoggerFactory.getLogger(AppointmentService.class);
        private final AppointmentRepository appointmentRepo;
        private final PatientRepository patientRepo;
        private final DoctorRepository doctorRepo;
        private final AppointmentMapper mapper;

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

                return mapper.toResponseDto(saved);
        }
}
