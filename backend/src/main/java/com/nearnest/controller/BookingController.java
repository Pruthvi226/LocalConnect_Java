package com.nearnest.controller;

import com.nearnest.dto.BookingCreateRequest;
import com.nearnest.dto.BookingDto;
import com.nearnest.model.Booking.BookingStatus;
import com.nearnest.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    @Autowired
    BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<BookingDto>> getUserBookings() {
        return ResponseEntity.ok(bookingService.getUserBookings());
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<BookingDto>> getUserBookingsPaginated(Pageable pageable) {
        return ResponseEntity.ok(bookingService.getUserBookingsPaginated(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDto> getBookingById(@PathVariable(name = "id") Long id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<BookingDto> createBooking(
            @RequestParam(name = "serviceId") Long serviceId,
            @RequestParam(name = "bookingDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime bookingDate,
            @RequestParam(name = "notes", required = false) String notes,
            @RequestParam(name = "isEmergency", required = false) Boolean isEmergency,
            @RequestParam(name = "problemImageUrl", required = false) String problemImageUrl) {
        return ResponseEntity.ok(bookingService.createBooking(serviceId, bookingDate, notes, isEmergency, problemImageUrl));
    }

    @PostMapping("/create")
    public ResponseEntity<BookingDto> createBookingFromBody(@Valid @RequestBody BookingCreateRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(
                request.getServiceId(),
                request.getBookingDate(),
                request.getNotes(),
                request.getIsEmergency(),
                request.getProblemImageUrl()
        ));
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
            @RequestParam(name = "etaMinutes", required = false) Integer etaMinutes) {
        return ResponseEntity.ok(bookingService.updateBooking(id, status, notes, beforeImageUrl, afterImageUrl, providerLat, providerLng, etaMinutes));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable(name = "id") Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
    }
}
