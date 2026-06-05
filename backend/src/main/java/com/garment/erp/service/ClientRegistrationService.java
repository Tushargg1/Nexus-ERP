package com.garment.erp.service;

import com.garment.erp.entity.ClientDevice;
import com.garment.erp.entity.ClientRegistration;
import com.garment.erp.entity.ClientRegistration.RegistrationStatus;
import com.garment.erp.exception.ResourceNotFoundException;
import com.garment.erp.repository.ClientDeviceRepository;
import com.garment.erp.repository.ClientRegistrationRepository;
import com.garment.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientRegistrationService {

    private final ClientRegistrationRepository repository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClientDeviceRepository deviceRepository;

    public ClientRegistration submitRegistration(String name, String businessName, String email, String phone, String password) {
        ClientRegistration existing = repository.findByEmail(email).orElse(null);

        if (existing != null) {
            throw new IllegalArgumentException("An account with this email already exists. Please login instead.");
        }

        ClientRegistration registration = ClientRegistration.builder()
                .name(name)
                .businessName(businessName)
                .email(email)
                .phone(phone)
                .password(password != null && !password.isBlank() ? passwordEncoder.encode(password) : null)
                .status(RegistrationStatus.NONE)
                .build();

        return repository.save(registration);
    }

    /**
     * Client requests to purchase the software — moves status to PENDING for admin review.
     * Allowed from NONE (never bought) or REJECTED (re-applying).
     */
    public ClientRegistration requestPurchase(String email) {
        ClientRegistration reg = repository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found. Please register first."));

        if (reg.getStatus() == RegistrationStatus.PENDING) {
            throw new IllegalArgumentException("You already have a pending purchase request.");
        }
        if (reg.getStatus() == RegistrationStatus.APPROVED) {
            throw new IllegalArgumentException("You already have an approved license.");
        }
        // NONE or REJECTED → set to PENDING
        reg.setStatus(RegistrationStatus.PENDING);
        reg.setApprovedAt(null);
        return repository.save(reg);
    }

    public List<ClientRegistration> getPendingRegistrations() {
        return repository.findByStatus(RegistrationStatus.PENDING);
    }

    public List<ClientRegistration> getAllRegistrations() {
        // Only show accounts that have actually requested a purchase (exclude NONE)
        return repository.findAll().stream()
                .filter(r -> r.getStatus() != RegistrationStatus.NONE)
                .toList();
    }

    public ClientRegistration approveRegistration(Long id) {
        ClientRegistration reg = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClientRegistration", "id", id));
        reg.setStatus(RegistrationStatus.APPROVED);
        reg.setApprovedAt(LocalDateTime.now());
        return repository.save(reg);
    }

    public ClientRegistration rejectRegistration(Long id) {
        ClientRegistration reg = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClientRegistration", "id", id));
        reg.setStatus(RegistrationStatus.REJECTED);
        return repository.save(reg);
    }

    public boolean verifyLicense(String email) {
        // Internal users (owner, manager, admin) are always licensed
        if (userRepository.existsByEmail(email)) {
            return true;
        }
        // External clients need an approved registration
        return repository.findByEmail(email)
                .map(reg -> reg.getStatus() == RegistrationStatus.APPROVED)
                .orElse(false);
    }

    /**
     * Authenticate a client by email + password.
     * Returns the registration if credentials are valid, otherwise null.
     */
    public ClientRegistration authenticate(String email, String rawPassword) {
        ClientRegistration reg = repository.findByEmail(email).orElse(null);
        if (reg == null || reg.getPassword() == null) {
            return null;
        }
        if (passwordEncoder.matches(rawPassword, reg.getPassword())) {
            return reg;
        }
        return null;
    }

    /** Sessions are considered stale (abandoned) after this many minutes without a heartbeat. */
    private static final long SESSION_TIMEOUT_MINUTES = 10;

    public enum SessionResult { GRANTED, ACTIVE_ELSEWHERE }

    /**
     * Attempts to acquire the single active session for this account on the given device.
     * - Granted if no active session, the session is stale, the same device, or force=true.
     * - Denied (ACTIVE_ELSEWHERE) if another device holds a fresh session and force=false.
     *
     * When force=true, the user explicitly chose to switch devices, kicking the old one.
     */
    public SessionResult acquireSession(ClientRegistration reg, String deviceId, String deviceLabel, boolean force) {
        LocalDateTime now = LocalDateTime.now();
        boolean stale = reg.getSessionLastSeen() == null
                || reg.getSessionLastSeen().isBefore(now.minusMinutes(SESSION_TIMEOUT_MINUTES));
        boolean sameDevice = deviceId != null && deviceId.equals(reg.getActiveDeviceId());
        boolean noActive = reg.getActiveDeviceId() == null;

        if (noActive || stale || sameDevice || force) {
            reg.setActiveDeviceId(deviceId);
            reg.setSessionLastSeen(now);
            repository.save(reg);
            recordDevice(reg.getEmail(), deviceId, deviceLabel, now);
            return SessionResult.GRANTED;
        }
        return SessionResult.ACTIVE_ELSEWHERE;
    }

    /** Records/updates the device in the per-client device history. */
    private void recordDevice(String email, String deviceId, String label, LocalDateTime now) {
        if (deviceId == null || deviceId.isBlank()) return;
        ClientDevice device = deviceRepository.findByClientEmailAndDeviceId(email, deviceId).orElse(null);
        if (device == null) {
            device = ClientDevice.builder()
                    .clientEmail(email)
                    .deviceId(deviceId)
                    .deviceLabel(label)
                    .firstSeen(now)
                    .lastSeen(now)
                    .build();
        } else {
            device.setLastSeen(now);
            if (label != null && !label.isBlank()) device.setDeviceLabel(label);
        }
        deviceRepository.save(device);
    }

    /** Keeps an active session alive. Returns false if this device no longer holds the session. */
    public boolean heartbeat(String email, String deviceId) {
        ClientRegistration reg = repository.findByEmail(email).orElse(null);
        if (reg == null) return false;
        if (deviceId != null && deviceId.equals(reg.getActiveDeviceId())) {
            LocalDateTime now = LocalDateTime.now();
            reg.setSessionLastSeen(now);
            repository.save(reg);
            recordDevice(email, deviceId, null, now);
            return true;
        }
        return false;
    }

    /** Releases the session if the given device currently holds it (logout). */
    public void releaseSession(String email, String deviceId) {
        ClientRegistration reg = repository.findByEmail(email).orElse(null);
        if (reg == null) return;
        if (deviceId == null || deviceId.equals(reg.getActiveDeviceId())) {
            reg.setActiveDeviceId(null);
            reg.setSessionLastSeen(null);
            repository.save(reg);
        }
    }

    /** Admin/forced: clear the active session regardless of device (forces re-login everywhere). */
    public void forceLogout(String email) {
        ClientRegistration reg = repository.findByEmail(email).orElse(null);
        if (reg == null) return;
        reg.setActiveDeviceId(null);
        reg.setSessionLastSeen(null);
        repository.save(reg);
    }

    /** Returns all devices seen for a client, marking which one is currently active. */
    public List<ClientDevice> getDevicesForClient(String email) {
        return deviceRepository.findByClientEmail(email);
    }

    /** The device id currently holding the active session (or null). */
    public String getActiveDeviceId(String email) {
        ClientRegistration reg = repository.findByEmail(email).orElse(null);
        return reg != null ? reg.getActiveDeviceId() : null;
    }

    /** Is the client's session currently fresh (active within the timeout window)? */
    public boolean isSessionActive(ClientRegistration reg) {
        if (reg.getActiveDeviceId() == null || reg.getSessionLastSeen() == null) return false;
        return reg.getSessionLastSeen().isAfter(LocalDateTime.now().minusMinutes(SESSION_TIMEOUT_MINUTES));
    }

    /**
     * Change a client's password after verifying the current one.
     */
    public boolean changePassword(String email, String currentPassword, String newPassword) {
        ClientRegistration reg = repository.findByEmail(email).orElse(null);
        if (reg == null || reg.getPassword() == null) {
            return false;
        }
        if (!passwordEncoder.matches(currentPassword, reg.getPassword())) {
            return false;
        }
        reg.setPassword(passwordEncoder.encode(newPassword));
        repository.save(reg);
        return true;
    }

    /**
     * Generates a temporary password for the account, saves it (hashed), and
     * returns the plaintext so the caller can email it. Returns null if no
     * account exists for the email (caller should respond generically to avoid
     * leaking which emails are registered).
     */
    public String resetPassword(String email) {
        ClientRegistration reg = repository.findByEmail(email).orElse(null);
        if (reg == null) {
            return null;
        }
        String temp = generateTempPassword();
        reg.setPassword(passwordEncoder.encode(temp));
        repository.save(reg);
        return temp;
    }

    private String generateTempPassword() {
        // 10-char temp password from an unambiguous alphabet
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
        java.security.SecureRandom rnd = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public ClientRegistration getByEmail(String email) {
        return repository.findByEmail(email).orElse(null);
    }
}
