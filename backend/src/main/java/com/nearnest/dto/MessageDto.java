package com.nearnest.dto;

import com.nearnest.model.Message;
import java.time.LocalDateTime;

public class MessageDto {
    private Long id;
    private UserDto sender;
    private UserDto receiver;
    private String content;
    private Long bookingId;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public MessageDto() {}

    public MessageDto(Long id, UserDto sender, UserDto receiver, String content,
                      Long bookingId, Boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.bookingId = bookingId;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public static MessageDto fromEntity(Message m) {
        return new MessageDto(
                m.getId(),
                UserDto.fromEntity(m.getSender()),
                UserDto.fromEntity(m.getReceiver()),
                m.getContent(),
                m.getBooking() != null ? m.getBooking().getId() : null,
                m.getIsRead(),
                m.getCreatedAt()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserDto getSender() { return sender; }
    public void setSender(UserDto sender) { this.sender = sender; }
    public UserDto getReceiver() { return receiver; }
    public void setReceiver(UserDto receiver) { this.receiver = receiver; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
