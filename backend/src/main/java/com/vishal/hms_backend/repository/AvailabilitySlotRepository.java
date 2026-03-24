package com.vishal.hms_backend.repository;

import com.vishal.hms_backend.entity.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {

    List<AvailabilitySlot> findByDoctorIdAndDate(Long doctorId, LocalDate date);

    List<AvailabilitySlot> findByDoctorIdAndDateBetween(Long doctorId, LocalDate startDate, LocalDate endDate);

    List<AvailabilitySlot> findByDoctorId(Long doctorId);

    List<AvailabilitySlot> findByIsAvailableTrue();
}
