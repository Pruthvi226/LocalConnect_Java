package com.nearnest.dto;

import com.nearnest.model.Booking;
import com.nearnest.model.Booking.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingDto {
    private Long id;
    private Long serviceId;
    private String serviceTitle;
    private Long customerId;
    private String customerName;
    private Long providerId;
    private String providerName;
    private LocalDateTime bookingDate;
    private BookingStatus status;
    private String notes;
    private LocalDateTime createdAt;

    // Nested service object for frontend compatibility
    private ServiceSummary service;

    public BookingDto() {}

    public static BookingDto fromEntity(Booking b) {
        BookingDto dto = new BookingDto();
        dto.setId(b.getId());
        dto.setServiceId(b.getService().getId());
        dto.setServiceTitle(b.getService().getTitle());
        dto.setCustomerId(b.getUser().getId());
        dto.setCustomerName(b.getUser().getFullName());
        if (b.getService().getProvider() != null) {
            dto.setProviderId(b.getService().getProvider().getId());
            dto.setProviderName(b.getService().getProvider().getFullName());
        }
        dto.setBookingDate(b.getBookingDate());
        dto.setStatus(b.getStatus());
        dto.setNotes(b.getNotes());
        dto.setCreatedAt(b.getCreatedAt());

        // Populate nested service summary
        ServiceSummary svc = new ServiceSummary();
        svc.setId(b.getService().getId());
        svc.setTitle(b.getService().getTitle());
        svc.setCategory(b.getService().getCategory());
        svc.setLocation(b.getService().getLocation());
        svc.setPrice(b.getService().getPrice());
        svc.setImageUrl(b.getService().getImageUrl());
        svc.setAverageRating(b.getService().getAverageRating());
        if (b.getService().getProvider() != null) {
            ProviderInfo prov = new ProviderInfo();
            prov.setId(b.getService().getProvider().getId());
            prov.setFullName(b.getService().getProvider().getFullName());
            svc.setProvider(prov);
        }
        dto.setService(svc);

        return dto;
    }

    // ---- Nested classes ----
    public static class ServiceSummary {
        private Long id;
        private String title;
        private String category;
        private String location;
        private BigDecimal price;
        private String imageUrl;
        private Double averageRating;
        private ProviderInfo provider;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public Double getAverageRating() { return averageRating; }
        public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
        public ProviderInfo getProvider() { return provider; }
        public void setProvider(ProviderInfo provider) { this.provider = provider; }
    }

    public static class ProviderInfo {
        private Long id;
        private String fullName;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
    }

    // ---- Existing Getters and Setters ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public String getServiceTitle() { return serviceTitle; }
    public void setServiceTitle(String serviceTitle) { this.serviceTitle = serviceTitle; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }
    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public ServiceSummary getService() { return service; }
    public void setService(ServiceSummary service) { this.service = service; }
}
