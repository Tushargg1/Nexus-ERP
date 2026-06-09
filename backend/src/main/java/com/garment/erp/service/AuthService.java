package com.garment.erp.service;

import com.garment.erp.dto.AuthResponse;
import com.garment.erp.dto.LoginRequest;
import com.garment.erp.entity.User;
import com.garment.erp.repository.UserRepository;
import com.garment.erp.security.JwtUtil;
import jakarta.annotation.PostConstruct;
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

    @PostConstruct
    public void createDefaultUsers() {
        try {
            jdbcTemplate.update("UPDATE users SET role='OWNER' WHERE role='ADMIN'");
        } catch (Exception e) {
            log.warn("Migration update failed or not needed: " + e.getMessage());
        }
        
        if (userRepository.count() == 0) {
            User owner = User.builder()
                    .name("Factory Owner")
                    .email("owner@garment.com")
                    .password(passwordEncoder.encode("owner123"))
                    .role(User.Role.OWNER)
                    .active(true)
                    .build();
            userRepository.save(owner);
            
            User manager = User.builder()
                    .name("Factory Manager")
                    .email("manager@garment.com")
                    .password(passwordEncoder.encode("manager123"))
                    .role(User.Role.MANAGER)
                    .active(true)
                    .build();
            userRepository.save(manager);
            log.info("Default owner and manager users created.");
        }

        // Ensure the website admin account exists (separate from ERP owner)
        if (!userRepository.existsByEmail("admin@nexuserp.com")) {
            User admin = User.builder()
                    .name("Website Admin")
                    .email("admin@nexuserp.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.OWNER)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Website admin user (admin@nexuserp.com) created.");
        }

        // Ensure the primary admin account (Tushar) exists with OWNER access.
        // Idempotent: creates it if missing, otherwise enforces role/password/active
        // so a redeploy reliably (re)applies the intended credentials.
        userRepository.findByEmail("tushargoel711@gmail.com").ifPresentOrElse(existing -> {
            existing.setPassword(passwordEncoder.encode("Tushar@323"));
            existing.setRole(User.Role.OWNER);
            existing.setActive(true);
            userRepository.save(existing);
            log.info("Primary admin user (tushargoel711@gmail.com) updated.");
        }, () -> {
            User tushar = User.builder()
                    .name("Tushar Goel")
                    .email("tushargoel711@gmail.com")
                    .password(passwordEncoder.encode("Tushar@323"))
                    .role(User.Role.OWNER)
                    .active(true)
                    .build();
            userRepository.save(tushar);
            log.info("Primary admin user (tushargoel711@gmail.com) created.");
        });
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
