package com.nearnest.service;

import com.nearnest.dto.NotificationDto;
import com.nearnest.model.Notification;
import com.nearnest.model.User;
import com.nearnest.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private AuthService authService;

    @Transactional
    public NotificationDto createNotification(@NonNull User user, @NonNull String title, @NonNull String message,
                                           @NonNull Notification.NotificationType type, Long relatedId) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedId(relatedId);
        notification.setIsRead(false);

        Notification saved = notificationRepository.save(notification);
        NotificationDto dto = NotificationDto.fromEntity(saved);
        // Realtime push to user
        messagingTemplate.convertAndSendToUser(Objects.requireNonNull(user.getUsername()), "/queue/notifications", Objects.requireNonNull(dto));
        return dto;
    }

    public List<NotificationDto> getUserNotifications() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }
        return notificationRepository.findByUserOrderByCreatedAtDesc(currentUser).stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<NotificationDto> getUnreadNotifications() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(currentUser).stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    public Long getUnreadCount() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            return 0L;
        }
        return notificationRepository.countUnreadByUser(currentUser);
    }

    @Transactional
    public void markAsRead(@NonNull Long notificationId) {
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
        notificationRepository.saveAll(Objects.requireNonNull(unreadNotifications));
    }
}
