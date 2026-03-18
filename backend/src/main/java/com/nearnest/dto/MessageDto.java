package com.nearnest.dto;

import com.nearnest.model.Message;
import java.time.LocalDateTime;

public class MessageDto {
    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String content;
    private Long bookingId;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public MessageDto() {}

    public MessageDto(Long id, Long senderId, String senderName, Long receiverId, String content,
                      Long bookingId, Boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.senderId = senderId;
        this.senderName = senderName;
        this.receiverId = receiverId;
        this.content = content;
        this.bookingId = bookingId;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public static MessageDto fromEntity(Message m) {
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
