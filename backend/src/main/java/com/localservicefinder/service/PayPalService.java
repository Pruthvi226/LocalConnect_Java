package com.localservicefinder.service;

import com.localservicefinder.model.Booking;
import com.localservicefinder.model.Payment;
import com.localservicefinder.model.User;
import com.localservicefinder.repository.BookingRepository;
import com.localservicefinder.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

@Service
public class PayPalService {
    @Value("${paypal.client-id:}")
    private String clientId;

    @Value("${paypal.client-secret:}")
    private String clientSecret;

    @Value("${paypal.mode:sandbox}")
    private String mode;

    private static final String SANDBOX_URL = "https://api-m.sandbox.paypal.com";
    private static final String LIVE_URL = "https://api-m.paypal.com";

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final AuthService authService;
    private final NotificationService notificationService;
    private final RestTemplate restTemplate = new RestTemplate();

    public PayPalService(PaymentRepository paymentRepository, BookingRepository bookingRepository,
                         AuthService authService, NotificationService notificationService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.authService = authService;
        this.notificationService = notificationService;
    }

    public boolean isConfigured() {
        return clientId != null && !clientId.isBlank() && clientSecret != null && !clientSecret.isBlank();
    }

    private String baseUrl() {
        return "sandbox".equalsIgnoreCase(mode) ? SANDBOX_URL : LIVE_URL;
    }

    @SuppressWarnings("unchecked")
    private String getAccessToken() {
        String auth = Base64.getEncoder().encodeToString((clientId + ":" + clientSecret).getBytes());
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + auth);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<String> req = new HttpEntity<>("grant_type=client_credentials", headers);
        ResponseEntity<Map> res = restTemplate.exchange(baseUrl() + "/v1/oauth2/token", HttpMethod.POST, req, Map.class);
        return (String) res.getBody().get("access_token");
    }

    @SuppressWarnings("unchecked")
    public PayPalOrderResponse createOrder(Long bookingId) {
        if (!isConfigured()) throw new RuntimeException("PayPal is not configured");
        User currentUser = authService.getCurrentUser();
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

        BigDecimal amountVal = booking.getService().getPrice();
        if (amountVal.compareTo(BigDecimal.ZERO) <= 0) amountVal = BigDecimal.ONE;
        final BigDecimal amount = amountVal;

        Payment payment = paymentRepository.findByBooking(booking).orElseGet(() -> {
            Payment p = new Payment();
            p.setBooking(booking);
            p.setAmount(amount);
            p.setPaymentMethod("PAYPAL");
            p.setStatus(Payment.PaymentStatus.PENDING);
            return paymentRepository.save(p);
        });
        payment.setPaymentMethod("PAYPAL");
        paymentRepository.save(payment);

        String token = getAccessToken();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("intent", "CAPTURE");
        List<Map<String, Object>> units = new ArrayList<>();
        Map<String, Object> unit = new HashMap<>();
        Map<String, Object> amt = new HashMap<>();
        amt.put("currency_code", "USD");
        amt.put("value", amount.setScale(2, java.math.RoundingMode.HALF_UP).toString());
        unit.put("amount", amt);
        unit.put("reference_id", "booking_" + bookingId);
        units.add(unit);
        body.put("purchase_units", units);

        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
        ResponseEntity<Map> res = restTemplate.exchange(baseUrl() + "/v2/checkout/orders", HttpMethod.POST, req, Map.class);
        Map<String, Object> resBody = res.getBody();
        String orderId = (String) resBody.get("id");
        payment.setTransactionId(orderId);
        paymentRepository.save(payment);

        List<Map<String, Object>> links = (List<Map<String, Object>>) resBody.get("links");
        String approveUrl = null;
        if (links != null) {
            for (Map<String, Object> link : links) {
                if ("approve".equals(link.get("rel"))) {
                    approveUrl = (String) link.get("href");
                    break;
                }
            }
        }
        return new PayPalOrderResponse(orderId, approveUrl);
    }

    @SuppressWarnings("unchecked")
    public Payment captureOrder(String orderId) {
        if (!isConfigured()) throw new RuntimeException("PayPal is not configured");
        List<Payment> payments = paymentRepository.findByTransactionId(orderId);
        if (payments.isEmpty()) throw new RuntimeException("Order not found");

        String token = getAccessToken();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> req = new HttpEntity<>(headers);
        ResponseEntity<Map> res = restTemplate.exchange(baseUrl() + "/v2/checkout/orders/" + orderId + "/capture", HttpMethod.POST, req, Map.class);
        Map<String, Object> resBody = res.getBody();
        String status = (String) resBody.get("status");
        if (!"COMPLETED".equals(status)) {
            throw new RuntimeException("PayPal capture failed: " + status);
        }

        Payment payment = payments.get(0);
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        paymentRepository.save(payment);

        notificationService.createNotification(
                payment.getBooking().getService().getProvider(),
                "Payment Received",
                "Payment received for booking #" + payment.getBooking().getId(),
                com.localservicefinder.model.Notification.NotificationType.PAYMENT_RECEIVED,
                payment.getBooking().getId()
        );
        return payment;
    }

    public static class PayPalOrderResponse {
        private final String orderId;
        private final String approveUrl;

        public PayPalOrderResponse(String orderId, String approveUrl) {
            this.orderId = orderId;
            this.approveUrl = approveUrl;
        }
        public String getOrderId() { return orderId; }
        public String getApproveUrl() { return approveUrl; }
    }
}
