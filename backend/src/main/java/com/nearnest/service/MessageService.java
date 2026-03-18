package com.nearnest.service;

import com.nearnest.dto.MessageDto;
import com.nearnest.model.Booking;
import com.nearnest.model.Message;
import com.nearnest.model.User;
import com.nearnest.repository.BookingRepository;
import com.nearnest.repository.MessageRepository;
import com.nearnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MessageService {
    @Autowired
    MessageRepository messageRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    BookingRepository bookingRepository;

    @Autowired
    AuthService authService;

    @Autowired
    NotificationService notificationService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MessageDto sendMessage(Long receiverId, String content, Long bookingId) {
        User sender = authService.getCurrentUser();
        if (sender == null) {
            throw new RuntimeException("User not authenticated");
        }

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);

        if (bookingId != null) {
            Optional<Booking> booking = bookingRepository.findById(bookingId);
            booking.ifPresent(message::setBooking);
        }

        Message savedMessage = messageRepository.save(message);

        // Create notification for receiver (also pushes via STOMP)
        notificationService.createNotification(
                receiver,
                "New Message",
                "You received a message from " + sender.getFullName(),
                com.nearnest.model.Notification.NotificationType.MESSAGE_RECEIVED,
                savedMessage.getId()
        );

        // Realtime push to receiver
        MessageDto dto = MessageDto.fromEntity(savedMessage);
        messagingTemplate.convertAndSendToUser(receiver.getUsername(), "/queue/messages", dto);

        return dto;
    }

    public List<MessageDto> getConversation(Long otherUserId) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return messageRepository.findConversation(currentUser, otherUser).stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<MessageDto> getUnreadMessages() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        return messageRepository.findByReceiverAndIsReadFalse(currentUser).stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long messageId) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getReceiver().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only mark your own messages as read");
        }

        message.setIsRead(true);
        messageRepository.save(message);
    }

    @Transactional
    public void markAllAsRead() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        List<Message> unreadMessages = messageRepository.findByReceiverAndIsReadFalse(currentUser);
        for (Message message : unreadMessages) {
            message.setIsRead(true);
        }
        messageRepository.saveAll(unreadMessages);
    }
}
