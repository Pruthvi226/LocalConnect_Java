package com.nearnest.dto;

import java.time.LocalDateTime;

public class BookingCreateRequest {
    private Long serviceId;
    private LocalDateTime bookingDate;
    private String notes;
    private Boolean isEmergency;
    private String problemImageUrl;

    // Getters and Setters
    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Boolean getIsEmergency() { return isEmergency; }
    public void setIsEmergency(Boolean isEmergency) { this.isEmergency = isEmergency; }
    public String getProblemImageUrl() { return problemImageUrl; }
    public void setProblemImageUrl(String problemImageUrl) { this.problemImageUrl = problemImageUrl; }
}
