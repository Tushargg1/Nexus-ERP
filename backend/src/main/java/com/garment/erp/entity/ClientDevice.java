package com.garment.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Records each device that has logged into a client account. Used by the admin
 * panel to view all devices per client, their active status, and to force
 * logout. A client may have many ClientDevice rows over time, but only one can
 * hold the active session at a time (tracked on ClientRegistration).
 */
@Entity
@Table(name = "client_devices",
       uniqueConstraints = @UniqueConstraint(columnNames = {"client_email", "device_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_email", nullable = false, length = 100)
    private String clientEmail;

    @Column(name = "device_id", nullable = false, length = 100)
    private String deviceId;

    /** Optional human-friendly label (e.g. OS/browser) for the admin view. */
    @Column(name = "device_label", length = 200)
    private String deviceLabel;

    @Column(name = "first_seen")
    private LocalDateTime firstSeen;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;
}
