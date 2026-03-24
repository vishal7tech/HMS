package com.vishal.hms_backend.controller;

import com.vishal.hms_backend.dto.DepartmentDTO;
import com.vishal.hms_backend.dto.DesignationDTO;
import com.vishal.hms_backend.dto.ShiftDTO;
import com.vishal.hms_backend.dto.LeaveTypeDTO;
import com.vishal.hms_backend.dto.HolidayDTO;
import com.vishal.hms_backend.service.StaffCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff-categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class StaffCategoryController {

    private final StaffCategoryService staffCategoryService;

    // Department endpoints
    @GetMapping("/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DepartmentDTO>> getAllDepartments() {
        log.info("Fetching all departments");
        return ResponseEntity.ok(staffCategoryService.getAllDepartments());
    }

    @PostMapping("/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentDTO> createDepartment(@Valid @RequestBody DepartmentDTO dto) {
        log.info("Creating new department: {}", dto.getName());
        return ResponseEntity.ok(staffCategoryService.createDepartment(dto));
    }

    // Designation endpoints
    @GetMapping("/designations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DesignationDTO>> getAllDesignations() {
        log.info("Fetching all designations");
        return ResponseEntity.ok(staffCategoryService.getAllDesignations());
    }

    @PostMapping("/designations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DesignationDTO> createDesignation(@Valid @RequestBody DesignationDTO dto) {
        log.info("Creating new designation: {}", dto.getName());
        return ResponseEntity.ok(staffCategoryService.createDesignation(dto));
    }

    // Shift endpoints
    @GetMapping("/shifts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ShiftDTO>> getAllShifts() {
        log.info("Fetching all shifts");
        return ResponseEntity.ok(staffCategoryService.getAllShifts());
    }

    @PostMapping("/shifts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShiftDTO> createShift(@Valid @RequestBody ShiftDTO dto) {
        log.info("Creating new shift: {}", dto.getName());
        return ResponseEntity.ok(staffCategoryService.createShift(dto));
    }

    // Leave Type endpoints
    @GetMapping("/leave-types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LeaveTypeDTO>> getAllLeaveTypes() {
        log.info("Fetching all leave types");
        return ResponseEntity.ok(staffCategoryService.getAllLeaveTypes());
    }

    @PostMapping("/leave-types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LeaveTypeDTO> createLeaveType(@Valid @RequestBody LeaveTypeDTO dto) {
        log.info("Creating new leave type: {}", dto.getName());
        return ResponseEntity.ok(staffCategoryService.createLeaveType(dto));
    }

    // Holiday endpoints
    @GetMapping("/holidays")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<HolidayDTO>> getAllHolidays() {
        log.info("Fetching all holidays");
        return ResponseEntity.ok(staffCategoryService.getAllHolidays());
    }

    @PostMapping("/holidays")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HolidayDTO> createHoliday(@Valid @RequestBody HolidayDTO dto) {
        log.info("Creating new holiday: {}", dto.getName());
        return ResponseEntity.ok(staffCategoryService.createHoliday(dto));
    }
}
