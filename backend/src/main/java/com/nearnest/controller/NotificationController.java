package com.nearnest.controller;

import com.nearnest.dto.NotificationDto;
import com.nearnest.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getUserNotifications() {
        return ResponseEntity.ok(notificationService.getUserNotifications());
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications() {
        return ResponseEntity.ok(notificationService.getUnreadNotifications());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(Objects.requireNonNull(id));
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
