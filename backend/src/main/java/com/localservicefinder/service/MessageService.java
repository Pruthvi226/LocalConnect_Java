package com.localservicefinder.service;

import com.localservicefinder.dto.MessageDto;
import com.localservicefinder.model.Booking;
import com.localservicefinder.model.Message;
import com.localservicefinder.model.User;
import com.localservicefinder.repository.BookingRepository;
import com.localservicefinder.repository.MessageRepository;
import com.localservicefinder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

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
    public Message sendMessage(Long receiverId, String content, Long bookingId) {
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
                com.localservicefinder.model.Notification.NotificationType.MESSAGE_RECEIVED,
                savedMessage.getId()
        );

        // Realtime push to receiver
        MessageDto dto = toDto(savedMessage);
        messagingTemplate.convertAndSendToUser(receiver.getUsername(), "/queue/messages", dto);

        return savedMessage;
    }

    public List<Message> getConversation(Long otherUserId) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return messageRepository.findConversation(currentUser, otherUser);
    }

    public List<Message> getUnreadMessages() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        return messageRepository.findByReceiverAndIsReadFalse(currentUser);
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

    private MessageDto toDto(Message m) {
        return new MessageDto(
                m.getId(),
                m.getSender().getId(),
                m.getSender().getFullName() != null ? m.getSender().getFullName() : m.getSender().getUsername(),
                m.getReceiver().getId(),
                m.getContent(),
                m.getBooking() != null ? m.getBooking().getId() : null,
                m.getIsRead(),
                m.getCreatedAt()
        );
    }
}
