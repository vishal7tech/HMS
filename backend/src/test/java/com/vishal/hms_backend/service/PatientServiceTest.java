package com.vishal.hms_backend.service;

import com.vishal.hms_backend.dto.PatientRequestDTO;
import com.vishal.hms_backend.dto.PatientResponseDTO;
import com.vishal.hms_backend.entity.PatientProfile;
import com.vishal.hms_backend.entity.Role;
import com.vishal.hms_backend.entity.User;
import com.vishal.hms_backend.mapper.PatientProfileMapper;
import com.vishal.hms_backend.repository.PatientProfileRepository;
import com.vishal.hms_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientProfileRepository patientProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PatientProfileMapper patientProfileMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PatientService patientService;

    private User user;
    private PatientProfile patientProfile;
    private PatientRequestDTO requestDTO;
    private PatientResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("johndoe");
        user.setName("John Doe");
        user.setEmail("john@example.com");
        user.setRole(Role.PATIENT);

        patientProfile = new PatientProfile();
        patientProfile.setId(1L);
        patientProfile.setUser(user);
        patientProfile.setContactNumber("1234567890");

        requestDTO = new PatientRequestDTO();
        requestDTO.setUsername("johndoe");
        requestDTO.setPassword("password123");
        requestDTO.setName("John Doe");
        requestDTO.setEmail("john@example.com");
        requestDTO.setContactNumber("1234567890");

        responseDTO = new PatientResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setName("John Doe");
        responseDTO.setEmail("john@example.com");
        responseDTO.setContactNumber("1234567890");
    }

    @Test
    void getAllPatients_ShouldReturnList() {
        when(patientProfileRepository.findAll()).thenReturn(List.of(patientProfile));
        when(patientProfileMapper.toResponseDto(any(PatientProfile.class))).thenReturn(responseDTO);

        List<PatientResponseDTO> result = patientService.getAllPatients();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getName());
        verify(patientProfileRepository, times(1)).findAll();
    }

    @Test
    void getPatientById_WhenExists_ShouldReturnPatient() {
        when(patientProfileRepository.findById(1L)).thenReturn(Optional.of(patientProfile));
        when(patientProfileMapper.toResponseDto(any(PatientProfile.class))).thenReturn(responseDTO);

        PatientResponseDTO result = patientService.getPatientById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("John Doe", result.getName());
    }

    @Test
    void getPatientById_WhenNotExists_ShouldThrowException() {
        when(patientProfileRepository.findById(1L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> patientService.getPatientById(1L));

        assertEquals("Patient not found with id: 1", exception.getMessage());
    }

    @Test
    void createPatient_WhenUsernameNotInUse_ShouldCreateAndReturnPatient() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        when(patientProfileRepository.save(any(PatientProfile.class))).thenReturn(patientProfile);
        when(patientProfileMapper.toResponseDto(any(PatientProfile.class))).thenReturn(responseDTO);

        PatientResponseDTO result = patientService.createPatient(requestDTO);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("John Doe", result.getName());
        verify(userRepository, times(1)).save(any(User.class));
        verify(patientProfileRepository, times(1)).save(any(PatientProfile.class));
    }

    @Test
    void createPatient_WhenEmailInUse_ShouldThrowException() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        Exception exception = assertThrows(RuntimeException.class, () -> patientService.createPatient(requestDTO));

        assertEquals("Email already in use", exception.getMessage());
        verify(patientProfileRepository, never()).save(any(PatientProfile.class));
    }

    @Test
    void updatePatient_WhenExists_ShouldUpdateAndReturnPatient() {
        when(patientProfileRepository.findById(1L)).thenReturn(Optional.of(patientProfile));
        when(patientProfileRepository.save(any(PatientProfile.class))).thenReturn(patientProfile);
        when(patientProfileMapper.toResponseDto(any(PatientProfile.class))).thenReturn(responseDTO);

        PatientResponseDTO result = patientService.updatePatient(1L, requestDTO);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(patientProfileRepository, times(1)).save(any(PatientProfile.class));
    }

    @Test
    void deletePatient_WhenExists_ShouldDeletePatient() {
        when(patientProfileRepository.findById(1L)).thenReturn(Optional.of(patientProfile));
        doNothing().when(userRepository).delete(any(User.class));
        doNothing().when(patientProfileRepository).deleteById(1L);

        assertDoesNotThrow(() -> patientService.deletePatient(1L));

        verify(patientProfileRepository, times(1)).deleteById(1L);
        verify(userRepository, times(1)).delete(any(User.class));
    }
}
