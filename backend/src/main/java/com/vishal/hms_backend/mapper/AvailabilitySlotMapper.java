package com.vishal.hms_backend.mapper;

import com.vishal.hms_backend.dto.AvailabilitySlotRequestDTO;
import com.vishal.hms_backend.dto.AvailabilitySlotResponseDTO;
import com.vishal.hms_backend.entity.AvailabilitySlot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AvailabilitySlotMapper {

    @Mapping(source = "doctor.id", target = "doctorId")
    @Mapping(source = "doctor.user.name", target = "doctorName")
    AvailabilitySlotResponseDTO toResponseDto(AvailabilitySlot slot);

    @Mapping(target = "doctor", ignore = true)
    AvailabilitySlot toEntity(AvailabilitySlotRequestDTO requestDto);
}
