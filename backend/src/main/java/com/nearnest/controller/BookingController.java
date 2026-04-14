package com.nearnest.controller;

import com.nearnest.dto.BookingCreateRequest;
import com.nearnest.dto.BookingDto;
import com.nearnest.model.Booking.BookingStatus;
import com.nearnest.service.BookingService;
import com.nearnest.service.InvoiceService;
import com.nearnest.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.lang.NonNull;

import java.util.Map;
import java.util.Objects;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    @Autowired
    BookingService bookingService;

    @Autowired
    InvoiceService invoiceService;

    @Autowired
    AuthService authService;

    @GetMapping
    public ResponseEntity<Page<BookingDto>> getUserBookings(
            @RequestParam(name = "status", required = false) BookingStatus status,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(bookingService.getUserBookingsPaginated(status, Objects.requireNonNull(pageable)));
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> getBookingInvoice(@NonNull @PathVariable Long id) {
        com.nearnest.model.User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        com.nearnest.model.Booking booking = bookingService.getBookingEntityById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Security check
        boolean isOwner = booking.getUser().getId().equals(currentUser.getId());
        boolean isProvider = booking.getService().getProvider().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == com.nearnest.model.User.Role.ADMIN;

        if (!isOwner && !isProvider && !isAdmin) {
            return ResponseEntity.status(403).build();
        }

        byte[] pdfContent = invoiceService.generateInvoicePdf(booking);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=invoice_" + id + ".pdf")
                .body(pdfContent);
    }

    @GetMapping("/user")
    public ResponseEntity<Page<BookingDto>> getUserBookingsAlias(
            @RequestParam(name = "status", required = false) BookingStatus status,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(bookingService.getUserBookingsPaginated(status, Objects.requireNonNull(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDto> getBookingById(@PathVariable(name = "id") Long id) {
        return bookingService.getBookingById(Objects.requireNonNull(id))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingCreateRequest request) {
        try {
            if (request.getServiceId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "serviceId is required"));
            }
            if (request.getBookingDate() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "bookingDate is required"));
            }
            
            BookingDto dto = bookingService.createBooking(
                    Objects.requireNonNull(request.getServiceId()),
                    Objects.requireNonNull(request.getBookingDate()),
                    request.getNotes(),
                    request.getIsEmergency(),
                    request.getProblemImageUrl(),
                    request.getPaymentMethod() != null ? request.getPaymentMethod() : "ONLINE"
            );
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Internal Server Error"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingDto> updateBooking(
            @PathVariable(name = "id") Long id,
            @RequestParam(name = "status", required = false) BookingStatus status,
            @RequestParam(name = "notes", required = false) String notes,
            @RequestParam(name = "beforeImageUrl", required = false) String beforeImageUrl,
            @RequestParam(name = "afterImageUrl", required = false) String afterImageUrl,
            @RequestParam(name = "providerLat", required = false) Double providerLat,
            @RequestParam(name = "providerLng", required = false) Double providerLng,
            @RequestParam(name = "etaMinutes", required = false) Integer etaMinutes,
            @RequestParam(name = "pin", required = false) String pin) {
        return ResponseEntity.ok(bookingService.updateBooking(Objects.requireNonNull(id), status, notes, beforeImageUrl, afterImageUrl, providerLat, providerLng, etaMinutes, pin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable(name = "id") Long id) {
        bookingService.cancelBooking(Objects.requireNonNull(id));
        return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<BookingDto> acceptBooking(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(bookingService.updateBooking(Objects.requireNonNull(id), BookingStatus.ACCEPTED, "Booking accepted by provider"));
    }

    @PostMapping("/{id}/propose-price")
    public ResponseEntity<BookingDto> proposePrice(
            @PathVariable(name = "id") Long id,
            @RequestBody Map<String, java.math.BigDecimal> request) {
        return ResponseEntity.ok(bookingService.proposePrice(Objects.requireNonNull(id), request.get("price")));
    }

    @PostMapping("/{id}/accept-price")
    public ResponseEntity<BookingDto> acceptPrice(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(bookingService.acceptPrice(Objects.requireNonNull(id)));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<BookingDto> completeBooking(
            @PathVariable(name = "id") Long id,
            @RequestBody(required = false) com.nearnest.dto.BookingCompletionRequest request) {
        String paymentStatus = (request != null) ? request.getPaymentStatus() : "PAID";
        return ResponseEntity.ok(bookingService.completeBooking(Objects.requireNonNull(id), paymentStatus));
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancelBookingPost(@RequestBody Map<String, Long> request) {
        Long bookingId = request.get("bookingId");
        bookingService.cancelBooking(Objects.requireNonNull(bookingId));
        return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
    }
}
