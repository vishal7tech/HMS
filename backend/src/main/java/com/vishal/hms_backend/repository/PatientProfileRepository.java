package com.vishal.hms_backend.repository;

import com.vishal.hms_backend.entity.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {

    boolean existsByUser_Email(String email);

    List<PatientProfile> findByUser_NameContainingIgnoreCase(String namePart);

    Optional<PatientProfile> findByUser_Email(String email);

    Optional<PatientProfile> findByUser_Username(String username);

    Optional<PatientProfile> findByUser_Id(Long userId);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = ?1 ORDER BY a.slotTime DESC")
    List<Map<String, Object>> findAppointmentsByPatientId(Long patientId);
}
