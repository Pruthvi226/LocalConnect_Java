package com.nearnest.service;

import com.nearnest.dto.PaymentDto;
import com.nearnest.model.Booking;
import com.nearnest.model.Payment;
import com.nearnest.model.User;
import com.nearnest.repository.BookingRepository;
import com.nearnest.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
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

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    @Transactional
    public PaymentDto processPayment(Long bookingId, String paymentMethod, String transactionId) {
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
                com.nearnest.model.Notification.NotificationType.PAYMENT_RECEIVED,
                bookingId
        );

        return PaymentDto.fromEntity(savedPayment);
    }

    @Transactional
    public Map<String, String> createRazorpayOrder(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        try {
            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", booking.getService().getPrice().multiply(new BigDecimal(100)).intValue()); // amount in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_" + bookingId);

            Order order = razorpay.orders.create(orderRequest);
            String razorpayOrderId = order.get("id");

            Payment payment = paymentRepository.findByBooking(booking).orElse(new Payment());
            payment.setBooking(booking);
            payment.setAmount(booking.getService().getPrice());
            payment.setRazorpayOrderId(razorpayOrderId);
            payment.setStatus(Payment.PaymentStatus.PENDING);
            paymentRepository.save(payment);

            Map<String, String> response = new HashMap<>();
            response.put("orderId", razorpayOrderId);
            response.put("amount", order.get("amount").toString());
            response.put("keyId", keyId);
            return response;

        } catch (RazorpayException e) {
            throw new RuntimeException("Error creating Razorpay order: " + e.getMessage());
        }
    }

    @Transactional
    public PaymentDto verifyRazorpayPayment(String orderId, String paymentId, String signature) {
        try {
            boolean isValid = Utils.verifyPaymentSignature(new JSONObject()
                    .put("razorpay_order_id", orderId)
                    .put("razorpay_payment_id", paymentId)
                    .put("razorpay_signature", signature), keySecret);

            if (!isValid) {
                throw new RuntimeException("Invalid Razorpay signature");
            }

            Payment payment = paymentRepository.findByRazorpayOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Payment record not found for order: " + orderId));

            payment.setTransactionId(paymentId);
            payment.setRazorpaySignature(signature);
            payment.setStatus(Payment.PaymentStatus.COMPLETED);
            payment.setPaymentDate(LocalDateTime.now());
            paymentRepository.save(payment);

            Booking booking = payment.getBooking();
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            notificationService.createNotification(
                    booking.getService().getProvider(),
                    "Payment Received",
                    "Payment received for booking #" + booking.getId(),
                    com.nearnest.model.Notification.NotificationType.PAYMENT_RECEIVED,
                    booking.getId()
            );

            return PaymentDto.fromEntity(payment);

        } catch (RazorpayException e) {
            throw new RuntimeException("Error verifying Razorpay payment: " + e.getMessage());
        }
    }

    public PaymentDto getPaymentByBooking(Long bookingId) {
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

        return paymentRepository.findByBooking(booking)
                .map(PaymentDto::fromEntity)
                .orElseThrow(() -> new RuntimeException("Payment not found for this booking"));
    }
}
