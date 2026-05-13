package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.AvailabilitySlotRequestDTO;
import com.vishal.hms_backend.dto.AvailabilitySlotResponseDTO;
import com.vishal.hms_backend.entity.Appointment;
import com.vishal.hms_backend.entity.AppointmentStatus;
import com.vishal.hms_backend.entity.AvailabilitySlot;
import com.vishal.hms_backend.entity.DoctorProfile;
import com.vishal.hms_backend.repository.AppointmentRepository;
import com.vishal.hms_backend.repository.AvailabilitySlotRepository;
import com.vishal.hms_backend.repository.DoctorProfileRepository;
import com.vishal.hms_backend.mapper.AvailabilitySlotMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilitySlotService {

    private final AvailabilitySlotRepository availabilitySlotRepo;
    private final DoctorProfileRepository doctorProfileRepo;
    private final AppointmentRepository appointmentRepo;
    private final AvailabilitySlotMapper mapper;
    private final SimpMessagingTemplate messagingTemplate;

    public AvailabilitySlotResponseDTO createSlot(AvailabilitySlotRequestDTO request) {
        DoctorProfile doctor = doctorProfileRepo.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + request.getDoctorId()));

        AvailabilitySlot slot = mapper.toEntity(request);
        slot.setDoctor(doctor);
        slot.setIsAvailable(true);

        AvailabilitySlot savedSlot = availabilitySlotRepo.save(slot);
        AvailabilitySlotResponseDTO responseDTO = mapper.toResponseDto(savedSlot);

        // Broadcast WebSocket update for real-time tracking (Receptionist feature)
        messagingTemplate.convertAndSend("/topic/availability/" + doctor.getId(), responseDTO);
        messagingTemplate.convertAndSend("/topic/availability", responseDTO);

        return responseDTO;
    }

    public List<AvailabilitySlotResponseDTO> getSlotsByDoctorAndDate(Long doctorId, LocalDate date) {
        List<AvailabilitySlot> slots = availabilitySlotRepo.findByDoctorIdAndDate(doctorId, date);
        
        // Filter slots that are available and not yet booked
        return slots.stream()
                .filter(slot -> Boolean.TRUE.equals(slot.getIsAvailable()))
                .filter(slot -> !isSlotBooked(doctorId, slot.getDate(), slot.getStartTime(), slot.getEndTime()))
                .map(mapper::toResponseDto)
                .collect(Collectors.toList());
    }

    private boolean isSlotBooked(Long doctorId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        LocalDateTime slotStart = date.atTime(startTime);
        LocalDateTime slotEnd = date.atTime(endTime);
        
        return appointmentRepo.existsOverlappingAppointment(doctorId, slotStart, slotEnd);
    }

    public List<AvailabilitySlotResponseDTO> getAllSlotsByDoctor(Long doctorId) {
        return availabilitySlotRepo.findByDoctorId(doctorId).stream()
                .map(mapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public AvailabilitySlotResponseDTO toggleAvailability(Long slotId) {
        AvailabilitySlot slot = availabilitySlotRepo.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found with ID: " + slotId));

        slot.setIsAvailable(!slot.getIsAvailable());
        AvailabilitySlot savedSlot = availabilitySlotRepo.save(slot);

        AvailabilitySlotResponseDTO responseDTO = mapper.toResponseDto(savedSlot);
        messagingTemplate.convertAndSend("/topic/availability/" + slot.getDoctor().getId(), responseDTO);
        messagingTemplate.convertAndSend("/topic/availability", responseDTO);

        return responseDTO;
    }

    public void deleteSlot(Long slotId) {
        availabilitySlotRepo.deleteById(slotId);
        // We could also broadcast a deletion message but we will keep it simple.
    }

    public List<AvailabilitySlotResponseDTO> getAvailableSlots() {
        return availabilitySlotRepo.findByIsAvailableTrue().stream()
                .map(mapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
