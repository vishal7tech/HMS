package com.vishal.hms_backend.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class AppointmentCompletedEvent extends ApplicationEvent {
    private final Long appointmentId;

    public AppointmentCompletedEvent(Object source, Long appointmentId) {
        super(source);
        this.appointmentId = appointmentId;
    }
}
