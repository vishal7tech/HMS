package com.vishal.hms_backend.service;

import com.vishal.hms_backend.controller.WebSocketController;
import com.vishal.hms_backend.dto.AppointmentNotificationDTO;
import com.vishal.hms_backend.entity.Appointment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationService {

    private final WebSocketController webSocketController;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public void notifyAppointmentCreated(Appointment appointment) {
        AppointmentNotificationDTO notification = AppointmentNotificationDTO.builder()
                .type("CREATED")
                .appointmentId(appointment.getId())
                .patientName(appointment.getPatient().getUser().getName())
                .doctorName(appointment.getDoctor().getUser().getName())
                .slotTime(appointment.getSlotTime().format(formatter))
                .status(appointment.getStatus().name())
                .message("New appointment scheduled")
                .build();

        webSocketController.broadcastAppointmentUpdate(notification);
        sendNotificationToRelevantUsers(appointment, notification);
    }

    public void notifyAppointmentUpdated(Appointment appointment) {
        AppointmentNotificationDTO notification = AppointmentNotificationDTO.builder()
                .type("UPDATED")
                .appointmentId(appointment.getId())
                .patientName(appointment.getPatient().getUser().getName())
                .doctorName(appointment.getDoctor().getUser().getName())
                .slotTime(appointment.getSlotTime().format(formatter))
                .status(appointment.getStatus().name())
                .message("Appointment updated")
                .build();

        webSocketController.broadcastAppointmentUpdate(notification);
        sendNotificationToRelevantUsers(appointment, notification);
    }

    public void notifyAppointmentCancelled(Appointment appointment) {
        AppointmentNotificationDTO notification = AppointmentNotificationDTO.builder()
                .type("CANCELLED")
                .appointmentId(appointment.getId())
                .patientName(appointment.getPatient().getUser().getName())
                .doctorName(appointment.getDoctor().getUser().getName())
                .slotTime(appointment.getSlotTime().format(formatter))
                .status(appointment.getStatus().name())
                .message("Appointment cancelled")
                .build();

        webSocketController.broadcastAppointmentUpdate(notification);
        sendNotificationToRelevantUsers(appointment, notification);
    }

    public void notifyAppointmentCompleted(Appointment appointment) {
        AppointmentNotificationDTO notification = AppointmentNotificationDTO.builder()
                .type("COMPLETED")
                .appointmentId(appointment.getId())
                .patientName(appointment.getPatient().getUser().getName())
                .doctorName(appointment.getDoctor().getUser().getName())
                .slotTime(appointment.getSlotTime().format(formatter))
                .status(appointment.getStatus().name())
                .message("Appointment completed")
                .build();

        webSocketController.broadcastAppointmentUpdate(notification);
        sendNotificationToRelevantUsers(appointment, notification);
    }

    private void sendNotificationToRelevantUsers(Appointment appointment, AppointmentNotificationDTO notification) {
        // Send to patient
        webSocketController.sendAppointmentUpdateToUser(
                appointment.getPatient().getUser().getUsername(),
                notification
        );

        // Send to doctor
        webSocketController.sendAppointmentUpdateToUser(
                appointment.getDoctor().getUser().getUsername(),
                notification
        );
    }
}
