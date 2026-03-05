package com.localservicefinder.service;

import com.localservicefinder.model.Booking;
import com.localservicefinder.model.Payment;
import com.localservicefinder.model.User;
import com.localservicefinder.repository.BookingRepository;
import com.localservicefinder.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class PaymentService {
    @Autowired
    PaymentRepository paymentRepository;

    @Autowired
    BookingRepository bookingRepository;

    @Autowired
    AuthService authService;

    @Autowired
    NotificationService notificationService;

    @Transactional
    public Payment processPayment(Long bookingId, String paymentMethod, String transactionId) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Verify user owns the booking
        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only pay for your own bookings");
        }

        // Check if payment already exists
        Optional<Payment> existingPayment = paymentRepository.findByBooking(booking);
        if (existingPayment.isPresent() && existingPayment.get().getStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new RuntimeException("Payment already completed for this booking");
        }

        Payment payment;
        if (existingPayment.isPresent()) {
            payment = existingPayment.get();
        } else {
            payment = new Payment();
            payment.setBooking(booking);
            payment.setAmount(booking.getService().getPrice());
        }

        payment.setPaymentMethod(paymentMethod);
        payment.setTransactionId(transactionId);
        payment.setStatus(Payment.PaymentStatus.COMPLETED);

        Payment savedPayment = paymentRepository.save(payment);

        // Create notification for service provider
        notificationService.createNotification(
                booking.getService().getProvider(),
                "Payment Received",
                "Payment received for booking #" + bookingId,
                com.localservicefinder.model.Notification.NotificationType.PAYMENT_RECEIVED,
                bookingId
        );

        return savedPayment;
    }

    public Optional<Payment> getPaymentByBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        // Verify user has access to this booking
        if (!booking.getUser().getId().equals(currentUser.getId()) &&
            !booking.getService().getProvider().getId().equals(currentUser.getId()) &&
            currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("You don't have permission to view this payment");
        }

        return paymentRepository.findByBooking(booking);
    }
}
