package com.nearnest.service;

import com.nearnest.model.Booking.BookingStatus;

import com.nearnest.dto.BookingDto;
import com.nearnest.dto.ProviderSummaryDto;
import com.nearnest.model.Booking;
import com.nearnest.model.User;
import com.nearnest.repository.BookingRepository;
import com.nearnest.repository.ServiceRepository;
import com.nearnest.repository.TransactionRepository;
import com.nearnest.model.Transaction;
import com.nearnest.dto.TransactionDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ProviderDashboardService {
    private final AuthService authService;
    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final NotificationService notificationService;
    private final MessageService messageService;
    private final TransactionRepository transactionRepository;

    public ProviderDashboardService(AuthService authService, BookingRepository bookingRepository,
                                    ServiceRepository serviceRepository,
                                    NotificationService notificationService, MessageService messageService,
                                    TransactionRepository transactionRepository) {
        this.authService = authService;
        this.bookingRepository = bookingRepository;
        this.serviceRepository = serviceRepository;
        this.notificationService = notificationService;
        this.messageService = messageService;
        this.transactionRepository = transactionRepository;
    }

    public ProviderSummaryDto getSummary() {
        User provider = authService.getCurrentUser();
        if (provider == null || (provider.getRole() != User.Role.PROVIDER && provider.getRole() != User.Role.ADMIN)) {
            throw new RuntimeException("Only providers can access provider dashboard");
        }
        Long providerId = provider.getId();

        ProviderSummaryDto dto = new ProviderSummaryDto();
        dto.setTotalServices((long) serviceRepository.findByProviderId(providerId).size());

        // Use DB-level count queries instead of loading full booking list into memory
        long pendingCount = bookingRepository.countByService_Provider_IdAndStatus(providerId, Booking.BookingStatus.PENDING)
                + bookingRepository.countByService_Provider_IdAndStatus(providerId, Booking.BookingStatus.PENDING_PAYMENT);
        long confirmedCount = bookingRepository.countByService_Provider_IdAndStatus(providerId, Booking.BookingStatus.CONFIRMED)
                + bookingRepository.countByService_Provider_IdAndStatus(providerId, Booking.BookingStatus.ACCEPTED);
        long completedCount = bookingRepository.countByService_Provider_IdAndStatus(providerId, Booking.BookingStatus.COMPLETED);
        long cancelledCount = bookingRepository.countByService_Provider_IdAndStatus(providerId, Booking.BookingStatus.CANCELLED);

        dto.setPendingBookings(pendingCount);
        dto.setConfirmedBookings(confirmedCount);
        dto.setCompletedBookings(completedCount);

        // Total Revenue (Provider's 85% share from all paid bookings)
        BigDecimal completedEarnings = transactionRepository.sumAmountByProviderIdAndPayoutStatus(providerId, Transaction.PayoutStatus.COMPLETED);
        BigDecimal pendingPayouts = transactionRepository.sumAmountByProviderIdAndPayoutStatus(providerId, Transaction.PayoutStatus.PENDING);
        
        BigDecimal totalShare = (completedEarnings != null ? completedEarnings : BigDecimal.ZERO)
                .add(pendingPayouts != null ? pendingPayouts : BigDecimal.ZERO);
        
        dto.setTotalRevenue(totalShare);

        // Pending Payments (specifically the amount awaiting payout)
        dto.setPendingPayments(pendingPayouts != null ? pendingPayouts.longValue() : 0L);

        dto.setUnreadNotifications(notificationService.getUnreadCount());
        dto.setUnreadMessages((long) messageService.getUnreadMessages().size());

        // Trust metrics
        dto.setTrustScore(provider.getTrustScore() != null ? provider.getTrustScore() : 100);

        // Completion rate calculation (Completed vs (Completed + Cancelled))
        long totalHistorical = completedCount + cancelledCount;
        dto.setCompletionRate(totalHistorical > 0 ? (double) completedCount / totalHistorical * 100 : 100.0);
        
        // Active bookings focus (Pending + Confirmed/Accepted/In Progress)
        long activeCount = bookingRepository.countByService_Provider_IdAndStatus(providerId, Booking.BookingStatus.ACCEPTED)
                + bookingRepository.countByService_Provider_IdAndStatus(providerId, Booking.BookingStatus.ARRIVED)
                + bookingRepository.countByService_Provider_IdAndStatus(providerId, Booking.BookingStatus.IN_PROGRESS);
        
        dto.setConfirmedBookings(activeCount); // Re-purposing this for "Active in field"
        dto.setPendingBookings(pendingCount);

        dto.setOnTimePerformance(95.0);
        long totalBookings = pendingCount + activeCount + completedCount + cancelledCount;
        dto.setCancellationRate(totalBookings > 0 ? (double) cancelledCount / totalBookings * 100 : 0.0);

        return dto;
    }

    public Page<BookingDto> getProviderBookings(BookingStatus status, Pageable pageable) {
        User provider = authService.getCurrentUser();
        if (provider == null || (provider.getRole() != User.Role.PROVIDER && provider.getRole() != User.Role.ADMIN)) {
            throw new RuntimeException("Only providers can access provider bookings");
        }
        
        if (status != null) {
            return bookingRepository.findByService_Provider_IdAndStatus(provider.getId(), status, pageable)
                    .map(BookingDto::fromEntity);
        }
        
        return bookingRepository.findByService_Provider_Id(provider.getId(), pageable)
                .map(BookingDto::fromEntity);
    }

    public Page<TransactionDto> getProviderTransactions(Pageable pageable) {
        User provider = authService.getCurrentUser();
        if (provider == null || (provider.getRole() != User.Role.PROVIDER && provider.getRole() != User.Role.ADMIN)) {
            throw new RuntimeException("Only providers can access provider transactions");
        }
        return transactionRepository.findByProviderId(provider.getId(), pageable)
                .map(TransactionDto::fromEntity);
    }
}
