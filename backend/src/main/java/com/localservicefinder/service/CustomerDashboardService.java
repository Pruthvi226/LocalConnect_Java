package com.localservicefinder.service;

import com.localservicefinder.dto.CustomerSummaryDto;
import com.localservicefinder.model.Booking;
import com.localservicefinder.model.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerDashboardService {
    private final AuthService authService;
    private final BookingService bookingService;
    private final FavoriteService favoriteService;
    private final NotificationService notificationService;
    private final MessageService messageService;

    public CustomerDashboardService(AuthService authService, BookingService bookingService,
                                    FavoriteService favoriteService, NotificationService notificationService,
                                    MessageService messageService) {
        this.authService = authService;
        this.bookingService = bookingService;
        this.favoriteService = favoriteService;
        this.notificationService = notificationService;
        this.messageService = messageService;
    }

    public CustomerSummaryDto getSummary() {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("Not authenticated");
        }

        List<Booking> bookings = bookingService.getUserBookings();
        long pending = bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.PENDING).count();

        CustomerSummaryDto dto = new CustomerSummaryDto();
        dto.setTotalBookings(bookings.size());
        dto.setPendingBookings(pending);
        dto.setFavoritesCount(favoriteService.getUserFavorites().size());
        dto.setUnreadMessages(messageService.getUnreadMessages().size());
        dto.setUnreadNotifications(notificationService.getUnreadCount());
        return dto;
    }
}
