package com.localservicefinder.controller;

import com.localservicefinder.model.Payment;
import com.localservicefinder.service.PaymentService;
import com.localservicefinder.service.StripeService;
import com.localservicefinder.service.PayPalService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

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

    @GetMapping("/config")
    public ResponseEntity<?> getPaymentConfig() {
        return ResponseEntity.ok(Map.of(
                "stripePublishableKey", stripePublishableKey != null ? stripePublishableKey : "",
                "stripeEnabled", stripeService.isConfigured(),
                "paypalEnabled", payPalService.isConfigured()
        ));
    }

    @PostMapping("/stripe/create-intent")
    public ResponseEntity<?> createStripeIntent(@RequestBody Map<String, Object> request) {
        try {
            Long bookingId = Long.parseLong(request.get("bookingId").toString());
            StripeService.StripeIntentResponse resp = stripeService.createPaymentIntent(bookingId);
            return ResponseEntity.ok(Map.of("clientSecret", resp.getClientSecret(), "paymentIntentId", resp.getPaymentIntentId()));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/stripe/webhook")
    public ResponseEntity<?> stripeWebhook(@RequestBody String payload, @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        try {
            if (signature == null || signature.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing signature"));
            }
            stripeService.handleWebhook(payload, signature);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/paypal/create-order")
    public ResponseEntity<?> createPayPalOrder(@RequestBody Map<String, Object> request) {
        try {
            Long bookingId = Long.parseLong(request.get("bookingId").toString());
            PayPalService.PayPalOrderResponse resp = payPalService.createOrder(bookingId);
            return ResponseEntity.ok(Map.of("orderId", resp.getOrderId(), "approveUrl", resp.getApproveUrl() != null ? resp.getApproveUrl() : ""));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/paypal/capture")
    public ResponseEntity<?> capturePayPalOrder(@RequestBody Map<String, Object> request) {
        try {
            String orderId = request.get("orderId").toString();
            Payment payment = payPalService.captureOrder(orderId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> request) {
        try {
            Long bookingId = Long.parseLong(request.get("bookingId").toString());
            String paymentMethod = request.get("paymentMethod").toString();
            String transactionId = request.get("transactionId") != null ? 
                    request.get("transactionId").toString() : null;

            Payment payment = paymentService.processPayment(bookingId, paymentMethod, transactionId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentByBooking(@PathVariable Long bookingId) {
        try {
            Optional<Payment> payment = paymentService.getPaymentByBooking(bookingId);
            if (payment.isPresent()) {
                return ResponseEntity.ok(payment.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
