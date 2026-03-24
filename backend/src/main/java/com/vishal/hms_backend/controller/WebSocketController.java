package com.vishal.hms_backend.controller;

import com.vishal.hms_backend.dto.AppointmentNotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/appointment/subscribe")
    public void handleAppointmentSubscription(@Payload String message) {
        log.info("User subscribed to appointment updates: {}", message);
    }

    public void broadcastAppointmentUpdate(AppointmentNotificationDTO notification) {
        log.info("Broadcasting appointment update: {}", notification.getType());
        messagingTemplate.convertAndSend("/topic/appointments", notification);
    }

    public void sendAppointmentUpdateToUser(String username, AppointmentNotificationDTO notification) {
        log.info("Sending appointment update to user {}: {}", username, notification.getType());
        messagingTemplate.convertAndSendToUser(username, "/queue/appointments", notification);
    }

    public void broadcastSlotAvailabilityUpdate(Long doctorId, Object availabilityData) {
        log.info("Broadcasting slot availability update for doctor {}", doctorId);
        messagingTemplate.convertAndSend("/topic/availability/" + doctorId, availabilityData);
    }
}
