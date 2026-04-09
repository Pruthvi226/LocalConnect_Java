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
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Objects;
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
    public MessageDto sendMessage(@NonNull Long receiverId, @NonNull String content, Long bookingId) {
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
                Objects.requireNonNull(receiver),
                "New Message",
                "You received a message from " + sender.getFullName(),
                com.nearnest.model.Notification.NotificationType.MESSAGE_RECEIVED,
                savedMessage.getId()
        );

        // Realtime push to receiver
        MessageDto dto = MessageDto.fromEntity(savedMessage);
        messagingTemplate.convertAndSendToUser(Objects.requireNonNull(receiver.getUsername()), "/queue/messages", Objects.requireNonNull(dto));

        return dto;
    }

    public List<MessageDto> getConversation(@NonNull Long otherUserId) {
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
    public void markAsRead(@NonNull Long messageId) {
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
        messageRepository.saveAll(Objects.requireNonNull(unreadMessages));
    }

    public List<MessageDto> getMessagesByBooking(@NonNull Long bookingId) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Security check: Only customer or provider can see messages for this booking
        boolean isCustomer = booking.getUser().getId().equals(currentUser.getId());
        boolean isProvider = booking.getService().getProvider().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;

        if (!isCustomer && !isProvider && !isAdmin) {
            throw new RuntimeException("Access denied: You are not part of this booking");
        }

        return messageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId).stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.toList());
    }
}
