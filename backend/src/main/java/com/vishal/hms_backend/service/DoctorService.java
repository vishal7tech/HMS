package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.DoctorRequestDTO;
import com.vishal.hms_backend.dto.DoctorResponseDTO;
import com.vishal.hms_backend.entity.Doctor;
import com.vishal.hms_backend.mapper.DoctorMapper;
import com.vishal.hms_backend.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private static final Logger log = LoggerFactory.getLogger(DoctorService.class);

    private final DoctorRepository doctorRepository;
    private final DoctorMapper doctorMapper;

    @Transactional(readOnly = true)
    public List<DoctorResponseDTO> getAllDoctors() {
        log.info("Fetching all doctors");
        return doctorRepository.findAll().stream()
                .map(doctorMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DoctorResponseDTO getDoctorById(Long id) {
        log.info("Fetching doctor with id: {}", id);
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        return doctorMapper.toResponseDto(doctor);
    }

    @Transactional
    public DoctorResponseDTO createDoctor(DoctorRequestDTO dto) {
        log.info("Creating new doctor: {}", dto.getName());

        if (doctorRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        Doctor doctor = doctorMapper.toEntity(dto);
        Doctor saved = doctorRepository.save(doctor);
        log.info("Doctor created successfully with id: {}", saved.getId());

        return doctorMapper.toResponseDto(saved);
    }

    @Transactional
    public void deleteDoctor(Long id) {
        log.info("Deleting doctor id: {}", id);
        if (!doctorRepository.existsById(id)) {
            throw new RuntimeException("Doctor not found");
        }
        doctorRepository.deleteById(id);
        log.info("Doctor deleted successfully");
    }

    private final com.vishal.hms_backend.repository.AppointmentRepository appointmentRepo;
    private final com.vishal.hms_backend.mapper.AppointmentMapper appointmentMapper;

    @Transactional(readOnly = true)
    public List<com.vishal.hms_backend.dto.AppointmentResponseDTO> getAppointmentsByDoctorId(Long doctorId) {
        log.info("Fetching appointments for doctor id: {}", doctorId);
        return appointmentRepo.findByDoctorIdOrderByDateTimeAsc(doctorId).stream()
                .map(appointmentMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
