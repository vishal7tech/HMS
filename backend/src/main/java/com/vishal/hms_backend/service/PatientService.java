package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.PatientRequestDTO;
import com.vishal.hms_backend.dto.PatientResponseDTO;
import com.vishal.hms_backend.entity.Patient;
import com.vishal.hms_backend.mapper.PatientMapper;
import com.vishal.hms_backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private static final Logger log = LoggerFactory.getLogger(PatientService.class);

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    @Transactional(readOnly = true)
    public List<PatientResponseDTO> getAllPatients() {
        log.info("Fetching all patients");
        return patientRepository.findAll().stream()
                .map(patientMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PatientResponseDTO getPatientById(Long id) {
        log.info("Fetching patient with id: {}", id);
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        return patientMapper.toResponseDto(patient);
    }

    @Transactional
    public PatientResponseDTO createPatient(PatientRequestDTO dto) {
        log.info("Creating new patient: {}", dto.getName());

        if (patientRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        Patient patient = patientMapper.toEntity(dto);
        Patient saved = patientRepository.save(patient);
        log.info("Patient created successfully with id: {}", saved.getId());

        return patientMapper.toResponseDto(saved);
    }

    @Transactional
    public PatientResponseDTO updatePatient(Long id, PatientRequestDTO dto) {
        log.info("Updating patient id: {}", id);

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Update only provided fields (or use MapStruct @MappingTarget)
        patient.setName(dto.getName());
        patient.setAge(dto.getAge());
        patient.setEmail(dto.getEmail());
        patient.setPhoneNumber(dto.getPhoneNumber());
        patient.setMedicalHistory(dto.getMedicalHistory());
        patient.setAddress(dto.getAddress());
        patient.setGender(dto.getGender());
        patient.setDateOfBirth(dto.getDateOfBirth());

        Patient updated = patientRepository.save(patient);
        return patientMapper.toResponseDto(updated);
    }

    @Transactional
    public void deletePatient(Long id) {
        log.info("Deleting patient id: {}", id);
        if (!patientRepository.existsById(id)) {
            throw new RuntimeException("Patient not found");
        }
        patientRepository.deleteById(id);
        log.info("Patient deleted successfully");
    }
}
