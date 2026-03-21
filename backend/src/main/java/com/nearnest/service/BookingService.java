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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class BookingService {
    @Autowired
    BookingRepository bookingRepository;

    @Autowired
    ServiceRepository serviceRepository;

    @Autowired
    AuthService authService;

    @Autowired
    EmailService emailService;

    @Autowired
    NotificationService notificationService;

    public List<BookingDto> getUserBookings() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }
        return bookingRepository.findByUserId(currentUser.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public Page<BookingDto> getUserBookingsPaginated(Pageable pageable) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }
        return bookingRepository.findByUserId(currentUser.getId(), pageable).map(this::convertToDto);
    }

    public Page<BookingDto> getAllBookings(Pageable pageable) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null || currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only admins can view all bookings");
        }
        return bookingRepository.findAll(pageable).map(this::convertToDto);
    }

    @Transactional
    public BookingDto createBooking(Long serviceId, LocalDateTime bookingDate, String notes, Boolean isEmergency, String problemImageUrl) {
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
        booking.setStatus(BookingStatus.PENDING_PAYMENT);
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

        // Notify provider (realtime via NotificationService)
        notificationService.createNotification(
                service.getProvider(),
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
        return updateBooking(id, status, notes, null, null, null, null, null);
    }

    @Transactional
    public BookingDto updateBooking(Long id, BookingStatus status, String notes, 
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
        if (status != null) {
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
            if (saved.getStatus() == BookingStatus.CONFIRMED) {
                notificationService.createNotification(customer, "Booking Confirmed",
                        "Your booking #" + saved.getId() + " has been confirmed.",
                        Notification.NotificationType.BOOKING_CONFIRMED, saved.getId());
            } else if (saved.getStatus() == BookingStatus.COMPLETED) {
                notificationService.createNotification(customer, "Booking Completed",
                        "Booking #" + saved.getId() + " has been marked completed.",
                        Notification.NotificationType.BOOKING_COMPLETED, saved.getId());
            } else if (saved.getStatus() == BookingStatus.CANCELLED) {
                User toNotify = currentUser.getId().equals(provider.getId()) ? customer : provider;
                notificationService.createNotification(toNotify, "Booking Cancelled",
                        "Booking #" + saved.getId() + " has been cancelled.",
                        Notification.NotificationType.BOOKING_CANCELLED, saved.getId());
            }
        }

        return convertToDto(saved);
    }

    @Transactional
    public void cancelBooking(Long id) {
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

        // Notify provider
        notificationService.createNotification(
                booking.getService().getProvider(),
                "Booking Cancelled",
                "Booking #" + booking.getId() + " was cancelled by the customer.",
                Notification.NotificationType.BOOKING_CANCELLED,
                booking.getId()
        );
    }

    public Optional<BookingDto> getBookingById(Long id) {
        return bookingRepository.findById(id).map(this::convertToDto);
    }

    public BookingDto convertToDto(Booking b) {
        return BookingDto.fromEntity(b);
    }
}
