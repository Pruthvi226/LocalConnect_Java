package com.localservicefinder.dto;

public class CustomerSummaryDto {
    private long totalBookings;
    private long pendingBookings;
    private long favoritesCount;
    private long unreadMessages;
    private long unreadNotifications;

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }
    public long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(long pendingBookings) { this.pendingBookings = pendingBookings; }
    public long getFavoritesCount() { return favoritesCount; }
    public void setFavoritesCount(long favoritesCount) { this.favoritesCount = favoritesCount; }
    public long getUnreadMessages() { return unreadMessages; }
    public void setUnreadMessages(long unreadMessages) { this.unreadMessages = unreadMessages; }
    public long getUnreadNotifications() { return unreadNotifications; }
    public void setUnreadNotifications(long unreadNotifications) { this.unreadNotifications = unreadNotifications; }
}
