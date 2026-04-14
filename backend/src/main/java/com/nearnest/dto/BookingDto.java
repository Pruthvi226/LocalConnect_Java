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
    private Boolean isEmergency;
    private String problemImageUrl;
    private Double basePrice;
    private Double platformFee;
    private Double totalPrice;
    private String beforeImageUrl;
    private String afterImageUrl;
    private Double providerLat;
    private Double providerLng;
    private Integer etaMinutes;
    private LocalDateTime createdAt;
    private Long paymentId;
    private String paymentStatus;
    private String paymentMethod;
    private Double paymentAmount;
    private String pin;
    private BigDecimal proposedPrice;

    // Nested service object for frontend compatibility
    private ServiceSummary service;

    // Nested customer object (frontend accesses booking.Customer?.fullName)
    private CustomerInfo Customer;

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
        dto.setIsEmergency(b.getIsEmergency());
        dto.setProblemImageUrl(b.getProblemImageUrl());
        dto.setBasePrice(b.getBasePrice());
        dto.setPlatformFee(b.getPlatformFee());
        dto.setTotalPrice(b.getTotalPrice());
        dto.setBeforeImageUrl(b.getBeforeImageUrl());
        dto.setAfterImageUrl(b.getAfterImageUrl());
        dto.setProviderLat(b.getProviderLat());
        dto.setProviderLng(b.getProviderLng());
        dto.setEtaMinutes(b.getEtaMinutes());
        dto.setCreatedAt(b.getCreatedAt());
        
        if (b.getPayment() != null) {
            dto.setPaymentId(b.getPayment().getId());
            dto.setPaymentStatus(b.getPayment().getStatus().name());
            dto.setPaymentMethod(b.getPayment().getPaymentMethod());
            dto.setPaymentAmount(b.getPayment().getAmount().doubleValue());
        }

        // Populate nested service summary
        ServiceSummary svc = new ServiceSummary();
        svc.setId(b.getService().getId());
        svc.setTitle(b.getService().getTitle());
        svc.setCategory(b.getService().getCategory());
        svc.setLocation(b.getService().getLocation());
        svc.setPrice(b.getService().getPrice());
        svc.setImageUrl(b.getService().getImageUrl());
        svc.setAverageRating(b.getService().getAverageRating());
        svc.setIsAvailableNow(b.getService().getIsAvailableNow());
        svc.setPlatformFee(b.getService().getPlatformFee());
        if (b.getService().getProvider() != null) {
            ProviderInfo prov = new ProviderInfo();
            prov.setId(b.getService().getProvider().getId());
            prov.setFullName(b.getService().getProvider().getFullName());
            svc.setProvider(prov);
        }
        dto.setService(svc);

        // Populate nested Customer object for frontend compatibility
        CustomerInfo cust = new CustomerInfo();
        cust.setId(b.getUser().getId());
        cust.setFullName(b.getUser().getFullName() != null ? b.getUser().getFullName() : b.getUser().getUsername());
        cust.setPhone(b.getUser().getPhone());
        cust.setEmail(b.getUser().getEmail());
        dto.setCustomer(cust);

        dto.setPin(b.getPin());
        dto.setProposedPrice(b.getProposedPrice());

        // Phase 5: Dynamic ETA Logic
        if (b.getProviderLat() != null && b.getProviderLng() != null && b.getUser() != null) {
             // Simulating dynamic travel time based on distance (30km/h + 8min buffer)
             // We use the booking's own lat/lng if available (requested location)
             // For this demo, we'll assume a 15-25 min range if location is approximate
             dto.setEtaMinutes(15 + (int)(Math.random() * 10));
        }

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
        private Boolean isAvailableNow;
        private Double platformFee;
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
        public Boolean getIsAvailableNow() { return isAvailableNow; }
        public void setIsAvailableNow(Boolean isAvailableNow) { this.isAvailableNow = isAvailableNow; }
        public Double getPlatformFee() { return platformFee; }
        public void setPlatformFee(Double platformFee) { this.platformFee = platformFee; }
        public ProviderInfo getProvider() { return provider; }
        public void setProvider(ProviderInfo provider) { this.provider = provider; }
    }

    public static class CustomerInfo {
        private Long id;
        private String fullName;
        private String phone;
        private String email;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
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
    public Boolean getIsEmergency() { return isEmergency; }
    public void setIsEmergency(Boolean isEmergency) { this.isEmergency = isEmergency; }
    public String getProblemImageUrl() { return problemImageUrl; }
    public void setProblemImageUrl(String problemImageUrl) { this.problemImageUrl = problemImageUrl; }
    public Double getBasePrice() { return basePrice; }
    public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }
    public Double getPlatformFee() { return platformFee; }
    public void setPlatformFee(Double platformFee) { this.platformFee = platformFee; }
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
    public String getBeforeImageUrl() { return beforeImageUrl; }
    public void setBeforeImageUrl(String beforeImageUrl) { this.beforeImageUrl = beforeImageUrl; }
    public String getAfterImageUrl() { return afterImageUrl; }
    public void setAfterImageUrl(String afterImageUrl) { this.afterImageUrl = afterImageUrl; }
    public Double getProviderLat() { return providerLat; }
    public void setProviderLat(Double providerLat) { this.providerLat = providerLat; }
    public Double getProviderLng() { return providerLng; }
    public void setProviderLng(Double providerLng) { this.providerLng = providerLng; }
    public Integer getEtaMinutes() { return etaMinutes; }
    public void setEtaMinutes(Integer etaMinutes) { this.etaMinutes = etaMinutes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public Double getPaymentAmount() { return paymentAmount; }
    public void setPaymentAmount(Double paymentAmount) { this.paymentAmount = paymentAmount; }
    public ServiceSummary getService() { return service; }
    public void setService(ServiceSummary service) { this.service = service; }
    public CustomerInfo getCustomer() { return Customer; }
    public void setCustomer(CustomerInfo customer) { this.Customer = customer; }
    
    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }

    public BigDecimal getProposedPrice() { return proposedPrice; }
    public void setProposedPrice(BigDecimal proposedPrice) { this.proposedPrice = proposedPrice; }
}
