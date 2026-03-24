package com.vishal.hms_backend.repository;

import com.vishal.hms_backend.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {

    @Query("SELECT d FROM DoctorProfile d JOIN d.specialization s WHERE LOWER(s) LIKE LOWER(CONCAT('%', :spec, '%'))")
    List<DoctorProfile> findBySpecializationContainingIgnoreCase(@Param("spec") String spec);

    Optional<DoctorProfile> findByUser_Email(String email);

    Optional<DoctorProfile> findByUser_Username(String username);

    boolean existsByUser_Email(String email);
}
