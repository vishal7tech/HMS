package com.vishal.hms_backend.config;

import com.vishal.hms_backend.entity.Role;
import com.vishal.hms_backend.entity.User;
import com.vishal.hms_backend.entity.DoctorProfile;
import com.vishal.hms_backend.entity.PatientProfile;
import com.vishal.hms_backend.repository.DoctorProfileRepository;
import com.vishal.hms_backend.repository.PatientProfileRepository;
import com.vishal.hms_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

        private final UserRepository userRepository;
        private final DoctorProfileRepository doctorRepository;
        private final PatientProfileRepository patientRepository;
        private final PasswordEncoder passwordEncoder;

        @Bean
        public CommandLineRunner seedDatabase() {
                return args -> {
                        log.info("Ensuring default users exist...");

                        // 1. Admin User
                        userRepository.findByUsername("admin").ifPresentOrElse(u -> {
                                u.setEmail("admin@hms.com");
                                u.setPassword(passwordEncoder.encode("admin123"));
                                userRepository.save(u);
                        }, () -> {
                                User admin = User.builder()
                                                .username("admin")
                                                .email("admin@hms.com")
                                                .password(passwordEncoder.encode("admin123"))
                                                .name("System Administrator")
                                                .role(Role.ADMIN)
                                                .enabled(true)
                                                .build();
                                userRepository.save(admin);
                        });

                        // 2. Receptionist User
                        userRepository.findByUsername("reception").ifPresentOrElse(u -> {
                                u.setEmail("reception@hms.com");
                                u.setPassword(passwordEncoder.encode("reception123"));
                                userRepository.save(u);
                        }, () -> {
                                User receptionist = User.builder()
                                                .username("reception")
                                                .email("reception@hms.com")
                                                .password(passwordEncoder.encode("reception123"))
                                                .name("Front Desk Receptionist")
                                                .role(Role.RECEPTIONIST)
                                                .enabled(true)
                                                .build();
                                userRepository.save(receptionist);
                        });

                        // 3. Doctor User
                        userRepository.findByUsername("doctor").ifPresentOrElse(u -> {
                                u.setEmail("doctor@hms.com");
                                u.setPassword(passwordEncoder.encode("doctor123"));
                                userRepository.save(u);
                        }, () -> {
                                User docUser = User.builder()
                                                .username("doctor")
                                                .email("doctor@hms.com")
                                                .password(passwordEncoder.encode("doctor123"))
                                                .name("Dr. Smith")
                                                .role(Role.DOCTOR)
                                                .enabled(true)
                                                .build();
                                User savedDoc = userRepository.save(docUser);

                                DoctorProfile docProfile = DoctorProfile.builder()
                                                .user(savedDoc)
                                                .contactNumber("+1234567890")
                                                .specialization(List.of("General Medicine", "Cardiology"))
                                                .qualifications("MBBS, MD")
                                                .build();
                                doctorRepository.save(docProfile);
                        });

                        // 4. Patient User
                        userRepository.findByUsername("patient").ifPresentOrElse(u -> {
                                u.setEmail("patient@hms.com");
                                u.setPassword(passwordEncoder.encode("patient123"));
                                userRepository.save(u);
                                
                                // Also ensure patient profile exists
                                patientRepository.findByUser_Username("patient").ifPresentOrElse(profile -> {
                                        // Update existing profile
                                        profile.setFirstName("John");
                                        profile.setLastName("Doe");
                                        profile.setContactNumber("+0987654321");
                                        profile.setAddress("123 Main St, Springfield");
                                        profile.setBloodGroup("O+");
                                        profile.setDateOfBirth(LocalDate.of(1990, 5, 20));
                                        profile.setGender("Male");
                                        profile.setMedicalHistory("None");
                                        patientRepository.save(profile);
                                }, () -> {
                                        // Create new profile
                                        PatientProfile patProfile = PatientProfile.builder()
                                                        .user(u)
                                                        .firstName("John")
                                                        .lastName("Doe")
                                                        .contactNumber("+0987654321")
                                                        .address("123 Main St, Springfield")
                                                        .bloodGroup("O+")
                                                        .dateOfBirth(LocalDate.of(1990, 5, 20))
                                                        .gender("Male")
                                                        .medicalHistory("None")
                                                        .build();
                                        patientRepository.save(patProfile);
                                });
                        }, () -> {
                                User patUser = User.builder()
                                                .username("patient")
                                                .email("patient@hms.com")
                                                .password(passwordEncoder.encode("patient123"))
                                                .name("John Doe")
                                                .role(Role.PATIENT)
                                                .enabled(true)
                                                .build();
                                User savedPat = userRepository.save(patUser);

                                PatientProfile patProfile = PatientProfile.builder()
                                                .user(savedPat)
                                                .firstName("John")
                                                .lastName("Doe")
                                                .contactNumber("+0987654321")
                                                .address("123 Main St, Springfield")
                                                .bloodGroup("O+")
                                                .dateOfBirth(LocalDate.of(1990, 5, 20))
                                                .gender("Male")
                                                .medicalHistory("None")
                                                .build();
                                patientRepository.save(patProfile);
                        });

                        log.info("Database seeding verification completed.");
                };
        }
}
