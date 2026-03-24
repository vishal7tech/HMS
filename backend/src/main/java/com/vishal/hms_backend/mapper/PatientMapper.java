package com.vishal.hms_backend.mapper;

import com.vishal.hms_backend.dto.PatientRequestDTO;
import com.vishal.hms_backend.dto.PatientResponseDTO;
import com.vishal.hms_backend.entity.Patient;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PatientMapper {

    PatientResponseDTO toResponseDto(Patient patient);

    Patient toEntity(PatientRequestDTO dto);
}
