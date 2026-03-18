package com.nearnest.controller;

import com.nearnest.dto.MessageDto;
import com.nearnest.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<MessageDto> sendMessage(@RequestBody Map<String, Object> request) {
        Long receiverId = Long.parseLong(request.get("receiverId").toString());
        String content = request.get("content").toString();
        Long bookingId = request.get("bookingId") != null ? 
                Long.parseLong(request.get("bookingId").toString()) : null;

        return ResponseEntity.ok(messageService.sendMessage(receiverId, content, bookingId));
    }

    @GetMapping("/conversation/{userId}")
    public ResponseEntity<List<MessageDto>> getConversation(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getConversation(userId));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<MessageDto>> getUnreadMessages() {
        return ResponseEntity.ok(messageService.getUnreadMessages());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Long id) {
        messageService.markAsRead(id);
        return ResponseEntity.ok(Map.of("message", "Message marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        messageService.markAllAsRead();
        return ResponseEntity.ok(Map.of("message", "All messages marked as read"));
    }
}
