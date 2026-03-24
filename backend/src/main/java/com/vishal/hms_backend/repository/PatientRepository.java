package com.vishal.hms_backend.repository;

import com.vishal.hms_backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    boolean existsByEmail(String email);

    List<Patient> findByNameContainingIgnoreCase(String namePart);

    Optional<Patient> findByEmail(String email);
}
