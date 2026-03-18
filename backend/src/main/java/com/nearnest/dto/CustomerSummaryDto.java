package com.nearnest.dto;

public class CustomerSummaryDto {
    private Long totalBookings;
    private Long pendingBookings;
    private Long favoritesCount;
    private Long unreadNotifications;
    private Long unreadMessages;

    // Getters and Setters
    public Long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(Long totalBookings) { this.totalBookings = totalBookings; }
    public Long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(Long pendingBookings) { this.pendingBookings = pendingBookings; }
    public Long getFavoritesCount() { return favoritesCount; }
    public void setFavoritesCount(Long favoritesCount) { this.favoritesCount = favoritesCount; }
    public Long getUnreadNotifications() { return unreadNotifications; }
    public void setUnreadNotifications(Long unreadNotifications) { this.unreadNotifications = unreadNotifications; }
    public Long getUnreadMessages() { return unreadMessages; }
    public void setUnreadMessages(Long unreadMessages) { this.unreadMessages = unreadMessages; }
}
