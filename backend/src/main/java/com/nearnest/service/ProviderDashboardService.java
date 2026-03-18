package com.nearnest.service;

import com.nearnest.dto.BookingDto;
import com.nearnest.dto.ProviderSummaryDto;
import com.nearnest.model.Booking;
import com.nearnest.model.User;
import com.nearnest.repository.BookingRepository;
import com.nearnest.repository.PaymentRepository;
import com.nearnest.repository.ServiceRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

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
        dto.setTotalServices((long) serviceRepository.findByProviderId(providerId).size());
        List<Booking> providerBookings = bookingRepository.findByService_Provider_Id(providerId);
        dto.setPendingBookings(providerBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.PENDING).count());
        dto.setConfirmedBookings(providerBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED).count());
        dto.setCompletedBookings(providerBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED).count());
        BigDecimal revenue = paymentRepository.sumCompletedAmountByProviderId(providerId);
        dto.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);
        dto.setUnreadNotifications(notificationService.getUnreadCount());
        dto.setUnreadMessages((long) messageService.getUnreadMessages().size());
        return dto;
    }

    public List<BookingDto> getProviderBookings() {
        User provider = authService.getCurrentUser();
        if (provider == null || (provider.getRole() != User.Role.PROVIDER && provider.getRole() != User.Role.ADMIN)) {
            throw new RuntimeException("Only providers can access provider bookings");
        }
        return bookingRepository.findByService_Provider_Id(provider.getId()).stream()
                .map(BookingDto::fromEntity)
                .collect(Collectors.toList());
    }
}
