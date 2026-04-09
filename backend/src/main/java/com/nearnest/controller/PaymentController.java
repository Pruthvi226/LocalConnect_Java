package com.nearnest.controller;

import com.nearnest.dto.PaymentDto;
import com.nearnest.service.PaymentService;
import com.nearnest.service.StripeService;
import com.nearnest.service.PayPalService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class PaymentController {
    private final PaymentService paymentService;
    private final StripeService stripeService;
    private final PayPalService payPalService;

    @Value("${stripe.publishable-key:}")
    private String stripePublishableKey;

    public PaymentController(PaymentService paymentService, StripeService stripeService, PayPalService payPalService) {
        this.paymentService = paymentService;
        this.stripeService = stripeService;
        this.payPalService = payPalService;
    }



    // ── Offline / Pay After Service ──────────────────────────────────────────────
    @PostMapping("/offline/create/{bookingId}")
    public ResponseEntity<PaymentDto> createOfflinePayment(
            @PathVariable(name = "bookingId") Long bookingId) {
        return ResponseEntity.ok(paymentService.createOfflinePayment(Objects.requireNonNull(bookingId)));
    }

    @PostMapping("/offline/confirm/{paymentId}")
    public ResponseEntity<PaymentDto> confirmOfflinePayment(
            @PathVariable(name = "paymentId") Long paymentId) {
        return ResponseEntity.ok(paymentService.confirmOfflinePayment(Objects.requireNonNull(paymentId)));
    }

    // ── Razorpay ─────────────────────────────────────────────────────────────────
    @PostMapping({"/razorpay/create-order", "/create-order"})
    public ResponseEntity<Map<String, String>> createRazorpayOrder(@RequestBody Map<String, Object> request) {
        Long bookingId = Long.parseLong(Objects.requireNonNull(request.get("bookingId")).toString());
        return ResponseEntity.ok(paymentService.createRazorpayOrder(bookingId));
    }

    @PostMapping({"/razorpay/verify", "/verify"})
    public ResponseEntity<PaymentDto> verifyRazorpayPayment(@RequestBody Map<String, String> request) {
        String orderId = Objects.requireNonNull(request.get("razorpay_order_id"));
        String paymentId = Objects.requireNonNull(request.get("razorpay_payment_id"));
        String signature = Objects.requireNonNull(request.get("razorpay_signature"));
        return ResponseEntity.ok(paymentService.verifyRazorpayPayment(orderId, paymentId, signature));
    }

    // ── Stripe ───────────────────────────────────────────────────────────────────
    @PostMapping("/stripe/create-intent")
    public ResponseEntity<Map<String, String>> createStripeIntent(@RequestBody Map<String, Object> request) {
        Long bookingId = Long.parseLong(Objects.requireNonNull(request.get("bookingId")).toString());
        StripeService.StripeIntentResponse resp = stripeService.createPaymentIntent(bookingId);
        return ResponseEntity.ok(Map.of("clientSecret", resp.getClientSecret(), "paymentIntentId", resp.getPaymentIntentId()));
    }

    @PostMapping("/stripe/webhook")
    public ResponseEntity<Void> stripeWebhook(@RequestBody String payload, @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        if (signature == null || signature.isBlank()) return ResponseEntity.badRequest().build();
        stripeService.handleWebhook(Objects.requireNonNull(payload), Objects.requireNonNull(signature));
        return ResponseEntity.ok().build();
    }

    // ── PayPal ────────────────────────────────────────────────────────────────────
    @PostMapping("/paypal/create-order")
    public ResponseEntity<Map<String, String>> createPayPalOrder(@RequestBody Map<String, Object> request) {
        Long bookingId = Long.parseLong(Objects.requireNonNull(request.get("bookingId")).toString());
        PayPalService.PayPalOrderResponse resp = payPalService.createOrder(bookingId);
        return ResponseEntity.ok(Map.of("orderId", resp.getOrderId(), "approveUrl", resp.getApproveUrl() != null ? resp.getApproveUrl() : ""));
    }

    @PostMapping("/paypal/capture")
    public ResponseEntity<PaymentDto> capturePayPalOrder(@RequestBody Map<String, Object> request) {
        String orderId = Objects.requireNonNull(request.get("orderId")).toString();
        return ResponseEntity.ok(payPalService.captureOrder(Objects.requireNonNull(orderId)));
    }

    // ── Legacy / Admin ────────────────────────────────────────────────────────────
    @PostMapping("/process")
    public ResponseEntity<PaymentDto> processPayment(@RequestBody Map<String, Object> request) {
        Long bookingId = Long.parseLong(Objects.requireNonNull(request.get("bookingId")).toString());
        String paymentMethod = Objects.requireNonNull(request.get("paymentMethod")).toString();
        String transactionId = request.get("transactionId") != null ? request.get("transactionId").toString() : null;
        return ResponseEntity.ok(paymentService.processPayment(bookingId, Objects.requireNonNull(paymentMethod), transactionId));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentDto> getPaymentByBooking(@PathVariable(name = "bookingId") Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBooking(Objects.requireNonNull(bookingId)));
    }

    // ── Frontend Feature Detection ─────────────────────────────────────────────
    /**
     * Returns whether Razorpay is configured on the server.
     * Frontend uses this to show/hide online payment option.
     * If razorpayEnabled=false, frontend shows only "Pay After Service".
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getPaymentConfig() {
        boolean razorpayEnabled = paymentService.isRazorpayConfigured();
        Map<String, Object> config = new java.util.HashMap<>();
        config.put("razorpayEnabled", razorpayEnabled);
        if (razorpayEnabled) {
            // Only expose the public key ID (never the secret)
            config.put("razorpayKeyId", System.getenv("RAZORPAY_KEY_ID"));
        } else {
            config.put("message", "Online payment currently unavailable. Please use 'Pay After Service'.");
        }
        return ResponseEntity.ok(config);
    }
}
