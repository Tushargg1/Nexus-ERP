package com.garment.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.awt.Desktop;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
@EnableScheduling
public class GarmentErpApplication {

    private static final String PING_MARKER = "NEXUS_ERP_OK";

    public static void main(String[] args) {
        // Desktop-app launch handling (only when packaged with -Dapp.open-browser=true)
        if ("true".equalsIgnoreCase(System.getProperty("app.open-browser"))) {
            int port = Integer.parseInt(System.getProperty("server.port", "8080"));
            String baseUrl = "http://localhost:" + port;

            PortState state = checkPort(port);
            switch (state) {
                case OURS:
                    // Our own server is already running — just open the browser, don't start a 2nd one.
                    openBrowser(baseUrl);
                    System.out.println("Nexus ERP is already running. Opened it in your browser.");
                    return;
                case FOREIGN:
                    // Some other process is squatting on the port — free it, then start.
                    System.out.println("Port " + port + " is in use by another process. Freeing it...");
                    freePort(port);
                    sleep(1500);
                    break;
                case FREE:
                default:
                    break;
            }
        }
        SpringApplication.run(GarmentErpApplication.class, args);
    }

    private enum PortState { FREE, OURS, FOREIGN }

    /** Determines whether the port is free, running our app, or held by a foreign process. */
    private static PortState checkPort(int port) {
        try {
            URL url = new URL("http://localhost:" + port + "/api/v1/ping");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(1500);
            conn.setReadTimeout(1500);
            conn.setRequestMethod("GET");
            int code = conn.getResponseCode();
            if (code == 200) {
                try (BufferedReader r = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                    String body = r.readLine();
                    if (body != null && body.contains(PING_MARKER)) {
                        return PortState.OURS;
                    }
                }
            }
            // Got an HTTP response but not our marker → some other web server
            return PortState.FOREIGN;
        } catch (java.net.ConnectException e) {
            return PortState.FREE; // nothing listening
        } catch (Exception e) {
            // Something is on the port but didn't answer our ping cleanly → treat as foreign
            return isPortListening(port) ? PortState.FOREIGN : PortState.FREE;
        }
    }

    /** Quick TCP check: is anything listening on the port? */
    private static boolean isPortListening(int port) {
        try (java.net.Socket s = new java.net.Socket()) {
            s.connect(new java.net.InetSocketAddress("localhost", port), 1000);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Kills the process(es) listening on the given TCP port (Windows).
     * Used only when a FOREIGN process is blocking our port.
     */
    private static void freePort(int port) {
        try {
            List<String> pids = new ArrayList<>();
            Process find = Runtime.getRuntime().exec(new String[] { "cmd", "/c", "netstat -ano -p tcp" });
            try (BufferedReader r = new BufferedReader(new InputStreamReader(find.getInputStream()))) {
                String line;
                while ((line = r.readLine()) != null) {
                    String trimmed = line.trim();
                    // Match lines like:  TCP  0.0.0.0:8080  ...  LISTENING  <pid>
                    if (trimmed.contains(":" + port + " ") && trimmed.toUpperCase().contains("LISTENING")) {
                        String[] parts = trimmed.split("\\s+");
                        String pid = parts[parts.length - 1];
                        if (!pids.contains(pid) && !"0".equals(pid)) {
                            pids.add(pid);
                        }
                    }
                }
            }
            for (String pid : pids) {
                System.out.println("Stopping process PID " + pid + " on port " + port);
                Runtime.getRuntime().exec(new String[] { "taskkill", "/PID", pid, "/F" }).waitFor();
            }
        } catch (Exception e) {
            System.out.println("Could not free port " + port + ": " + e.getMessage());
        }
    }

    private static void openBrowser(String url) {
        try {
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI(url));
            } else {
                Runtime.getRuntime().exec(new String[] { "rundll32", "url.dll,FileProtocolHandler", url });
            }
        } catch (Exception ignored) {
        }
    }

    private static void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); }
    }
}
