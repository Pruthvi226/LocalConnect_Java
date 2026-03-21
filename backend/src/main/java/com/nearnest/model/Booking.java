package com.nearnest.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_booking_date", columnList = "booking_date"),
    @Index(name = "idx_booking_status", columnList = "status"),
    @Index(name = "idx_booking_user_id", columnList = "user_id"),
    @Index(name = "idx_booking_service_id", columnList = "service_id")
})
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @NotNull
    @Column(name = "booking_date")
    private LocalDateTime bookingDate;

    @Column(name = "status", length = 30)
    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(length = 500)
    private String notes;

    @Column(name = "is_emergency")
    private Boolean isEmergency = false;

    @Column(name = "problem_image_url")
    private String problemImageUrl;

    @Column(name = "base_price")
    private Double basePrice;

    @Column(name = "platform_fee")
    private Double platformFee;

    @Column(name = "total_price")
    private Double totalPrice;

    // Phase 2: Before/After Proof
    @Column(name = "before_image_url")
    private String beforeImageUrl;

    @Column(name = "after_image_url")
    private String afterImageUrl;

    // Phase 2: Live Tracking & ETA
    @Column(name = "provider_lat")
    private Double providerLat;

    @Column(name = "provider_lng")
    private Double providerLng;

    @Column(name = "eta_minutes")
    private Integer etaMinutes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Service getService() {
        return service;
    }

    public void setService(Service service) {
        this.service = service;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDateTime bookingDate) {
        this.bookingDate = bookingDate;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getIsEmergency() {
        return isEmergency;
    }

    public void setIsEmergency(Boolean isEmergency) {
        this.isEmergency = isEmergency;
    }

    public String getProblemImageUrl() {
        return problemImageUrl;
    }

    public void setProblemImageUrl(String problemImageUrl) {
        this.problemImageUrl = problemImageUrl;
    }

    public Double getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(Double basePrice) {
        this.basePrice = basePrice;
    }

    public Double getPlatformFee() {
        return platformFee;
    }

    public void setPlatformFee(Double platformFee) {
        this.platformFee = platformFee;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getBeforeImageUrl() {
        return beforeImageUrl;
    }

    public void setBeforeImageUrl(String beforeImageUrl) {
        this.beforeImageUrl = beforeImageUrl;
    }

    public String getAfterImageUrl() {
        return afterImageUrl;
    }

    public void setAfterImageUrl(String afterImageUrl) {
        this.afterImageUrl = afterImageUrl;
    }

    public Double getProviderLat() {
        return providerLat;
    }

    public void setProviderLat(Double providerLat) {
        this.providerLat = providerLat;
    }

    public Double getProviderLng() {
        return providerLng;
    }

    public void setProviderLng(Double providerLng) {
        this.providerLng = providerLng;
    }

    public Integer getEtaMinutes() {
        return etaMinutes;
    }

    public void setEtaMinutes(Integer etaMinutes) {
        this.etaMinutes = etaMinutes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public enum BookingStatus {
        PENDING, PENDING_PAYMENT, CONFIRMED, COMPLETED, CANCELLED
    }
}
