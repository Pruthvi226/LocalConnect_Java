package com.localservicefinder.service;

import com.localservicefinder.dto.ProviderSummaryDto;
import com.localservicefinder.model.Booking;
import com.localservicefinder.model.User;
import com.localservicefinder.repository.BookingRepository;
import com.localservicefinder.repository.PaymentRepository;
import com.localservicefinder.repository.ServiceRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProviderDashboardService {
    private final AuthService authService;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ServiceRepository serviceRepository;
    private final NotificationService notificationService;
    private final MessageService messageService;

    public ProviderDashboardService(AuthService authService, BookingRepository bookingRepository,
                                    PaymentRepository paymentRepository, ServiceRepository serviceRepository,
                                    NotificationService notificationService, MessageService messageService) {
        this.authService = authService;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.serviceRepository = serviceRepository;
        this.notificationService = notificationService;
        this.messageService = messageService;
    }

    public ProviderSummaryDto getSummary() {
        User provider = authService.getCurrentUser();
        if (provider == null || (provider.getRole() != User.Role.PROVIDER && provider.getRole() != User.Role.ADMIN)) {
            throw new RuntimeException("Only providers can access provider dashboard");
        }
        Long providerId = provider.getId();

        ProviderSummaryDto dto = new ProviderSummaryDto();
        dto.setTotalServices(serviceRepository.findByProviderId(providerId).size());
        List<Booking> providerBookings = bookingRepository.findByService_Provider_Id(providerId);
        dto.setPendingBookings(providerBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.PENDING).count());
        dto.setConfirmedBookings(providerBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED).count());
        dto.setCompletedBookings(providerBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED).count());
        BigDecimal revenue = paymentRepository.sumCompletedAmountByProviderId(providerId);
        dto.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);
        dto.setUnreadNotifications(notificationService.getUnreadCount());
        dto.setUnreadMessages(messageService.getUnreadMessages().size());
        return dto;
    }

    public List<Booking> getProviderBookings() {
        User provider = authService.getCurrentUser();
        if (provider == null || (provider.getRole() != User.Role.PROVIDER && provider.getRole() != User.Role.ADMIN)) {
            throw new RuntimeException("Only providers can access provider bookings");
        }
        return bookingRepository.findByService_Provider_Id(provider.getId());
    }
}
