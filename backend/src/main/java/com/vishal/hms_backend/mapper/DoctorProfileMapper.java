package com.vishal.hms_backend.mapper;

import com.vishal.hms_backend.dto.DoctorResponseDTO;
import com.vishal.hms_backend.entity.DoctorProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DoctorProfileMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.name", target = "name")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.enabled", target = "enabled")
    DoctorResponseDTO toResponseDto(DoctorProfile doctorProfile);
}
