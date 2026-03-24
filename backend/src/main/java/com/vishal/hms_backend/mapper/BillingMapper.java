package com.vishal.hms_backend.mapper;

import com.vishal.hms_backend.dto.BillingRequestDTO;
import com.vishal.hms_backend.dto.BillingResponseDTO;
import com.vishal.hms_backend.entity.Billing;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BillingMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "appointment", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "issuedAt", ignore = true)
    Billing toEntity(BillingRequestDTO dto);

    @Mapping(source = "appointment.id", target = "appointmentId")
    @Mapping(source = "patient.name", target = "patientName")
    BillingResponseDTO toResponseDto(Billing billing);
}
