package com.nearnest.service;

import com.nearnest.dto.BookingDto;
import com.nearnest.model.Booking;
import com.nearnest.model.Booking.BookingStatus;
import com.nearnest.model.Notification;
import com.nearnest.model.Service;
import com.nearnest.model.User;
import com.nearnest.repository.BookingRepository;
import com.nearnest.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import com.nearnest.model.Payment;
import com.nearnest.repository.PaymentRepository;
import java.math.BigDecimal;

@org.springframework.stereotype.Service
public class BookingService {
    @Autowired
    BookingRepository bookingRepository;

    @Autowired
    PaymentRepository paymentRepository;

    @Autowired
    ServiceRepository serviceRepository;

    @Autowired
    AuthService authService;

    @Autowired
    EmailService emailService;

    @Autowired
    NotificationService notificationService;

    @Autowired
    UserService userService;

    public List<BookingDto> getUserBookings() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }
        return bookingRepository.findByUserId(currentUser.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public Page<BookingDto> getUserBookingsPaginated(@NonNull Pageable pageable) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }
        return bookingRepository.findByUserId(currentUser.getId(), pageable).map(this::convertToDto);
    }

    public Page<BookingDto> getAllBookings(@NonNull Pageable pageable) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null || currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only admins can view all bookings");
        }
        return bookingRepository.findAll(pageable).map(this::convertToDto);
    }

    @Transactional
    public BookingDto createBooking(@NonNull Long serviceId, LocalDateTime bookingDate, String notes, Boolean isEmergency, String problemImageUrl, String paymentMethod) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        if (!Boolean.TRUE.equals(service.getIsAvailable())) {
            throw new RuntimeException("Service is not available");
        }

        // Check for conflicting bookings (within 1 hour window)
        LocalDateTime startTime = bookingDate.minusHours(1);
        LocalDateTime endTime = bookingDate.plusHours(1);
        List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
                serviceId, startTime, endTime);

        if (!conflictingBookings.isEmpty()) {
            throw new RuntimeException("This time slot is already booked");
        }

        Booking booking = new Booking();
        booking.setUser(currentUser);
        booking.setService(service);
        booking.setBookingDate(bookingDate);
        
        // If OFFLINE, confirm immediately as per user requirement
        if ("OFFLINE".equalsIgnoreCase(paymentMethod)) {
            booking.setStatus(BookingStatus.CONFIRMED);
        } else {
            booking.setStatus(BookingStatus.PENDING_PAYMENT);
        }

        booking.setNotes(notes);
        booking.setIsEmergency(isEmergency != null ? isEmergency : false);
        booking.setProblemImageUrl(problemImageUrl);

        // Snapshot pricing with Dynamic Surge
        Double basePrice = service.getPrice().doubleValue();
        if (Boolean.TRUE.equals(isEmergency)) {
            basePrice = basePrice * 1.5; // 50% Emergency Surge
            // Round to 2 decimal places
            basePrice = Math.round(basePrice * 100.0) / 100.0;
        }
        Double platformFee = service.getPlatformFee() != null ? service.getPlatformFee() : 50.0;
        booking.setBasePrice(basePrice);
        booking.setPlatformFee(platformFee);
        booking.setTotalPrice(Math.round((basePrice + platformFee) * 100.0) / 100.0);

        Booking savedBooking = bookingRepository.save(booking);

        // Create initial payment record ONLY for ONLINE bookings.
        // OFFLINE bookings: payment is created when provider confirms cash via /payments/offline/confirm
        if (!"OFFLINE".equalsIgnoreCase(paymentMethod)) {
            Payment payment = new Payment();
            payment.setBooking(savedBooking);
            payment.setAmount(BigDecimal.valueOf(savedBooking.getTotalPrice()));
            payment.setPaymentMethod(paymentMethod != null ? paymentMethod.toUpperCase() : "ONLINE");
            payment.setStatus(Payment.PaymentStatus.PENDING);
            paymentRepository.save(payment);
        }

        // Notify provider (realtime via NotificationService)
        notificationService.createNotification(
                Objects.requireNonNull(service.getProvider()),
                "New Booking",
                "New booking #" + savedBooking.getId() + " for " + service.getTitle(),
                Notification.NotificationType.BOOKING_CREATED,
                savedBooking.getId()
        );

        // Send email notification
        try {
            emailService.sendBookingConfirmation(currentUser.getEmail(), savedBooking);
        } catch (Exception e) {
            // Log error but don't fail the booking
            System.err.println("Failed to send email: " + e.getMessage());
        }

        return convertToDto(savedBooking);
    }

    @Transactional
    public BookingDto updateBooking(Long id, BookingStatus status, String notes) {
        return updateBooking(Objects.requireNonNull(id), status, notes, null, null, null, null, null);
    }

    @Transactional
    public BookingDto updateBooking(@NonNull Long id, BookingStatus status, String notes, 
                                    String beforeImageUrl, String afterImageUrl,
                                    Double providerLat, Double providerLng, Integer etaMinutes) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        // Users can only update their own bookings, providers can update bookings for their services
        boolean canUpdate = currentUser.getId().equals(booking.getUser().getId()) ||
                           currentUser.getId().equals(booking.getService().getProvider().getId()) ||
                           currentUser.getRole() == User.Role.ADMIN;

        if (!canUpdate) {
            throw new RuntimeException("You don't have permission to update this booking");
        }

        BookingStatus oldStatus = booking.getStatus();
        
        // Prevent updates if already completed or cancelled (except for specific overrides)
        if ((oldStatus == BookingStatus.COMPLETED || oldStatus == BookingStatus.CANCELLED) && currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Cannot update a booking that is already " + oldStatus);
        }

        if (status != null && status != oldStatus) {
            // Validate transition logic
            validateStatusTransition(oldStatus, status, currentUser.getRole());
            booking.setStatus(status);
        }
        if (notes != null) {
            booking.setNotes(notes);
        }
        if (beforeImageUrl != null) {
            booking.setBeforeImageUrl(beforeImageUrl);
        }
        if (afterImageUrl != null) {
            booking.setAfterImageUrl(afterImageUrl);
        }
        if (providerLat != null) {
            booking.setProviderLat(providerLat);
        }
        if (providerLng != null) {
            booking.setProviderLng(providerLng);
        }
        if (etaMinutes != null) {
            booking.setEtaMinutes(etaMinutes);
        }

        Booking saved = bookingRepository.save(booking);

        // Booking lifecycle notifications (realtime via NotificationService)
        if (oldStatus != saved.getStatus()) {
            User customer = booking.getUser();
            User provider = booking.getService().getProvider();
            
            String title = "Booking Status Updated";
            String message = "Your booking #" + saved.getId() + " status is now " + saved.getStatus();
            Notification.NotificationType type = Notification.NotificationType.BOOKING_UPDATED;

            if (saved.getStatus() == BookingStatus.CONFIRMED) {
                title = "Booking Confirmed";
                message = "Your booking #" + saved.getId() + " has been confirmed.";
                type = Notification.NotificationType.BOOKING_CONFIRMED;
            } else if (saved.getStatus() == BookingStatus.ACCEPTED) {
                title = "Booking Accepted";
                message = "Provider has accepted your booking #" + saved.getId() + ".";
                type = Notification.NotificationType.BOOKING_ACCEPTED;
            } else if (saved.getStatus() == BookingStatus.ARRIVED) {
                title = "Provider Arrived";
                message = "The provider has arrived for your booking #" + saved.getId() + ".";
                type = Notification.NotificationType.PROVIDER_ARRIVED;
            } else if (saved.getStatus() == BookingStatus.IN_PROGRESS) {
                title = "Service Started";
                message = "The service for booking #" + saved.getId() + " has started.";
                type = Notification.NotificationType.SERVICE_STARTED;
            } else if (saved.getStatus() == BookingStatus.COMPLETED) {
                title = "Booking Completed";
                message = "Booking #" + saved.getId() + " has been marked completed.";
                type = Notification.NotificationType.BOOKING_COMPLETED;
                userService.recalculateTrustScore(Objects.requireNonNull(Objects.requireNonNull(provider).getId()));
                
                // If it was a paid booking, we might want more logic here
                // For now, let's keep it simple
            } else if (saved.getStatus() == BookingStatus.CANCELLED) {
                User toNotify = currentUser.getId().equals(provider.getId()) ? customer : provider;
                title = "Booking Cancelled";
                message = "Booking #" + saved.getId() + " has been cancelled.";
                type = Notification.NotificationType.BOOKING_CANCELLED;
                userService.recalculateTrustScore(Objects.requireNonNull(Objects.requireNonNull(provider).getId()));
                notificationService.createNotification(Objects.requireNonNull(toNotify), title, message, type, saved.getId());
                return convertToDto(saved); // Early return for cancelled
            }
            
            notificationService.createNotification(Objects.requireNonNull(customer), title, message, type, saved.getId());
        }

        return convertToDto(saved);
    }

    @Transactional
    public void cancelBooking(@NonNull Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        if (!currentUser.getId().equals(booking.getUser().getId()) && 
            currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("You don't have permission to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        notificationService.createNotification(
                Objects.requireNonNull(booking.getService().getProvider()),
                "Booking Cancelled",
                "Booking #" + booking.getId() + " was cancelled by the customer.",
                Notification.NotificationType.BOOKING_CANCELLED,
                booking.getId()
        );

        userService.recalculateTrustScore(Objects.requireNonNull(Objects.requireNonNull(booking.getService().getProvider()).getId()));
    }

    public Optional<BookingDto> getBookingById(@NonNull Long id) {
        return bookingRepository.findById(id).map(this::convertToDto);
    }

    public Optional<Booking> getBookingEntityById(@NonNull Long id) {
        return bookingRepository.findById(id);
    }

    private void validateStatusTransition(BookingStatus oldStatus, BookingStatus newStatus, User.Role userRole) {
        if (newStatus == BookingStatus.CANCELLED) return; // Cancellations allowed from anywhere usually
        if (userRole == User.Role.ADMIN) return; // Admins can override

        boolean valid = false;
        switch (oldStatus) {
            case PENDING:
            case PENDING_PAYMENT:
            case CONFIRMED:
                if (newStatus == BookingStatus.ACCEPTED) valid = true;
                break;
            case ACCEPTED:
                if (newStatus == BookingStatus.ARRIVED) valid = true;
                break;
            case ARRIVED:
                if (newStatus == BookingStatus.IN_PROGRESS) valid = true;
                break;
            case IN_PROGRESS:
                if (newStatus == BookingStatus.COMPLETED || newStatus == BookingStatus.REVIEW_PENDING) valid = true;
                break;
            default:
                break;
        }

        if (!valid) {
            throw new RuntimeException("Invalid status transition from " + oldStatus + " to " + newStatus);
        }
    }

    public BookingDto convertToDto(Booking b) {
        return BookingDto.fromEntity(b);
    }
}
