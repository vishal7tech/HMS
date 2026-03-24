package com.vishal.hms_backend.mapper;

import com.vishal.hms_backend.dto.PatientRequestDTO;
import com.vishal.hms_backend.dto.PatientResponseDTO;
import com.vishal.hms_backend.entity.PatientProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PatientProfileMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.name", target = "name")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.enabled", target = "enabled")
    PatientResponseDTO toResponseDto(PatientProfile patientProfile);

    // We do not use MapStruct for Request->Entity directly here because we must
    // create the User entity separately.
}
