package com.nearnest.dto;

import java.math.BigDecimal;

public class ProviderSummaryDto {
    private Long totalServices;
    private Long pendingBookings;
    private Long confirmedBookings;
    private Long completedBookings;
    private BigDecimal totalRevenue;
    private Long unreadNotifications;
    private Long unreadMessages;
    
    // AI Trust Metrics
    private Integer trustScore;
    private Double completionRate;
    private Double onTimePerformance;
    private Double cancellationRate;

    // Getters and Setters
    public Long getTotalServices() { return totalServices; }
    public void setTotalServices(Long totalServices) { this.totalServices = totalServices; }
    public Long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(Long pendingBookings) { this.pendingBookings = pendingBookings; }
    public Long getConfirmedBookings() { return confirmedBookings; }
    public void setConfirmedBookings(Long confirmedBookings) { this.confirmedBookings = confirmedBookings; }
    public Long getCompletedBookings() { return completedBookings; }
    public void setCompletedBookings(Long completedBookings) { this.completedBookings = completedBookings; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public Long getUnreadNotifications() { return unreadNotifications; }
    public void setUnreadNotifications(Long unreadNotifications) { this.unreadNotifications = unreadNotifications; }
    public Long getUnreadMessages() { return unreadMessages; }
    public void setUnreadMessages(Long unreadMessages) { this.unreadMessages = unreadMessages; }

    public Integer getTrustScore() { return trustScore; }
    public void setTrustScore(Integer trustScore) { this.trustScore = trustScore; }
    public Double getCompletionRate() { return completionRate; }
    public void setCompletionRate(Double completionRate) { this.completionRate = completionRate; }
    public Double getOnTimePerformance() { return onTimePerformance; }
    public void setOnTimePerformance(Double onTimePerformance) { this.onTimePerformance = onTimePerformance; }
    public Double getCancellationRate() { return cancellationRate; }
    public void setCancellationRate(Double cancellationRate) { this.cancellationRate = cancellationRate; }
}
