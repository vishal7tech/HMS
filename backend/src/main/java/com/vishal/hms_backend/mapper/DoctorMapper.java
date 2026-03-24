package com.vishal.hms_backend.mapper;

import com.vishal.hms_backend.dto.DoctorRequestDTO;
import com.vishal.hms_backend.dto.DoctorResponseDTO;
import com.vishal.hms_backend.entity.Doctor;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DoctorMapper {

    DoctorResponseDTO toResponseDto(Doctor doctor);

    Doctor toEntity(DoctorRequestDTO dto);
}
