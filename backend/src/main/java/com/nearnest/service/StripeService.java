package com.nearnest.service;

import com.nearnest.model.Booking;
import com.nearnest.model.Payment;
import com.nearnest.repository.BookingRepository;
import com.nearnest.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Optional;

@Service
public class StripeService {
    @Value("${stripe.secret-key:}")
    private String secretKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final AuthService authService;
    private final NotificationService notificationService;

    public StripeService(PaymentRepository paymentRepository, BookingRepository bookingRepository,
                         AuthService authService, NotificationService notificationService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.authService = authService;
        this.notificationService = notificationService;
    }

    @PostConstruct
    public void init() {
        if (secretKey != null && !secretKey.isBlank()) {
            Stripe.apiKey = secretKey;
        }
    }

    public boolean isConfigured() {
        return secretKey != null && !secretKey.isBlank();
    }

    public StripeIntentResponse createPaymentIntent(@NonNull Long bookingId) {
        if (!isConfigured()) throw new RuntimeException("Stripe is not configured");
        com.nearnest.model.User currentUser = authService.getCurrentUser();
        if (currentUser == null) throw new RuntimeException("Not authenticated");

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only pay for your own bookings");
        }

        Optional<Payment> existing = paymentRepository.findByBooking(booking);
        if (existing.isPresent() && existing.get().getStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new RuntimeException("Payment already completed for this booking");
        }

        long amountCents = booking.getService().getPrice().multiply(java.math.BigDecimal.valueOf(100)).longValue();
        if (amountCents < 50) amountCents = 50; // Stripe minimum

        Payment payment = createOrGetPaymentForStripe(booking);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency("usd")
                .putMetadata("bookingId", bookingId.toString())
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .build();

        try {
            PaymentIntent intent = PaymentIntent.create(params);
            payment.setTransactionId(intent.getId());
            paymentRepository.save(payment);
            return new StripeIntentResponse(intent.getClientSecret(), intent.getId());
        } catch (Exception e) {
            throw new RuntimeException("Failed to create PaymentIntent", e);
        }
    }

    public Payment createOrGetPaymentForStripe(@NonNull Booking booking) {
        Optional<Payment> existing = paymentRepository.findByBooking(booking);
        if (existing.isPresent()) return existing.get();
        Payment p = new Payment();
        p.setBooking(booking);
        p.setAmount(booking.getService().getPrice());
        p.setPaymentMethod("STRIPE");
        p.setStatus(Payment.PaymentStatus.PENDING);
        return paymentRepository.save(p);
    }

    public static class StripeIntentResponse {
        private final String clientSecret;
        private final String paymentIntentId;

        public StripeIntentResponse(String clientSecret, String paymentIntentId) {
            this.clientSecret = clientSecret;
            this.paymentIntentId = paymentIntentId;
        }
        public String getClientSecret() { return clientSecret; }
        public String getPaymentIntentId() { return paymentIntentId; }
    }

    public void handleWebhook(@NonNull String payload, @NonNull String signature) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new RuntimeException("Stripe webhook secret not configured");
        }
        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (SignatureVerificationException e) {
            throw new RuntimeException("Invalid Stripe signature", e);
        }
        if ("payment_intent.succeeded".equals(event.getType())) {
            PaymentIntent pi = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
            if (pi != null) {
                String paymentIntentId = pi.getId();
                List<Payment> payments = paymentRepository.findByTransactionId(paymentIntentId);
                if (!payments.isEmpty()) {
                    Payment payment = payments.get(0);
                    payment.setStatus(Payment.PaymentStatus.COMPLETED);
                    paymentRepository.save(payment);

                    // Confirm Booking
                    Booking booking = payment.getBooking();
                    booking.setStatus(Booking.BookingStatus.CONFIRMED);
                    bookingRepository.save(booking);

                    com.nearnest.model.User provider = payment.getBooking().getService().getProvider();
                    if (provider == null) throw new RuntimeException("Provider not found for booking");
                    notificationService.createNotification(
                            provider,
                            "Payment Received",
                            "Payment received for booking #" + payment.getBooking().getId(),
                            com.nearnest.model.Notification.NotificationType.PAYMENT_RECEIVED,
                            payment.getBooking().getId()
                    );
                }
            }
        }
    }
}
