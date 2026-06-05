package com.garment.erp.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends transactional emails (e.g. password resets).
 *
 * Email is only actually sent when SMTP credentials are configured
 * (app.mail.enabled=true AND a real username/password). Otherwise the message
 * is logged to the server console so the flow can be tested without SMTP.
 */
@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    public void sendPasswordReset(String toEmail, String tempPassword) {
        String subject = "Nexus ERP - Your temporary password";
        String body = "Hello,\n\n"
                + "A password reset was requested for your Nexus ERP account.\n\n"
                + "Your temporary password is: " + tempPassword + "\n\n"
                + "Please sign in with this password and change it from Settings as soon as possible.\n\n"
                + "If you did not request this, please contact support.\n\n"
                + "— Nexus ERP";
        send(toEmail, subject, body);
    }

    private void send(String to, String subject, String body) {
        if (!mailEnabled || fromAddress == null || fromAddress.isBlank()) {
            // Dev / unconfigured mode: log instead of sending.
            log.warn("=== EMAIL NOT SENT (SMTP not configured) ===");
            log.warn("To: {}", to);
            log.warn("Subject: {}", subject);
            log.warn("Body:\n{}", body);
            log.warn("=== Configure SMTP + set app.mail.enabled=true to send real emails ===");
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromAddress);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
            log.info("Password reset email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
