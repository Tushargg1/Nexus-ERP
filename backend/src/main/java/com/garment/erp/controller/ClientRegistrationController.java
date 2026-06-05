package com.garment.erp.controller;

import com.garment.erp.entity.ClientRegistration;
import com.garment.erp.service.ClientRegistrationService;
import com.garment.erp.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/client-registrations")
@RequiredArgsConstructor
public class ClientRegistrationController {

    private final ClientRegistrationService service;
    private final EmailService emailService;

    /**
     * Public endpoint - client submits a registration request (with password)
     */
    @PostMapping
    public ResponseEntity<?> submitRegistration(@RequestBody Map<String, String> body) {
        try {
            String name = body.get("name");
            String businessName = body.get("businessName");
            String email = body.get("email");
            String phone = body.get("phone");
            String password = body.get("password");

            if (name == null || email == null || businessName == null || phone == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "All fields (name, businessName, email, phone) are required."
                ));
            }

            ClientRegistration reg = service.submitRegistration(name, businessName, email, phone, password);
            return ResponseEntity.status(HttpStatus.CREATED).body(sanitize(reg));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Public endpoint - client login (email + password + deviceId).
     * Used by the website account panel AND the downloaded software.
     * Verifies credentials, license approval, AND enforces single-device sessions.
     */
    @PostMapping("/login")
    public ResponseEntity<?> clientLogin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String deviceId = body.get("deviceId");
        String deviceLabel = body.get("deviceLabel");
        boolean force = "true".equalsIgnoreCase(body.get("force"));

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required."));
        }

        ClientRegistration reg = service.authenticate(email, password);
        if (reg == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid email or password."));
        }

        // Enforce single active device session (only when a deviceId is supplied).
        if (deviceId != null && !deviceId.isBlank()) {
            ClientRegistrationService.SessionResult result = service.acquireSession(reg, deviceId, deviceLabel, force);
            if (result == ClientRegistrationService.SessionResult.ACTIVE_ELSEWHERE) {
                // 409 with canForce=true tells the client it can retry with force=true to switch devices.
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                        "message", "This account is already signed in on another device. " +
                                   "You can sign out the other device and continue here.",
                        "canForce", true));
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", reg.getId());
        response.put("name", reg.getName());
        response.put("businessName", reg.getBusinessName());
        response.put("email", reg.getEmail());
        response.put("phone", reg.getPhone());
        response.put("status", reg.getStatus().name());
        response.put("approved", reg.getStatus() == ClientRegistration.RegistrationStatus.APPROVED);
        return ResponseEntity.ok(response);
    }

    /**
     * Public endpoint - keep an active device session alive (heartbeat).
     */
    @PostMapping("/session/heartbeat")
    public ResponseEntity<?> heartbeat(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String deviceId = body.get("deviceId");
        if (email == null || deviceId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "email and deviceId are required."));
        }
        boolean stillOurs = service.heartbeat(email, deviceId);
        if (!stillOurs) {
            // The session was taken over or expired — tell the client to log out.
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "Session is no longer active on this device.", "active", false));
        }
        return ResponseEntity.ok(Map.of("active", true));
    }

    /**
     * Public endpoint - release the device session (logout).
     */
    @PostMapping("/session/logout")
    public ResponseEntity<?> sessionLogout(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String deviceId = body.get("deviceId");
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "email is required."));
        }
        service.releaseSession(email, deviceId);
        return ResponseEntity.ok(Map.of("message", "Signed out."));
    }

    /**
     * Public endpoint - change client password (verifies current password)
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (email == null || currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "All password fields are required."));
        }
        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 6 characters."));
        }

        boolean changed = service.changePassword(email, currentPassword, newPassword);
        if (!changed) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Current password is incorrect."));
        }
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }

    /**
     * Public endpoint - forgot password. Generates a temporary password and
     * emails it. Always returns a generic success message (does not reveal
     * whether the email is registered).
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required."));
        }
        String tempPassword = service.resetPassword(email);
        if (tempPassword != null) {
            emailService.sendPasswordReset(email, tempPassword);
        }
        // Generic response regardless of whether the account exists
        return ResponseEntity.ok(Map.of(
            "message", "If an account exists for that email, a temporary password has been sent."));
    }

    /**
     * Public endpoint - client requests to purchase the software (moves to PENDING)
     */
    @PostMapping("/purchase")
    public ResponseEntity<?> requestPurchase(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            if (email == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is required."));
            }
            ClientRegistration reg = service.requestPurchase(email);
            return ResponseEntity.ok(sanitize(reg));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Admin endpoint - get all pending registrations
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getPendingRegistrations() {
        return ResponseEntity.ok(service.getPendingRegistrations().stream().map(this::sanitize).toList());
    }

    /**
     * Admin endpoint - get all registrations
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllRegistrations() {
        return ResponseEntity.ok(service.getAllRegistrations().stream().map(this::sanitize).toList());
    }

    /**
     * Admin endpoint - approve a registration
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<Map<String, Object>> approveRegistration(@PathVariable Long id) {
        return ResponseEntity.ok(sanitize(service.approveRegistration(id)));
    }

    /**
     * Admin endpoint - reject a registration
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<Map<String, Object>> rejectRegistration(@PathVariable Long id) {
        return ResponseEntity.ok(sanitize(service.rejectRegistration(id)));
    }

    /**
     * Public endpoint - verify if a client email has an approved license
     */
    @GetMapping("/verify-license")
    public ResponseEntity<Map<String, Object>> verifyLicense(@RequestParam String email) {
        boolean approved = service.verifyLicense(email);
        ClientRegistration reg = service.getByEmail(email);
        Map<String, Object> response = new HashMap<>();
        response.put("approved", approved);
        response.put("email", email);
        if (reg != null) {
            response.put("status", reg.getStatus().name());
        } else {
            response.put("status", "NOT_FOUND");
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Public endpoint - check registration status by email (for download page)
     */
    @GetMapping("/status")
    public ResponseEntity<?> getRegistrationStatus(@RequestParam String email) {
        ClientRegistration reg = service.getByEmail(email);
        if (reg == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "message", "No registration found for this email."
            ));
        }
        return ResponseEntity.ok(sanitize(reg));
    }

    /**
     * Strip the password before returning a registration in any response.
     */
    private Map<String, Object> sanitize(ClientRegistration reg) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", reg.getId());
        map.put("name", reg.getName());
        map.put("businessName", reg.getBusinessName());
        map.put("email", reg.getEmail());
        map.put("phone", reg.getPhone());
        map.put("status", reg.getStatus().name());
        map.put("createdAt", reg.getCreatedAt());
        map.put("updatedAt", reg.getUpdatedAt());
        map.put("approvedAt", reg.getApprovedAt());
        map.put("hasPassword", reg.getPassword() != null);
        return map;
    }
}
