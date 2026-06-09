package com.garment.erp.config;

import com.garment.erp.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/admin/login").permitAll()
                .requestMatchers("/api/v1/client-registrations/verify-license").permitAll()
                .requestMatchers("/api/v1/client-registrations/status").permitAll()
                .requestMatchers("/api/v1/client-registrations/login").permitAll()
                .requestMatchers("/api/v1/client-registrations/change-password").permitAll()
                .requestMatchers("/api/v1/client-registrations/forgot-password").permitAll()
                .requestMatchers("/api/v1/client-registrations/purchase").permitAll()
                .requestMatchers("/api/v1/client-registrations/session/**").permitAll()
                .requestMatchers("/api/v1/software/download").permitAll()
                .requestMatchers("/api/v1/ping").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/client-registrations").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // Every other /api/** endpoint requires a valid token. Admin-only
                // operations are further restricted with @PreAuthorize on the controller.
                .requestMatchers("/api/**").authenticated()
                // Non-API requests are the static SPA assets served from the JAR,
                // which must be publicly reachable for the app to load.
                .anyRequest().permitAll()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allowed origins are configurable via the CORS_ALLOWED_ORIGINS env var
        // (comma-separated). Defaults to "*" so the Vercel frontend works out of
        // the box. To tighten, set e.g.
        //   CORS_ALLOWED_ORIGINS=https://nexus-erp-theta-seven.vercel.app
        String origins = System.getenv().getOrDefault("CORS_ALLOWED_ORIGINS", "*");
        if ("*".equals(origins.trim())) {
            configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        } else {
            configuration.setAllowedOrigins(Arrays.asList(origins.split("\\s*,\\s*")));
        }
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Content-Disposition", "Content-Type", "Content-Length"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
