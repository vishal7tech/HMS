package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.BillingRequestDTO;
import com.vishal.hms_backend.dto.BillingResponseDTO;
import com.vishal.hms_backend.entity.Appointment;
import com.vishal.hms_backend.entity.Billing;
import com.vishal.hms_backend.entity.Patient;
import com.vishal.hms_backend.entity.PaymentStatus;
import com.vishal.hms_backend.mapper.BillingMapper;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.repository.BillingRepository;
import com.vishal.hms_backend.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final BillingRepository billingRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final BillingMapper billingMapper;

    @Transactional
    public BillingResponseDTO createBilling(BillingRequestDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));

        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        Billing billing = Billing.builder()
                .patient(patient)
                .appointment(appointment)
                .amount(dto.getAmount())
                .paymentMethod(dto.getPaymentMethod())
                .paymentStatus(dto.getPaymentStatus() != null ? dto.getPaymentStatus() : PaymentStatus.PENDING)
                .issuedAt(LocalDateTime.now())
                .build();

        Billing saved = billingRepository.save(billing);
        return billingMapper.toResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<BillingResponseDTO> getBillingsByPatient(Long patientId) {
        return billingRepository.findByPatientId(patientId).stream()
                .map(billingMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BillingResponseDTO getBillingById(Long id) {
        Billing billing = billingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Billing not found"));
        return billingMapper.toResponseDto(billing);
    }

    @Transactional
    public void deleteBilling(Long id) {
        if (!billingRepository.existsById(id)) {
            throw new EntityNotFoundException("Billing not found");
        }
        billingRepository.deleteById(id);
    }
}
