package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.DepartmentDTO;
import com.vishal.hms_backend.dto.DesignationDTO;
import com.vishal.hms_backend.dto.ShiftDTO;
import com.vishal.hms_backend.dto.LeaveTypeDTO;
import com.vishal.hms_backend.dto.HolidayDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class StaffCategoryService {

    // In-memory storage for demo purposes - replace with actual repositories
    private List<DepartmentDTO> departments = new ArrayList<>(List.of(
        DepartmentDTO.builder()
            .id(1L)
            .name("Cardiology")
            .description("Heart and cardiovascular care")
            .headOfDepartment("Dr. John Smith")
            .createdAt(LocalDateTime.now())
            .build(),
        DepartmentDTO.builder()
            .id(2L)
            .name("Neurology")
            .description("Brain and nervous system care")
            .headOfDepartment("Dr. Sarah Johnson")
            .createdAt(LocalDateTime.now())
            .build()
    ));

    private List<DesignationDTO> designations = new ArrayList<>(List.of(
        DesignationDTO.builder()
            .id(1L)
            .name("Senior Doctor")
            .type("MEDICAL")
            .description("Senior medical practitioner")
            .createdAt(LocalDateTime.now())
            .build(),
        DesignationDTO.builder()
            .id(2L)
            .name("Head Nurse")
            .type("NURSING")
            .description("Lead nursing staff")
            .createdAt(LocalDateTime.now())
            .build()
    ));

    private List<ShiftDTO> shifts = new ArrayList<>(List.of(
        ShiftDTO.builder()
            .id(1L)
            .name("Morning Shift")
            .startTime(java.time.LocalTime.of(8, 0))
            .endTime(java.time.LocalTime.of(16, 0))
            .description("8 AM to 4 PM shift")
            .createdAt(LocalDateTime.now())
            .build(),
        ShiftDTO.builder()
            .id(2L)
            .name("Evening Shift")
            .startTime(java.time.LocalTime.of(16, 0))
            .endTime(java.time.LocalTime.of(0, 0))
            .description("4 PM to 12 AM shift")
            .createdAt(LocalDateTime.now())
            .build()
    ));

    private List<LeaveTypeDTO> leaveTypes = new ArrayList<>(List.of(
        LeaveTypeDTO.builder()
            .id(1L)
            .name("Sick Leave")
            .description("Medical leave for illness")
            .maxDaysPerYear(12)
            .requiresApproval(true)
            .createdAt(LocalDateTime.now())
            .build(),
        LeaveTypeDTO.builder()
            .id(2L)
            .name("Annual Leave")
            .description("Paid time off")
            .maxDaysPerYear(21)
            .requiresApproval(true)
            .createdAt(LocalDateTime.now())
            .build()
    ));

    private List<HolidayDTO> holidays = new ArrayList<>(List.of(
        HolidayDTO.builder()
            .id(1L)
            .name("New Year")
            .date(java.time.LocalDate.of(2024, 1, 1))
            .description("New Year's Day")
            .isRecurring(true)
            .createdAt(LocalDateTime.now())
            .build(),
        HolidayDTO.builder()
            .id(2L)
            .name("Christmas")
            .date(java.time.LocalDate.of(2024, 12, 25))
            .description("Christmas Day")
            .isRecurring(true)
            .createdAt(LocalDateTime.now())
            .build()
    ));

    // Department methods
    public List<DepartmentDTO> getAllDepartments() {
        return departments;
    }

    public DepartmentDTO createDepartment(DepartmentDTO dto) {
        DepartmentDTO newDepartment = DepartmentDTO.builder()
            .id((long) (departments.size() + 1))
            .name(dto.getName())
            .description(dto.getDescription())
            .headOfDepartment(dto.getHeadOfDepartment())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        departments.add(newDepartment);
        log.info("Created new department: {}", newDepartment.getName());
        return newDepartment;
    }

    // Designation methods
    public List<DesignationDTO> getAllDesignations() {
        return designations;
    }

    public DesignationDTO createDesignation(DesignationDTO dto) {
        DesignationDTO newDesignation = DesignationDTO.builder()
            .id((long) (designations.size() + 1))
            .name(dto.getName())
            .type(dto.getType())
            .description(dto.getDescription())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        designations.add(newDesignation);
        log.info("Created new designation: {}", newDesignation.getName());
        return newDesignation;
    }

    // Shift methods
    public List<ShiftDTO> getAllShifts() {
        return shifts;
    }

    public ShiftDTO createShift(ShiftDTO dto) {
        ShiftDTO newShift = ShiftDTO.builder()
            .id((long) (shifts.size() + 1))
            .name(dto.getName())
            .startTime(dto.getStartTime())
            .endTime(dto.getEndTime())
            .description(dto.getDescription())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        shifts.add(newShift);
        log.info("Created new shift: {}", newShift.getName());
        return newShift;
    }

    // Leave Type methods
    public List<LeaveTypeDTO> getAllLeaveTypes() {
        return leaveTypes;
    }

    public LeaveTypeDTO createLeaveType(LeaveTypeDTO dto) {
        LeaveTypeDTO newLeaveType = LeaveTypeDTO.builder()
            .id((long) (leaveTypes.size() + 1))
            .name(dto.getName())
            .description(dto.getDescription())
            .maxDaysPerYear(dto.getMaxDaysPerYear())
            .requiresApproval(dto.getRequiresApproval())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        leaveTypes.add(newLeaveType);
        log.info("Created new leave type: {}", newLeaveType.getName());
        return newLeaveType;
    }

    // Holiday methods
    public List<HolidayDTO> getAllHolidays() {
        return holidays;
    }

    public HolidayDTO createHoliday(HolidayDTO dto) {
        HolidayDTO newHoliday = HolidayDTO.builder()
            .id((long) (holidays.size() + 1))
            .name(dto.getName())
            .date(dto.getDate())
            .description(dto.getDescription())
            .isRecurring(dto.getIsRecurring())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        holidays.add(newHoliday);
        log.info("Created new holiday: {}", newHoliday.getName());
        return newHoliday;
    }
}
