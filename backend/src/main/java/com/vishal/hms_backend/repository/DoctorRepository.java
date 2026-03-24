package com.vishal.hms_backend.repository;

import com.vishal.hms_backend.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findBySpecializationContainingIgnoreCase(String spec);

    Optional<Doctor> findByEmail(String email);

    boolean existsByEmail(String email);
}
