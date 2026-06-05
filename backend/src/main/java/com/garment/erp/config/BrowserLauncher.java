package com.garment.erp.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.awt.Desktop;
import java.net.URI;

/**
 * When running as the installed desktop app, automatically opens the default
 * browser to the app once the server is ready. Disabled by default so it does
 * NOT trigger during development; the packaged app enables it via
 * -Dapp.open-browser=true (set in the jpackage launcher).
 */
@Component
public class BrowserLauncher {

    private static final Logger log = LoggerFactory.getLogger(BrowserLauncher.class);

    @Value("${app.open-browser:false}")
    private boolean openBrowser;

    @Value("${server.port:8080}")
    private int serverPort;

    @EventListener(ApplicationReadyEvent.class)
    public void launchBrowser() {
        if (!openBrowser) {
            return;
        }
        String url = "http://localhost:" + serverPort;
        try {
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI(url));
                log.info("Opened browser at {}", url);
            } else {
                // Fallback for Windows when Desktop API is unavailable
                Runtime.getRuntime().exec(new String[] { "rundll32", "url.dll,FileProtocolHandler", url });
                log.info("Opened browser (fallback) at {}", url);
            }
        } catch (Exception e) {
            log.warn("Could not auto-open browser. Please open {} manually. ({})", url, e.getMessage());
        }
    }
}
