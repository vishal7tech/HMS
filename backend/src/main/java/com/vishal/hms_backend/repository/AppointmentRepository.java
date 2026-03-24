package com.vishal.hms_backend.repository;

import com.vishal.hms_backend.entity.Appointment;
import com.vishal.hms_backend.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

        @Query("SELECT COUNT(a) > 0 FROM Appointment a " +
                        "WHERE a.doctor.id = :doctorId " +
                        "AND a.status NOT IN (com.vishal.hms_backend.entity.AppointmentStatus.CANCELLED, com.vishal.hms_backend.entity.AppointmentStatus.NO_SHOW) "
                        +
                        "AND ((a.dateTime < :end AND a.endTime > :start))")
        boolean existsOverlappingAppointment(
                        @Param("doctorId") Long doctorId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        List<Appointment> findByDoctorIdAndDateTimeBetween(
                        Long doctorId, LocalDateTime start, LocalDateTime end);

        List<Appointment> findByPatientIdOrderByDateTimeDesc(Long patientId);

        List<Appointment> findByDoctorIdOrderByDateTimeAsc(Long doctorId);

        long countByDateTimeBetween(LocalDateTime start, LocalDateTime end);

        long countByStatus(AppointmentStatus status);
}
