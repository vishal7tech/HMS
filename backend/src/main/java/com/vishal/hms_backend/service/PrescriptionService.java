package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.PrescriptionRequestDTO;
import com.vishal.hms_backend.dto.PrescriptionResponseDTO;
import com.vishal.hms_backend.entity.Appointment;
import com.vishal.hms_backend.entity.DoctorProfile;
import com.vishal.hms_backend.entity.PatientProfile;
import com.vishal.hms_backend.entity.Prescription;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.repository.PatientProfileRepository;
import com.vishal.hms_backend.repository.PrescriptionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientProfileRepository patientProfileRepository;

    public PrescriptionResponseDTO createPrescription(PrescriptionRequestDTO dto) {
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        PatientProfile patient = patientProfileRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));

        DoctorProfile doctor = appointment.getDoctor();

        Prescription prescription = Prescription.builder()
                .appointment(appointment)
                .patient(patient)
                .doctor(doctor)
                .diagnosis(dto.getDiagnosis())
                .medication(dto.getMedication())
                .dosage(dto.getDosage())
                .instructions(dto.getInstructions())
                .followUpDate(dto.getFollowUpDate())
                .build();

        Prescription savedPrescription = prescriptionRepository.save(prescription);
        return convertToResponseDTO(savedPrescription);
    }

    public List<PrescriptionResponseDTO> getPrescriptionsByPatient(Long patientId) {
        List<Prescription> prescriptions = prescriptionRepository.findByPatientId(patientId);
        return prescriptions.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<PrescriptionResponseDTO> getPrescriptionsByDoctor(Long doctorId) {
        List<Prescription> prescriptions = prescriptionRepository.findByDoctorId(doctorId);
        return prescriptions.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public PrescriptionResponseDTO getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Prescription not found"));
        return convertToResponseDTO(prescription);
    }

    private PrescriptionResponseDTO convertToResponseDTO(Prescription prescription) {
        PrescriptionResponseDTO dto = new PrescriptionResponseDTO();
        dto.setId(prescription.getId());
        dto.setAppointmentId(prescription.getAppointment().getId());
        dto.setPatientId(prescription.getPatient().getId());
        dto.setPatientName(prescription.getPatient().getFirstName() + " " + prescription.getPatient().getLastName());
        dto.setDoctorId(prescription.getDoctor().getId());
        dto.setDoctorName("Dr. " + prescription.getDoctor().getUser().getName());
        dto.setDiagnosis(prescription.getDiagnosis());
        dto.setMedication(prescription.getMedication());
        dto.setDosage(prescription.getDosage());
        dto.setInstructions(prescription.getInstructions());
        dto.setFollowUpDate(prescription.getFollowUpDate());
        dto.setCreatedAt(prescription.getCreatedAt());
        dto.setUpdatedAt(prescription.getUpdatedAt());
        return dto;
    }
}
