package com.garment.erp.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Provides information about the local server so the owner can share the
 * LAN access URL with managers/staff on the same network.
 */
@RestController
@RequestMapping("/api/v1/server-info")
public class ServerInfoController {

    @Value("${server.port:8080}")
    private int serverPort;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getServerInfo() {
        Map<String, Object> info = new HashMap<>();
        List<String> lanIps = getLanIpAddresses();

        info.put("port", serverPort);
        info.put("lanAddresses", lanIps);

        // Primary URL — the first non-loopback IPv4 address
        String primaryIp = lanIps.isEmpty() ? "localhost" : lanIps.get(0);
        info.put("primaryUrl", "http://" + primaryIp + ":" + serverPort);
        info.put("localUrl", "http://localhost:" + serverPort);

        return ResponseEntity.ok(info);
    }

    /**
     * Collects all non-loopback IPv4 addresses on the machine (the LAN IPs
     * other devices on the same network can use to reach this server).
     */
    private List<String> getLanIpAddresses() {
        List<String> addresses = new ArrayList<>();
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface iface = interfaces.nextElement();
                // Skip loopback and inactive interfaces
                if (iface.isLoopback() || !iface.isUp() || iface.isVirtual()) {
                    continue;
                }
                Enumeration<InetAddress> addrs = iface.getInetAddresses();
                while (addrs.hasMoreElements()) {
                    InetAddress addr = addrs.nextElement();
                    // Only IPv4, non-loopback, site-local addresses (192.168.x, 10.x, 172.16-31.x)
                    if (!addr.isLoopbackAddress() && addr.getHostAddress().indexOf(':') < 0
                            && addr.isSiteLocalAddress()) {
                        addresses.add(addr.getHostAddress());
                    }
                }
            }
        } catch (Exception e) {
            // Fall back to empty list — frontend will show localhost
        }
        return addresses;
    }
}
