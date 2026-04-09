package com.vishal.hms_backend.event;

import com.vishal.hms_backend.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InvoiceGenerationEventListener {

    private final InvoiceService invoiceService;

    @EventListener
    @Async
    public void handleAppointmentCompleted(AppointmentCompletedEvent event) {
        try {
            log.info("Received appointment completed event: {}", event.getAppointmentId());
            invoiceService.generateInvoiceForAppointment(event.getAppointmentId());
            log.info("Successfully generated invoice for appointment: {}", event.getAppointmentId());
        } catch (Exception e) {
            log.error("Failed to generate invoice for completed appointment: {}", event.getAppointmentId(), e);
            // Don't re-throw - we don't want to fail the appointment completion
        }
    }
}
