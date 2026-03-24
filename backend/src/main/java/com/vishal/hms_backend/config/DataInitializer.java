package com.vishal.hms_backend.config;

import com.vishal.hms_backend.entity.*;
import com.vishal.hms_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorRepo;
    private final PatientProfileRepository patientRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding initial data...");

            // 1. Admin
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@hms.com")
                    .name("System Admin")
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);

            // 2. Receptionist
            User receptionist = User.builder()
                    .username("receptionist")
                    .password(passwordEncoder.encode("reception123"))
                    .email("reception@hms.com")
                    .name("Front Desk")
                    .role(Role.RECEPTIONIST)
                    .enabled(true)
                    .build();
            userRepository.save(receptionist);

            // 3. Doctor
            User doctorUser = User.builder()
                    .username("doctor")
                    .password(passwordEncoder.encode("doctor123"))
                    .email("doctor@hms.com")
                    .name("Dr. Smith")
                    .role(Role.DOCTOR)
                    .enabled(true)
                    .build();
            userRepository.save(doctorUser);

            DoctorProfile doctorProfile = DoctorProfile.builder()
                    .user(doctorUser)
                    .specialization(List.of("Cardiology"))
                    .qualifications("MD, MBBS")
                    .contactNumber("1234567890")
                    .build();
            doctorRepo.save(doctorProfile);

            // 4. Patient
            User patientUser = User.builder()
                    .username("patient")
                    .password(passwordEncoder.encode("patient123"))
                    .email("patient@hms.com")
                    .name("John Doe")
                    .role(Role.PATIENT)
                    .enabled(true)
                    .build();
            userRepository.save(patientUser);

            PatientProfile patientProfile = PatientProfile.builder()
                    .user(patientUser)
                    .contactNumber("0987654321")
                    .address("123 Health St, Wellness City")
                    .bloodGroup("O+")
                    .dateOfBirth(LocalDate.of(1990, 1, 1))
                    .gender("Male")
                    .build();
            patientRepo.save(patientProfile);

            log.info("Seeding completed successfully.");
        }
    }
}
