package com.vishal.hms_backend.mapper;

import com.vishal.hms_backend.dto.AppointmentRequestDTO;
import com.vishal.hms_backend.dto.AppointmentResponseDTO;
import com.vishal.hms_backend.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(source = "patient.id", target = "patientId")
    @Mapping(source = "patient.name", target = "patientName")
    @Mapping(source = "doctor.id", target = "doctorId")
    @Mapping(source = "doctor.name", target = "doctorName")
    AppointmentResponseDTO toResponseDto(Appointment appointment);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "endTime", ignore = true)
    Appointment toEntity(AppointmentRequestDTO dto);
}
