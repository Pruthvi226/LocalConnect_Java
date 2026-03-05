package com.localservicefinder.service;

import com.localservicefinder.dto.NotificationDto;
import com.localservicefinder.model.Notification;
import com.localservicefinder.model.User;
import com.localservicefinder.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {
    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Notification createNotification(User user, String title, String message,
                                          Notification.NotificationType type, Long relatedId) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedId(relatedId);
        notification.setIsRead(false);

        Notification saved = notificationRepository.save(notification);
        // Realtime push to user
        messagingTemplate.convertAndSendToUser(user.getUsername(), "/queue/notifications", NotificationDto.fromEntity(saved));
        return saved;
    }

    public List<Notification> getUserNotifications() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }
        return notificationRepository.findByUserOrderByCreatedAtDesc(currentUser);
    }

    public List<Notification> getUnreadNotifications() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(currentUser);
    }

    public Long getUnreadCount() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            return 0L;
        }
        return notificationRepository.countUnreadByUser(currentUser);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only mark your own notifications as read");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        List<Notification> unreadNotifications = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(currentUser);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    @Autowired
    private AuthService authService;
}
