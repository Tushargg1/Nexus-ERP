package com.garment.erp.service;

import com.garment.erp.entity.Notification;
import com.garment.erp.exception.ResourceNotFoundException;
import com.garment.erp.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead() {
        List<Notification> unread = notificationRepository.findByIsReadFalse();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public long getUnreadCount() {
        return notificationRepository.countByIsReadFalse();
    }

    public Notification createNotification(String type, String title, String message, String severity) {
        Notification notification = Notification.builder()
                .type(type)
                .title(title)
                .message(message)
                .severity(severity)
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }
}
