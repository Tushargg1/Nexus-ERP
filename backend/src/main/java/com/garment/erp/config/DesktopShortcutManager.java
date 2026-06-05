package com.garment.erp.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.swing.JOptionPane;
import java.io.File;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * On the first run of the installed desktop app, offers to create a Windows
 * desktop shortcut to the application launcher (.exe). Only runs once — a
 * marker file is written next to the app so the user is not asked again.
 *
 * Active only when the app is launched as the packaged desktop app
 * (-Dapp.open-browser=true), never during development.
 */
@Component
@Order(100)
public class DesktopShortcutManager {

    private static final Logger log = LoggerFactory.getLogger(DesktopShortcutManager.class);
    private static final String SHORTCUT_NAME = "Nexus ERP.lnk";
    private static final String MARKER_NAME = ".shortcut_created";

    @Value("${app.open-browser:false}")
    private boolean installedApp;

    @EventListener(ApplicationReadyEvent.class)
    public void offerShortcut() {
        if (!installedApp) {
            return; // dev mode — do nothing
        }
        // jpackage exposes the full path to the launched .exe here
        String appPath = System.getProperty("jpackage.app-path");
        if (appPath == null || appPath.isBlank()) {
            return; // not running from the packaged exe
        }

        try {
            File exe = new File(appPath);
            File appDir = exe.getParentFile();
            File marker = new File(appDir, MARKER_NAME);

            // Only ask once
            if (marker.exists()) {
                return;
            }

            // Hide the internal support folders so the client only sees NexusERP.exe
            hideInternalFolders(appDir);

            // Ask the user (Swing dialog — java.desktop is bundled in the runtime)
            int choice = JOptionPane.showConfirmDialog(
                    null,
                    "Create a desktop shortcut for Nexus ERP?",
                    "Nexus ERP Setup",
                    JOptionPane.YES_NO_OPTION,
                    JOptionPane.QUESTION_MESSAGE);

            // Record that we asked, regardless of the answer, so we don't nag again
            try { marker.createNewFile(); } catch (Exception ignored) {}
            // The marker itself should be hidden too
            setHidden(marker);

            if (choice == JOptionPane.YES_OPTION) {
                createWindowsShortcut(exe);
            }
        } catch (Exception e) {
            log.warn("Could not complete first-run setup: {}", e.getMessage());
        }
    }

    /** Hides the jpackage support folders/files so only NexusERP.exe is visible. */
    private void hideInternalFolders(File appDir) {
        for (String name : new String[] { "app", "runtime", "database", "NexusERP.ico", "README.txt" }) {
            setHidden(new File(appDir, name));
        }
    }

    private void setHidden(File f) {
        try {
            if (f.exists()) {
                Runtime.getRuntime().exec(new String[] { "attrib", "+h", f.getAbsolutePath() }).waitFor();
            }
        } catch (Exception ignored) {
        }
    }

    /**
     * Creates a .lnk on the user's Desktop pointing at the app launcher,
     * using a tiny VBScript (native Windows, no external dependencies).
     */
    private void createWindowsShortcut(File exe) throws Exception {
        String desktop = System.getProperty("user.home") + File.separator + "Desktop";
        File desktopDir = new File(desktop);
        if (!desktopDir.exists()) {
            log.warn("Desktop folder not found at {}", desktop);
            return;
        }

        File shortcut = new File(desktopDir, SHORTCUT_NAME);
        File icon = new File(exe.getParentFile(), "NexusERP.ico");

        // Build a temporary VBScript that creates the shortcut
        Path vbs = Files.createTempFile("nexus_shortcut", ".vbs");
        try (PrintWriter w = new PrintWriter(Files.newBufferedWriter(vbs))) {
            w.println("Set ws = CreateObject(\"WScript.Shell\")");
            w.println("Set lnk = ws.CreateShortcut(\"" + escape(shortcut.getAbsolutePath()) + "\")");
            w.println("lnk.TargetPath = \"" + escape(exe.getAbsolutePath()) + "\"");
            w.println("lnk.WorkingDirectory = \"" + escape(exe.getParent()) + "\"");
            if (icon.exists()) {
                w.println("lnk.IconLocation = \"" + escape(icon.getAbsolutePath()) + "\"");
            }
            w.println("lnk.Description = \"Nexus ERP - Business Management System\"");
            w.println("lnk.Save");
        }

        Process p = Runtime.getRuntime().exec(new String[] {
                "cscript", "//Nologo", vbs.toAbsolutePath().toString()
        });
        p.waitFor();
        Files.deleteIfExists(vbs);

        if (shortcut.exists()) {
            log.info("Desktop shortcut created at {}", shortcut.getAbsolutePath());
            JOptionPane.showMessageDialog(null,
                    "Desktop shortcut created. You can now launch Nexus ERP from your desktop.",
                    "Nexus ERP", JOptionPane.INFORMATION_MESSAGE);
        }
    }

    private String escape(String s) {
        return s.replace("\"", "\"\"");
    }
}
