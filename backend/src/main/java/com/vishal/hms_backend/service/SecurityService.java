package com.vishal.hms_backend.service;

import com.vishal.hms_backend.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("securityService")
public class SecurityService {

    public boolean isDoctor(Long doctorId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            return false;
        }

        User user = (User) auth.getPrincipal();
        return user.getDoctorId() != null && user.getDoctorId().equals(doctorId);
    }
}
