package com.nearnest.service;

import com.nearnest.dto.PaymentDto;
import com.nearnest.model.Booking;
import com.nearnest.model.Payment;
import com.nearnest.model.Transaction;
import com.nearnest.model.User;
import com.nearnest.repository.BookingRepository;
import com.nearnest.repository.PaymentRepository;
import com.nearnest.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
public class PaymentService {
    @Autowired
    PaymentRepository paymentRepository;

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    BookingRepository bookingRepository;

    @Autowired
    AuthService authService;

    @Autowired
    NotificationService notificationService;

    @Autowired
    private com.nearnest.config.RazorpayConfig razorpayConfig;

    private RazorpayClient razorpayClient;

    private RazorpayClient getRazorpayClient() throws RazorpayException {
        if (razorpayClient == null) {
            String id = razorpayConfig.getKeyId();
            String secret = razorpayConfig.getKeySecret();
            if (id == null || id.isEmpty() || secret == null || secret.isEmpty()) {
                throw new RuntimeException("Razorpay credentials not configured (RAZORPAY_KEY_ID/SECRET)");
            }
            razorpayClient = new RazorpayClient(id, secret);
        }
        return razorpayClient;
    }

    @Transactional
    public PaymentDto processPayment(@NonNull Long bookingId, @NonNull String paymentMethod, String transactionId) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        // Only ADMIN can manually process/override payments
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Permission denied. Only administrators can manually process payments.");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

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
            payment.setAmount(BigDecimal.valueOf(booking.getTotalPrice()));
        }

        payment.setPaymentMethod(paymentMethod);
        payment.setTransactionId(transactionId);
        payment.setStatus(Payment.PaymentStatus.COMPLETED);

        Payment savedPayment = paymentRepository.save(payment);

        // Notify both customer and provider
        User provider = booking.getService().getProvider();
        if (provider != null) {
            notificationService.createNotification(
                    provider,
                    "Payment Received",
                    "Payment received for booking #" + bookingId,
                    com.nearnest.model.Notification.NotificationType.PAYMENT_RECEIVED,
                    bookingId
            );
        }
        notificationService.createNotification(
                Objects.requireNonNull(booking.getUser()),
                "Payment Confirmed",
                "Your payment for booking #" + bookingId + " has been confirmed.",
                com.nearnest.model.Notification.NotificationType.PAYMENT_RECEIVED,
                bookingId
        );

        return PaymentDto.fromEntity(savedPayment);
    }

    public boolean isRazorpayConfigured() {
        return razorpayConfig.isConfigured();
    }

    @Transactional
    public Map<String, String> createRazorpayOrder(@NonNull Long bookingId) {
        // Graceful fallback: if Razorpay is not configured, inform the caller
        if (!isRazorpayConfigured()) {
            throw new RuntimeException("Online payment is currently unavailable. Please use 'Pay After Service' option.");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Optional<Payment> existingOpt = paymentRepository.findByBooking(booking);
        if (existingOpt.isPresent() && existingOpt.get().getStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new RuntimeException("Payment already completed for this booking");
        }

        try {
            RazorpayClient razorpay = getRazorpayClient();

            JSONObject orderRequest = new JSONObject();
            BigDecimal amount = BigDecimal.valueOf(booking.getTotalPrice());
            long amountInPaise = amount.multiply(new BigDecimal(100)).setScale(0, java.math.RoundingMode.HALF_UP).longValue();
            
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_" + bookingId);
            orderRequest.put("payment_capture", 1);

            Order order = razorpay.orders.create(orderRequest);
            String razorpayOrderId = order.get("id");

            Payment payment = existingOpt.orElse(new Payment());
            payment.setBooking(booking);
            payment.setAmount(amount);
            payment.setRazorpayOrderId(razorpayOrderId);
            payment.setStatus(Payment.PaymentStatus.PENDING);
            paymentRepository.save(payment);

            Map<String, String> response = new HashMap<>();
            response.put("orderId", razorpayOrderId);
            response.put("amount", String.valueOf(amountInPaise));
            response.put("currency", "INR");
            response.put("keyId", razorpayConfig.getKeyId());
            return response;

        } catch (RazorpayException e) {
            throw new RuntimeException("Error creating Razorpay order: " + e.getMessage());
        }
    }

    @Transactional
    public PaymentDto verifyRazorpayPayment(@NonNull String orderId, @NonNull String paymentId, @NonNull String signature) {
        try {
            // Verify signature using Razorpay Utils
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);

            boolean isValid = Utils.verifyPaymentSignature(attributes, razorpayConfig.getKeySecret());

            if (!isValid) {
                throw new RuntimeException("Invalid Razorpay signature. Payment verification failed.");
            }

            Payment payment = paymentRepository.findByRazorpayOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Payment record not found for Razorpay Order ID: " + orderId));

            if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
                return PaymentDto.fromEntity(payment); // Already completed
            }

            payment.setTransactionId(paymentId);
            payment.setRazorpaySignature(signature);
            payment.setStatus(Payment.PaymentStatus.COMPLETED);
            payment.setPaymentDate(LocalDateTime.now());
            paymentRepository.save(payment);

            Booking booking = payment.getBooking();
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            Transaction transaction = new Transaction();
            transaction.setProvider(booking.getService().getProvider());
            transaction.setPayment(payment);
            BigDecimal payoutAmount = payment.getAmount().multiply(new BigDecimal("0.85"));
            transaction.setAmount(payoutAmount);
            transaction.setPayoutStatus(Transaction.PayoutStatus.PENDING);
            transactionRepository.save(transaction);

            User provider = booking.getService().getProvider();
            if (provider != null) {
                notificationService.createNotification(
                        provider,
                        "New Order",
                        "You have a new paid order for " + booking.getService().getTitle(),
                        com.nearnest.model.Notification.NotificationType.BOOKING_CONFIRMED,
                        booking.getId()
                );
            }
            // Also notify the customer
            notificationService.createNotification(
                    Objects.requireNonNull(booking.getUser()),
                    "Payment Successful",
                    "Your payment of ₹" + payment.getAmount() + " for booking #" + booking.getId() + " was successful.",
                    com.nearnest.model.Notification.NotificationType.PAYMENT_RECEIVED,
                    booking.getId()
            );

            return PaymentDto.fromEntity(payment);

        } catch (RazorpayException e) {
            throw new RuntimeException("Error verifying Razorpay payment: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("An unexpected error occurred during verification: " + e.getMessage());
        }
    }

    public PaymentDto getPaymentByBooking(@NonNull Long bookingId) {
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

    @Transactional
    public com.nearnest.dto.TransactionDto simulatePayout(@NonNull Long transactionId) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        Transaction tx = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        tx.setPayoutStatus(Transaction.PayoutStatus.COMPLETED);
        tx.setProcessedAt(LocalDateTime.now());
        Transaction saved = transactionRepository.save(tx);
        
        User provider = tx.getProvider();
        if (provider == null) throw new RuntimeException("Provider not found for transaction");
        
        Long bookingId = (tx.getPayment() != null) ? tx.getPayment().getBooking().getId() : null;
        
        notificationService.createNotification(
                provider,
                "Payout Processed",
                "Your payout has been processed.",
                com.nearnest.model.Notification.NotificationType.PAYMENT_RECEIVED,
                bookingId
        );
        return com.nearnest.dto.TransactionDto.fromEntity(saved);
    }



    @Transactional
    public PaymentDto createOfflinePayment(@NonNull Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        Optional<Payment> existingOpt = paymentRepository.findByBooking(booking);
        if (existingOpt.isPresent() && existingOpt.get().getStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new RuntimeException("Payment already completed for this booking");
        }

        Payment payment = existingOpt.orElse(new Payment());
        payment.setBooking(booking);
        payment.setAmount(BigDecimal.valueOf(booking.getTotalPrice()));
        payment.setPaymentMethod("OFFLINE");
        payment.setStatus(Payment.PaymentStatus.PENDING);
        
        Payment saved = paymentRepository.save(payment);
        
        notificationService.createNotification(
                Objects.requireNonNull(booking.getService().getProvider()),
                "New Offline Booking",
                "New booking #" + bookingId + " with 'Pay After Service'. Please confirm payment after completion.",
                com.nearnest.model.Notification.NotificationType.BOOKING_CREATED,
                bookingId
        );

        return PaymentDto.fromEntity(saved);
    }

    @Transactional
    public PaymentDto confirmOfflinePayment(@NonNull Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment record not found"));
        
        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            return PaymentDto.fromEntity(payment);
        }

        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionId("OFFLINE_" + System.currentTimeMillis());
        
        Payment saved = paymentRepository.save(payment);
        
        // Mark booking as COMPLETED (provider confirmed cash received)
        Booking booking = saved.getBooking();
        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            booking.setStatus(Booking.BookingStatus.COMPLETED);
            bookingRepository.save(booking);
        }

        // Create Transaction for vendor payout (Platform fee calculation)
        Transaction transaction = new Transaction();
        transaction.setProvider(booking.getService().getProvider());
        transaction.setPayment(saved);
        // Deduct 15% platform fee
        BigDecimal payoutAmount = saved.getAmount().multiply(new BigDecimal("0.85"));
        transaction.setAmount(payoutAmount);
        transaction.setPayoutStatus(Transaction.PayoutStatus.PENDING);
        transaction.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(transaction);

        notificationService.createNotification(
                Objects.requireNonNull(booking.getUser()),
                "Payment Confirmed",
                "Your offline payment for booking #" + booking.getId() + " has been confirmed by the provider.",
                com.nearnest.model.Notification.NotificationType.PAYMENT_RECEIVED,
                booking.getId()
        );
        
        return PaymentDto.fromEntity(saved);
    }
}
