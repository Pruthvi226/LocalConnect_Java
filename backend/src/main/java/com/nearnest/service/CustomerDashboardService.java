package com.nearnest.service;

import com.nearnest.dto.BookingDto;
import com.nearnest.dto.CustomerSummaryDto;
import com.nearnest.model.Booking.BookingStatus;
import com.nearnest.model.User;
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

        List<BookingDto> bookings = bookingService.getUserBookings();
        long pending = bookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING).count();

        CustomerSummaryDto dto = new CustomerSummaryDto();
        dto.setTotalBookings((long) bookings.size());
        dto.setPendingBookings(pending);
        dto.setFavoritesCount((long) favoriteService.getUserFavorites().size());
        dto.setUnreadMessages((long) messageService.getUnreadMessages().size());
        dto.setUnreadNotifications(notificationService.getUnreadCount());
        return dto;
    }

    public List<BookingDto> getCustomerBookings() {
        return bookingService.getUserBookings();
    }
}
