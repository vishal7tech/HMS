package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.DoctorRegistrationDto;
import com.vishal.hms_backend.dto.PatientRegistrationDto;
import com.vishal.hms_backend.dto.StaffRegistrationDto;
import com.vishal.hms_backend.entity.DoctorProfile;
import com.vishal.hms_backend.entity.PatientProfile;
import com.vishal.hms_backend.entity.Role;
import com.vishal.hms_backend.entity.User;
import com.vishal.hms_backend.repository.DoctorProfileRepository;
import com.vishal.hms_backend.repository.PatientProfileRepository;
import com.vishal.hms_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    // WINDSURF-ADDED: Registration Service for all roles

    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User registerPatient(PatientRegistrationDto dto) {
        if (userRepository.findByUsername(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(Role.PATIENT)
                .email(dto.getEmail())
                .name(dto.getFirstName() + " " + dto.getLastName())
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        PatientProfile profile = PatientProfile.builder()
                .user(savedUser)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .dateOfBirth(dto.getDateOfBirth())
                .gender(dto.getGender())
                .contactNumber(dto.getPhoneNumber())
                .address(dto.getAddress())
                .bloodGroup(dto.getBloodGroup())
                .emergencyContact(dto.getEmergencyContactName() + " (" + dto.getEmergencyContactRelationship() + "): "
                        + dto.getEmergencyContactPhone())
                .allergies(dto.getAllergies())
                .medicalHistory(dto.getCurrentMedications()) // Using this field for current meds as well for now
                .build();

        patientProfileRepository.save(profile);
        return savedUser;
    }

    @Transactional
    public User registerDoctor(DoctorRegistrationDto dto) {
        if (userRepository.findByUsername(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(Role.DOCTOR)
                .email(dto.getEmail())
                .name(dto.getFirstName() + " " + dto.getLastName())
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        DoctorProfile profile = DoctorProfile.builder()
                .user(savedUser)
                .specialization(dto.getSpecializations())
                .qualifications(dto.getQualifications() + " | Experience: " + dto.getExperienceYears() + " years")
                .contactNumber(dto.getPhoneNumber())
                .build();

        doctorProfileRepository.save(profile);
        return savedUser;
    }

    @Transactional
    public User registerStaff(StaffRegistrationDto dto) {
        if (userRepository.findByUsername(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(dto.getRole())
                .email(dto.getEmail())
                .name(dto.getFirstName() + " " + dto.getLastName())
                .enabled(true)
                .build();

        // Specific handling for staff roles if they had profiles, but for now they just
        // use User entity
        return userRepository.save(user);
    }
}
