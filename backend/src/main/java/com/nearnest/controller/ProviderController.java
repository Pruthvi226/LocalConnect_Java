package com.nearnest.controller;

import com.nearnest.dto.BookingDto;
import com.nearnest.dto.ProviderSummaryDto;
import com.nearnest.dto.ServiceDto;
import com.nearnest.dto.TransactionDto;
import com.nearnest.model.Booking.BookingStatus;
import com.nearnest.service.BookingService;
import com.nearnest.service.ProviderDashboardService;
import com.nearnest.service.ServiceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.web.PageableDefault;

import java.util.List;

@RestController
@RequestMapping("/api/provider")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class ProviderController {
    private final ProviderDashboardService dashboardService;
    private final ServiceService serviceService;
    private final BookingService bookingService;

    public ProviderController(ProviderDashboardService dashboardService, ServiceService serviceService,
                             BookingService bookingService) {
        this.dashboardService = dashboardService;
        this.serviceService = serviceService;
        this.bookingService = bookingService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ProviderSummaryDto> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/services")
    public ResponseEntity<List<ServiceDto>> getMyServices() {
        return ResponseEntity.ok(serviceService.getMyServices());
    }

    @GetMapping("/bookings")
    public ResponseEntity<Page<BookingDto>> getProviderBookings(
            @RequestParam(name = "status", required = false) BookingStatus status,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(dashboardService.getProviderBookings(status, pageable));
    }

    @PutMapping("/bookings/{id}")
    public ResponseEntity<BookingDto> updateBookingStatus(@PathVariable(name = "id") Long id,
                                                   @RequestParam(name = "status", required = false) BookingStatus status,
                                                   @RequestParam(name = "notes", required = false) String notes,
                                                   @RequestParam(name = "beforeImageUrl", required = false) String beforeImageUrl,
                                                   @RequestParam(name = "afterImageUrl", required = false) String afterImageUrl,
                                                   @RequestParam(name = "providerLat", required = false) Double providerLat,
                                                   @RequestParam(name = "providerLng", required = false) Double providerLng,
                                                   @RequestParam(name = "etaMinutes", required = false) Integer etaMinutes,
                                                   @RequestParam(name = "pin", required = false) String pin) {
        return ResponseEntity.ok(bookingService.updateBooking(java.util.Objects.requireNonNull(id), status, notes, beforeImageUrl, afterImageUrl, providerLat, providerLng, etaMinutes, pin));
    }

    @GetMapping("/transactions")
    public ResponseEntity<Page<TransactionDto>> getProviderTransactions(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(dashboardService.getProviderTransactions(pageable));
    }
}
