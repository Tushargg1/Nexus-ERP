package com.garment.erp.controller;

import com.garment.erp.dto.AuthResponse;
import com.garment.erp.dto.LoginRequest;
import com.garment.erp.entity.ClientDevice;
import com.garment.erp.entity.ClientRegistration;
import com.garment.erp.entity.User;
import com.garment.erp.repository.ClientRegistrationRepository;
import com.garment.erp.repository.UserRepository;
import com.garment.erp.security.JwtUtil;
import com.garment.erp.service.ClientRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final ClientRegistrationService clientRegistrationService;
    private final ClientRegistrationRepository clientRegistrationRepository;

    /**
     * Dedicated admin login - only allows OWNER role users
     */
    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Only OWNER can access the website admin panel
            if (user.getRole() != User.Role.OWNER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied. Only website administrators can login here."));
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
            String token = jwtUtil.generateToken(userDetails);

            return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role("WEBSITE_ADMIN")
                .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid email or password"));
        }
    }

    /**
     * Admin dashboard stats
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<ClientRegistration> all = clientRegistrationRepository.findAll();
        long total = all.size();
        long pending = all.stream().filter(r -> r.getStatus() == ClientRegistration.RegistrationStatus.PENDING).count();
        long approved = all.stream().filter(r -> r.getStatus() == ClientRegistration.RegistrationStatus.APPROVED).count();
        long rejected = all.stream().filter(r -> r.getStatus() == ClientRegistration.RegistrationStatus.REJECTED).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRegistrations", total);
        stats.put("pendingRegistrations", pending);
        stats.put("approvedRegistrations", approved);
        stats.put("rejectedRegistrations", rejected);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all registrations for admin management
     */
    @GetMapping("/registrations")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllRegistrations() {
        return ResponseEntity.ok(clientRegistrationService.getAllRegistrations().stream().map(this::sanitize).toList());
    }

    /**
     * Get only pending registrations
     */
    @GetMapping("/registrations/pending")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getPendingRegistrations() {
        return ResponseEntity.ok(clientRegistrationService.getPendingRegistrations().stream().map(this::sanitize).toList());
    }

    /**
     * Approve a registration
     */
    @PostMapping("/registrations/{id}/approve")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<Map<String, Object>> approveRegistration(@PathVariable Long id) {
        return ResponseEntity.ok(sanitize(clientRegistrationService.approveRegistration(id)));
    }

    /**
     * Reject a registration
     */
    @PostMapping("/registrations/{id}/reject")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<Map<String, Object>> rejectRegistration(@PathVariable Long id) {
        return ResponseEntity.ok(sanitize(clientRegistrationService.rejectRegistration(id)));
    }

    /**
     * Revoke access (set approved back to rejected)
     */
    @PostMapping("/registrations/{id}/revoke")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<Map<String, Object>> revokeAccess(@PathVariable Long id) {
        return ResponseEntity.ok(sanitize(clientRegistrationService.rejectRegistration(id)));
    }

    /**
     * Admin - list all clients with their devices and session status.
     */
    @GetMapping("/sessions")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllSessions() {
        List<Map<String, Object>> out = new ArrayList<>();
        for (ClientRegistration reg : clientRegistrationService.getAllRegistrations()) {
            String activeDeviceId = reg.getActiveDeviceId();
            boolean sessionActive = clientRegistrationService.isSessionActive(reg);

            List<Map<String, Object>> devices = new ArrayList<>();
            for (ClientDevice d : clientRegistrationService.getDevicesForClient(reg.getEmail())) {
                Map<String, Object> dm = new HashMap<>();
                dm.put("deviceId", d.getDeviceId());
                dm.put("label", d.getDeviceLabel());
                dm.put("firstSeen", d.getFirstSeen());
                dm.put("lastSeen", d.getLastSeen());
                dm.put("isActive", sessionActive && d.getDeviceId().equals(activeDeviceId));
                devices.add(dm);
            }

            Map<String, Object> client = new HashMap<>();
            client.put("name", reg.getName());
            client.put("email", reg.getEmail());
            client.put("businessName", reg.getBusinessName());
            client.put("status", reg.getStatus().name());
            client.put("sessionActive", sessionActive);
            client.put("activeDeviceId", sessionActive ? activeDeviceId : null);
            client.put("lastSeen", reg.getSessionLastSeen());
            client.put("devices", devices);
            out.add(client);
        }
        return ResponseEntity.ok(out);
    }

    /**
     * Admin - force logout a client from ALL devices (they must sign in again).
     */
    @PostMapping("/sessions/force-logout")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<?> forceLogout(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "email is required."));
        }
        clientRegistrationService.forceLogout(email);
        return ResponseEntity.ok(Map.of("message", "Client signed out from all devices.", "email", email));
    }

    /**
     * Strip the password before returning a registration.
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
        return map;
    }
}
