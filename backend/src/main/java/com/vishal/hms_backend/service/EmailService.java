package com.vishal.hms_backend.service;

import com.vishal.hms_backend.entity.Appointment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    public void sendAppointmentConfirmation(Appointment appointment) {
        try {
            String subject = "Appointment Confirmation - HMS";
            String body = buildAppointmentConfirmationBody(appointment);
            
            log.info("MOCK EMAIL: Sending appointment confirmation to patient {} at {}", 
                    appointment.getPatient().getEmail(), appointment.getPatient().getEmail());
            log.info("MOCK EMAIL - Subject: {}", subject);
            log.info("MOCK EMAIL - Body: {}", body);
            
            // In production, replace with actual email sending logic:
            // emailSender.sendEmail(appointment.getPatient().getEmail(), subject, body);
            
        } catch (Exception e) {
            log.error("Failed to send appointment confirmation email", e);
        }
    }

    public void sendAppointmentReminder(Appointment appointment) {
        try {
            String subject = "Appointment Reminder - HMS";
            String body = buildAppointmentReminderBody(appointment);
            
            log.info("MOCK EMAIL: Sending appointment reminder to patient {} at {}", 
                    appointment.getPatient().getEmail(), appointment.getPatient().getEmail());
            log.info("MOCK EMAIL - Subject: {}", subject);
            log.info("MOCK EMAIL - Body: {}", body);
            
            // In production, replace with actual email sending logic:
            // emailSender.sendEmail(appointment.getPatient().getEmail(), subject, body);
            
        } catch (Exception e) {
            log.error("Failed to send appointment reminder email", e);
        }
    }

    public void sendAppointmentCancellation(Appointment appointment) {
        try {
            String subject = "Appointment Cancelled - HMS";
            String body = buildAppointmentCancellationBody(appointment);
            
            log.info("MOCK EMAIL: Sending appointment cancellation to patient {} at {}", 
                    appointment.getPatient().getEmail(), appointment.getPatient().getEmail());
            log.info("MOCK EMAIL - Subject: {}", subject);
            log.info("MOCK EMAIL - Body: {}", body);
            
            // In production, replace with actual email sending logic:
            // emailSender.sendEmail(appointment.getPatient().getEmail(), subject, body);
            
        } catch (Exception e) {
            log.error("Failed to send appointment cancellation email", e);
        }
    }

    private String buildAppointmentConfirmationBody(Appointment appointment) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a");
        
        return String.format(
            "Dear %s,\n\n" +
            "Your appointment has been successfully scheduled!\n\n" +
            "Appointment Details:\n" +
            "Date: %s\n" +
            "Doctor: Dr. %s (%s)\n" +
            "Reason: %s\n\n" +
            "Please arrive 15 minutes before your scheduled time.\n" +
            "If you need to cancel or reschedule, please contact us at least 24 hours in advance.\n\n" +
            "Best regards,\n" +
            "Hospital Management System",
            
            appointment.getPatient().getName(),
            appointment.getDateTime().format(formatter),
            appointment.getDoctor().getName(),
            appointment.getDoctor().getSpecialization(),
            appointment.getReason() != null ? appointment.getReason() : "General consultation"
        );
    }

    private String buildAppointmentReminderBody(Appointment appointment) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a");
        
        return String.format(
            "Dear %s,\n\n" +
            "This is a friendly reminder about your upcoming appointment.\n\n" +
            "Appointment Details:\n" +
            "Date: %s\n" +
            "Doctor: Dr. %s (%s)\n\n" +
            "Please remember to:\n" +
            "- Arrive 15 minutes before your scheduled time\n" +
            "- Bring your ID and insurance card\n" +
            "- Bring any relevant medical records\n\n" +
            "We look forward to seeing you!\n\n" +
            "Best regards,\n" +
            "Hospital Management System",
            
            appointment.getPatient().getName(),
            appointment.getDateTime().format(formatter),
            appointment.getDoctor().getName(),
            appointment.getDoctor().getSpecialization()
        );
    }

    private String buildAppointmentCancellationBody(Appointment appointment) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a");
        
        return String.format(
            "Dear %s,\n\n" +
            "Your appointment has been cancelled as requested.\n\n" +
            "Cancelled Appointment Details:\n" +
            "Date: %s\n" +
            "Doctor: Dr. %s (%s)\n\n" +
            "If you did not request this cancellation, please contact us immediately.\n" +
            "To schedule a new appointment, please visit our website or call us.\n\n" +
            "Best regards,\n" +
            "Hospital Management System",
            
            appointment.getPatient().getName(),
            appointment.getDateTime().format(formatter),
            appointment.getDoctor().getName(),
            appointment.getDoctor().getSpecialization()
        );
    }
}
