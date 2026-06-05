package com.garment.erp.scheduler;

import com.garment.erp.service.BackupService;
import com.garment.erp.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchedulerJobs {

    private final BackupService backupService;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void scheduleDailyBackup() {
        log.info("Executing scheduled daily backup");
        backupService.runScheduledBackup();
    }

    @Scheduled(cron = "0 0 9 * * ?")
    public void scheduleDailyNotifications() {
        log.info("Executing scheduled daily notifications for pending orders and low stock");
        // Additional notification logic could go here
    }
}
