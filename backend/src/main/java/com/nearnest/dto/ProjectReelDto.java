package com.nearnest.dto;

import java.time.LocalDateTime;

public class ProjectReelDto {
    private Long bookingId;
    private String beforeImageUrl;
    private String afterImageUrl;
    private LocalDateTime completedAt;
    private String customerNote;

    public ProjectReelDto() {}

    public ProjectReelDto(Long bookingId, String beforeImageUrl, String afterImageUrl, LocalDateTime completedAt, String customerNote) {
        this.bookingId = bookingId;
        this.beforeImageUrl = beforeImageUrl;
        this.afterImageUrl = afterImageUrl;
        this.completedAt = completedAt;
        this.customerNote = customerNote;
    }

    // Getters and Setters
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public String getBeforeImageUrl() { return beforeImageUrl; }
    public void setBeforeImageUrl(String beforeImageUrl) { this.beforeImageUrl = beforeImageUrl; }
    public String getAfterImageUrl() { return afterImageUrl; }
    public void setAfterImageUrl(String afterImageUrl) { this.afterImageUrl = afterImageUrl; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public String getCustomerNote() { return customerNote; }
    public void setCustomerNote(String customerNote) { this.customerNote = customerNote; }
}
