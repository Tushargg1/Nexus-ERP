package com.garment.erp.service;

import com.garment.erp.dto.AuthResponse;
import com.garment.erp.dto.LoginRequest;
import com.garment.erp.entity.User;
import com.garment.erp.repository.UserRepository;
import com.garment.erp.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    /**
     * Seed default accounts AFTER the application has fully started.
     *
     * IMPORTANT: this is intentionally NOT a @PostConstruct. Running seeding
     * during bean initialization means any failure (a transient DB hiccup, a
     * unique-constraint race on redeploy, a slow Aiven connection) propagates up
     * and aborts the entire Spring context — the app exits with status 1 and the
     * deploy fails. Running on ApplicationReadyEvent, with every block wrapped in
     * its own try/catch, guarantees the backend always boots even if seeding
     * partially fails. Worst case we log a warning.
     */
    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    public void createDefaultUsers() {
        // Legacy migration: rename old ADMIN role to OWNER. Best-effort only.
        try {
            jdbcTemplate.update("UPDATE users SET role='OWNER' WHERE role='ADMIN'");
        } catch (Exception e) {
            log.warn("Role migration update failed or not needed: {}", e.getMessage());
        }

        // Seed the default owner + manager only on a completely empty user table.
        try {
            if (userRepository.count() == 0) {
                userRepository.save(User.builder()
                        .name("Factory Owner")
                        .email("owner@garment.com")
                        .password(passwordEncoder.encode("owner123"))
                        .role(User.Role.OWNER)
                        .active(true)
                        .build());
                userRepository.save(User.builder()
                        .name("Factory Manager")
                        .email("manager@garment.com")
                        .password(passwordEncoder.encode("manager123"))
                        .role(User.Role.MANAGER)
                        .active(true)
                        .build());
                log.info("Default owner and manager users created.");
            }
        } catch (Exception e) {
            log.warn("Could not seed default owner/manager users: {}", e.getMessage());
        }

        // Website admin account (separate from ERP owner).
        upsertAdmin("admin@nexuserp.com", "Website Admin", "admin123");

        // Primary admin account (Tushar) with OWNER access.
        upsertAdmin("tushargoel711@gmail.com", "Tushar Goel", "Tushar@323");
    }

    /**
     * Idempotently ensure an OWNER-role admin account exists with the given
     * credentials. Isolated in its own try/catch so a failure seeding one
     * account never blocks the others or crashes startup.
     */
    private void upsertAdmin(String email, String name, String rawPassword) {
        try {
            userRepository.findByEmail(email).ifPresentOrElse(existing -> {
                existing.setPassword(passwordEncoder.encode(rawPassword));
                existing.setRole(User.Role.OWNER);
                existing.setActive(true);
                userRepository.save(existing);
                log.info("Admin user ({}) updated.", email);
            }, () -> {
                userRepository.save(User.builder()
                        .name(name)
                        .email(email)
                        .password(passwordEncoder.encode(rawPassword))
                        .role(User.Role.OWNER)
                        .active(true)
                        .build());
                log.info("Admin user ({}) created.", email);
            });
        } catch (Exception e) {
            log.warn("Could not seed admin user {}: {}", email, e.getMessage());
        }
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
